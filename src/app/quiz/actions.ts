'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'
import { ratingSchema, reportSchema } from '@/schemas'

export type RateResult =
  | { ok: true }
  | { ok: false; error: 'UNAUTHORIZED' | 'VALIDATION_ERROR'; message: string }

export async function rateQuiz(formData: FormData): Promise<RateResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'UNAUTHORIZED', message: 'Please sign in to rate this quiz.' }
  }

  const parsed = ratingSchema.safeParse({
    quizId: formData.get('quizId'),
    stars: Number(formData.get('stars')),
  })

  if (!parsed.success) {
    return { ok: false, error: 'VALIDATION_ERROR', message: 'Invalid rating payload.' }
  }

  const { quizId, stars } = parsed.data

  // Upsert: create or update the user's rating for this quiz
  await prisma.rating.upsert({
    where: {
      userId_quizId: {
        userId: session.user.id,
        quizId,
      },
    },
    create: {
      userId: session.user.id,
      quizId,
      stars,
    },
    update: {
      stars,
    },
  })

  revalidatePath(`/quiz/${quizId}`)
  revalidatePath(`/play/${quizId}/results`)

  return { ok: true }
}

export type ReportResult =
  | { ok: true }
  | { ok: false; error: 'UNAUTHORIZED' | 'VALIDATION_ERROR' | 'RATE_LIMIT'; message: string }

export async function reportQuiz(formData: FormData): Promise<ReportResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'UNAUTHORIZED', message: 'Please sign in to report a quiz.' }
  }

  const parsed = reportSchema.safeParse({
    quizId: formData.get('quizId'),
    questionId: formData.get('questionId') || undefined,
    reason: formData.get('reason'),
    details: formData.get('details') || undefined,
  })

  if (!parsed.success) {
    return { ok: false, error: 'VALIDATION_ERROR', message: 'Invalid report payload.' }
  }

  if (parsed.data.questionId) {
    const question = await prisma.question.findFirst({
      where: { id: parsed.data.questionId, quizId: parsed.data.quizId },
      select: { id: true },
    })
    if (!question) {
      return {
        ok: false,
        error: 'VALIDATION_ERROR',
        message: 'That question does not belong to this quiz.',
      }
    }
  }

  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const existing = await prisma.report.findFirst({
    where: {
      quizId: parsed.data.quizId,
      questionId: parsed.data.questionId ?? null,
      reporterId: session.user.id,
      createdAt: { gte: dayAgo },
    },
    select: { id: true },
  })
  if (existing) {
    return {
      ok: false,
      error: 'RATE_LIMIT',
      message: parsed.data.questionId
        ? 'You already reported this question recently.'
        : 'You can report this quiz once every 24 hours.',
    }
  }

  await prisma.report.create({
    data: {
      quizId: parsed.data.quizId,
      questionId: parsed.data.questionId,
      reporterId: session.user.id,
      reason: parsed.data.reason,
      details: parsed.data.details,
    },
  })

  return { ok: true }
}
