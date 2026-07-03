'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'
import { generateUniqueSlug } from '@/lib/slugify'
import {
  callOpenAI,
  buildPrompt,
  validateAndNormalize,
  buildQuestionCreateData,
  ALL_FORMATS,
  type QuizFormat,
} from '@/app/studio/actions/ai-generate'

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const bulkGenerateSchema = z.object({
  topic: z.string().trim().min(3).max(200),
  categoryId: z.string().cuid(),
  quizCount: z.coerce.number().int().min(2).max(5).default(3),
  questionsPerQuiz: z.coerce.number().int().min(5).max(15).default(10),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
  format: z.enum(ALL_FORMATS).default('TEXT_CHOICE'),
})

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BulkAiGeneratedQuiz {
  quizId: string
  title: string
}

export type BulkAiGenerateResult =
  | { ok: true; quizzes: BulkAiGeneratedQuiz[] }
  | {
      ok: false
      error: 'UNAUTHORIZED' | 'FORBIDDEN' | 'VALIDATION_ERROR' | 'AI_ERROR'
      message: string
      partialQuizzes?: BulkAiGeneratedQuiz[]
    }

// ---------------------------------------------------------------------------
// Sub-topic angles for variation
// ---------------------------------------------------------------------------

function generateSubTopicAngles(topic: string, count: number): string[] {
  const angles = [
    `${topic} — fundamentals and basics`,
    `${topic} — advanced concepts and nuances`,
    `${topic} — history, origins, and key figures`,
    `${topic} — famous examples and case studies`,
    `${topic} — common misconceptions and surprising facts`,
  ]
  return angles.slice(0, count)
}

// ---------------------------------------------------------------------------
// Generate a single quiz (reused per quiz in the bulk loop)
// ---------------------------------------------------------------------------

async function generateOneQuiz(
  topic: string,
  categoryId: string,
  questionsPerQuiz: number,
  difficulty: string,
  format: QuizFormat,
  authorId: string
): Promise<BulkAiGeneratedQuiz> {
  const prompt = buildPrompt(topic, questionsPerQuiz, difficulty, format)
  const raw = await callOpenAI(prompt)
  const generated = validateAndNormalize(raw, format)

  const slug = await generateUniqueSlug(generated.title.slice(0, 120), (s) =>
    prisma.quiz.findUnique({ where: { slug: s } }).then((q) => !!q)
  )

  const quiz = await prisma.quiz.create({
    data: {
      title: generated.title.slice(0, 120),
      slug,
      description: generated.description.slice(0, 500),
      authorId,
      categoryId,
      difficulty: difficulty as 'EASY' | 'MEDIUM' | 'HARD',
      format,
      isPublished: false,
    },
    select: { id: true },
  })

  await prisma.$transaction(
    generated.questions.map((q, index) =>
      prisma.question.create({
        data: buildQuestionCreateData(q, format, quiz.id, index),
      })
    )
  )

  return { quizId: quiz.id, title: generated.title }
}

// ---------------------------------------------------------------------------
// Export: bulk generate quizzes
// ---------------------------------------------------------------------------

export async function bulkGenerateQuizzes(formData: FormData): Promise<BulkAiGenerateResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'UNAUTHORIZED', message: 'Please sign in.' }
  }

  if (session.user.role !== 'ADMIN') {
    return {
      ok: false,
      error: 'FORBIDDEN',
      message: 'Only admins can bulk generate quizzes with AI.',
    }
  }

  const parsed = bulkGenerateSchema.safeParse({
    topic: formData.get('topic'),
    categoryId: formData.get('categoryId'),
    quizCount: formData.get('quizCount'),
    questionsPerQuiz: formData.get('questionsPerQuiz'),
    difficulty: formData.get('difficulty'),
    format: formData.get('format') || undefined,
  })

  if (!parsed.success) {
    return {
      ok: false,
      error: 'VALIDATION_ERROR',
      message: 'Invalid input. Check your settings.',
    }
  }

  const { topic, categoryId, quizCount, questionsPerQuiz, difficulty, format } = parsed.data
  const subTopics = generateSubTopicAngles(topic, quizCount)
  const generated: BulkAiGeneratedQuiz[] = []

  for (let i = 0; i < quizCount; i++) {
    try {
      const result = await generateOneQuiz(
        subTopics[i],
        categoryId,
        questionsPerQuiz,
        difficulty,
        format,
        session.user.id
      )
      generated.push(result)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown AI error'

      // If at least one quiz was generated, return partial success
      if (generated.length > 0) {
        return {
          ok: false,
          error: 'AI_ERROR',
          message: `Quiz ${i + 1} of ${quizCount} failed: ${message}. ${generated.length} quiz(zes) were saved as drafts.`,
          partialQuizzes: generated,
        }
      }

      return {
        ok: false,
        error: 'AI_ERROR',
        message: `AI generation failed on quiz 1: ${message}`,
      }
    }
  }

  // Log admin action
  await prisma.adminAction.create({
    data: {
      actorId: session.user.id,
      action: 'QUIZ_BULK_AI_GENERATE',
      targetType: 'QuizBulkGenerate',
      targetId: generated[0]?.quizId ?? 'none',
      meta: {
        generatedCount: generated.length,
        topic,
        quizIds: generated.map((g) => g.quizId),
      },
    },
  })

  revalidatePath('/studio')
  revalidatePath('/admin/quizzes')

  return { ok: true, quizzes: generated }
}
