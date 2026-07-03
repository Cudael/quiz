'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'
import { checkRateLimit } from '@/server/rate-limit'
import { generateUniqueSlug } from '@/lib/slugify'
import { assertOwnership } from './_shared'
import {
  callOpenAI,
  buildPrompt,
  validateAndNormalize,
  buildQuestionCreateData,
  generateSchema,
  generateQuestionsSchema,
} from '@/server/ai-generate-utils'
import type { QuizFormat, GeneratedQuiz } from '@/server/ai-generate-utils'

const AI_QUESTIONS_RATE_LIMIT = { limit: 10, windowMs: 60 * 60 * 1000 }

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

type AiGenerateResult =
  | { ok: true; quizId: string }
  | {
      ok: false
      error: 'UNAUTHORIZED' | 'FORBIDDEN' | 'EMAIL_NOT_VERIFIED' | 'VALIDATION_ERROR' | 'AI_ERROR'
      message: string
    }

type AiQuestionsResult =
  | { ok: true; added: number }
  | {
      ok: false
      error:
        | 'UNAUTHORIZED'
        | 'FORBIDDEN'
        | 'EMAIL_NOT_VERIFIED'
        | 'VALIDATION_ERROR'
        | 'NOT_FOUND'
        | 'RATE_LIMIT'
        | 'AI_ERROR'
      message: string
    }

// ---------------------------------------------------------------------------
// Export: generate full quiz with AI
// ---------------------------------------------------------------------------

export async function generateQuizWithAi(formData: FormData): Promise<AiGenerateResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'UNAUTHORIZED', message: 'Please sign in.' }
  }

  if (session.user.role !== 'ADMIN') {
    return { ok: false, error: 'FORBIDDEN', message: 'Only admins can generate quizzes with AI.' }
  }

  if (!session.user.emailVerified) {
    return {
      ok: false,
      error: 'EMAIL_NOT_VERIFIED',
      message: 'Please verify your email address before creating quizzes.',
    }
  }

  const parsed = generateSchema.safeParse({
    topic: formData.get('topic'),
    categoryId: formData.get('categoryId'),
    count: formData.get('count'),
    difficulty: formData.get('difficulty'),
    format: formData.get('format') || undefined,
  })

  if (!parsed.success) {
    return { ok: false, error: 'VALIDATION_ERROR', message: 'Invalid input. Check your settings.' }
  }

  const { topic, categoryId, count, difficulty, format } = parsed.data

  let generated: GeneratedQuiz
  try {
    const prompt = buildPrompt(topic, count, difficulty, format)
    const raw = await callOpenAI(prompt)
    generated = validateAndNormalize(raw, format)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown AI error'
    return { ok: false, error: 'AI_ERROR', message: `AI generation failed: ${message}` }
  }

  const slug = await generateUniqueSlug(generated.title.slice(0, 120), (s) =>
    prisma.quiz.findUnique({ where: { slug: s } }).then((q) => !!q)
  )
  const quiz = await prisma.quiz.create({
    data: {
      title: generated.title.slice(0, 120),
      slug,
      description: generated.description.slice(0, 500),
      authorId: session.user.id,
      categoryId,
      difficulty,
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

  revalidatePath('/studio')
  return { ok: true, quizId: quiz.id }
}

// ---------------------------------------------------------------------------
// Export: generate additional questions for existing quiz
// ---------------------------------------------------------------------------

export async function generateQuestionsWithAi(formData: FormData): Promise<AiQuestionsResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'UNAUTHORIZED', message: 'Please sign in.' }
  }
  if (!session.user.emailVerified) {
    return {
      ok: false,
      error: 'EMAIL_NOT_VERIFIED',
      message: 'Please verify your email address before using AI generation.',
    }
  }

  const parsed = generateQuestionsSchema.safeParse({
    quizId: formData.get('quizId'),
    topic: formData.get('topic') || undefined,
    count: formData.get('count') ?? undefined,
    difficulty: formData.get('difficulty') ?? undefined,
  })
  if (!parsed.success) {
    return { ok: false, error: 'VALIDATION_ERROR', message: 'Invalid input. Check your settings.' }
  }

  const allowed = await assertOwnership(parsed.data.quizId, session.user.id, session.user.role)
  if (!allowed.ok) return allowed

  if (!(await checkRateLimit(`ai-questions:${session.user.id}`, AI_QUESTIONS_RATE_LIMIT))) {
    return {
      ok: false,
      error: 'RATE_LIMIT',
      message: 'You have hit the AI generation limit. Try again later.',
    }
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id: parsed.data.quizId },
    select: {
      id: true,
      title: true,
      format: true,
      questions: { select: { prompt: true, order: true }, orderBy: { order: 'asc' } },
    },
  })
  if (!quiz) {
    return { ok: false, error: 'NOT_FOUND', message: 'Quiz not found.' }
  }

  const format = quiz.format as QuizFormat

  let generated: GeneratedQuiz
  try {
    const topic = parsed.data.topic || quiz.title
    const prompt = buildPrompt(topic, parsed.data.count, parsed.data.difficulty, format)
    const avoidList =
      quiz.questions.length > 0
        ? `\n\nDo NOT repeat or closely paraphrase any of these existing questions:\n${quiz.questions
            .slice(0, 30)
            .map((q) => `- ${q.prompt}`)
            .join('\n')}`
        : ''
    const raw = await callOpenAI(`${prompt}${avoidList}`)
    generated = validateAndNormalize(raw, format)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown AI error'
    return { ok: false, error: 'AI_ERROR', message: `AI generation failed: ${message}` }
  }

  const startOrder = (quiz.questions[quiz.questions.length - 1]?.order ?? -1) + 1

  await prisma.$transaction(
    generated.questions.map((q, index) =>
      prisma.question.create({
        data: buildQuestionCreateData(q, format, quiz.id, startOrder + index),
      })
    )
  )

  revalidatePath(`/studio/quiz/${quiz.id}/edit`)
  return { ok: true, added: generated.questions.length }
}
