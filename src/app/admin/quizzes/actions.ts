'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'
import { formatCorrectAnswer } from '@/domain/format-correct-answer'
import { factCheckQuestions, type FactCheckVerdict } from '@/server/fact-check-utils'

type AdminActionResult = { ok: true } | { ok: false; message: string }

async function assertAdmin() {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false as const, message: 'Please sign in.' }
  }
  if (session.user.role !== 'ADMIN') {
    return { ok: false as const, message: 'Admin only.' }
  }
  return { ok: true as const, userId: session.user.id }
}

export async function toggleQuizPublished(
  formData: FormData
): Promise<{ ok: boolean; message?: string }> {
  const parsed = z
    .object({
      quizId: z.string().cuid(),
      publish: z.enum(['true', 'false']),
    })
    .safeParse({
      quizId: formData.get('quizId'),
      publish: formData.get('publish'),
    })

  if (!parsed.success) {
    return { ok: false, message: 'Invalid publish payload.' }
  }

  const guard = await assertAdmin()
  if (!guard.ok) return guard satisfies AdminActionResult

  const quiz = await prisma.quiz.findUnique({
    where: { id: parsed.data.quizId },
    select: { id: true },
  })

  if (!quiz) {
    return { ok: false, message: 'Quiz not found.' }
  }

  const isPublished = parsed.data.publish === 'true'

  await prisma.$transaction(async (tx) => {
    await tx.quiz.update({
      where: { id: parsed.data.quizId },
      data: { isPublished },
    })

    await tx.adminAction.create({
      data: {
        actorId: guard.userId,
        action: isPublished ? 'QUIZ_PUBLISH' : 'QUIZ_UNPUBLISH',
        targetType: 'Quiz',
        targetId: parsed.data.quizId,
        meta: { publish: isPublished },
      },
    })
  })

  revalidatePath('/admin/quizzes')
  return { ok: true }
}

export async function deleteQuiz(formData: FormData): Promise<{ ok: boolean; message?: string }> {
  const parsed = z
    .object({
      quizId: z.string().cuid(),
    })
    .safeParse({
      quizId: formData.get('quizId'),
    })

  if (!parsed.success) {
    return { ok: false, message: 'Invalid quiz delete payload.' }
  }

  const guard = await assertAdmin()
  if (!guard.ok) return guard satisfies AdminActionResult

  const quiz = await prisma.quiz.findUnique({
    where: { id: parsed.data.quizId },
    select: { id: true },
  })

  if (!quiz) {
    return { ok: false, message: 'Quiz not found.' }
  }

  await prisma.$transaction(async (tx) => {
    await tx.quiz.delete({ where: { id: parsed.data.quizId } })
    await tx.adminAction.create({
      data: {
        actorId: guard.userId,
        action: 'QUIZ_DELETE',
        targetType: 'Quiz',
        targetId: parsed.data.quizId,
        meta: {},
      },
    })
  })

  revalidatePath('/admin/quizzes')
  return { ok: true }
}

export interface FactCheckedQuestionSummary {
  order: number
  prompt: string
  correctAnswerText: string
}

export type FactCheckActionResult =
  | {
      ok: true
      quizTitle: string
      questions: FactCheckedQuestionSummary[]
      verdicts: FactCheckVerdict[]
      flaggedCount: number
      reportCreated: boolean
    }
  | { ok: false; message: string }

/** Runs an AI second-look pass over a quiz's answers — draft or published —
 *  and, when anything looks wrong, files it as a Report (reason:
 *  INCORRECT_ANSWERS) so it lands in the same admin queue as user-submitted
 *  reports. */
export async function factCheckQuiz(quizId: string): Promise<FactCheckActionResult> {
  const guard = await assertAdmin()
  if (!guard.ok) return guard

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    select: {
      id: true,
      title: true,
      questions: {
        orderBy: { order: 'asc' },
        select: {
          order: true,
          type: true,
          prompt: true,
          explanation: true,
          meta: true,
          choices: { select: { text: true, isCorrect: true, meta: true } },
        },
      },
    },
  })

  if (!quiz) {
    return { ok: false, message: 'Quiz not found.' }
  }
  if (quiz.questions.length === 0) {
    return { ok: false, message: 'This quiz has no questions to check.' }
  }

  const questionInputs = quiz.questions.map((q) => ({
    order: q.order,
    type: q.type,
    prompt: q.prompt,
    explanation: q.explanation,
    meta: q.meta as Record<string, unknown> | null,
    choices: q.choices.map((c) => ({
      text: c.text,
      isCorrect: c.isCorrect,
      meta: c.meta as Record<string, unknown> | null,
    })),
  }))

  let verdicts: FactCheckVerdict[]
  try {
    verdicts = await factCheckQuestions(quiz.title, questionInputs)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown AI error'
    return { ok: false, message: `Fact-check failed: ${message}` }
  }

  const flagged = verdicts.filter((v) => v.verdict !== 'correct')
  let reportCreated = false

  if (flagged.length > 0) {
    const detailLines = flagged.map((v) => {
      const suggestion = v.suggestedAnswer ? ` Suggested answer: ${v.suggestedAnswer}.` : ''
      return `Q${v.questionOrder + 1} (${v.verdict}): ${v.reasoning}${suggestion}`
    })

    await prisma.report.create({
      data: {
        quizId: quiz.id,
        reporterId: null,
        reason: 'INCORRECT_ANSWERS',
        status: 'PENDING',
        details: `🤖 AI fact-check flagged ${flagged.length} of ${quiz.questions.length} question(s):\n\n${detailLines.join('\n\n')}`,
      },
    })
    reportCreated = true
  }

  await prisma.adminAction.create({
    data: {
      actorId: guard.userId,
      action: 'QUIZ_AI_FACT_CHECK',
      targetType: 'Quiz',
      targetId: quiz.id,
      meta: {
        totalQuestions: quiz.questions.length,
        flaggedCount: flagged.length,
        reportCreated,
      },
    },
  })

  if (reportCreated) {
    revalidatePath('/admin/reports')
  }

  return {
    ok: true,
    quizTitle: quiz.title,
    questions: questionInputs.map((q) => ({
      order: q.order,
      prompt: q.prompt,
      correctAnswerText: formatCorrectAnswer(q),
    })),
    verdicts,
    flaggedCount: flagged.length,
    reportCreated,
  }
}
