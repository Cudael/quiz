'use server'

import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'
import { reportSchema } from '@/schemas'

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
    reason: formData.get('reason'),
    details: formData.get('details') || undefined,
  })

  if (!parsed.success) {
    return { ok: false, error: 'VALIDATION_ERROR', message: 'Invalid report payload.' }
  }

  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const existing = await prisma.report.findFirst({
    where: {
      quizId: parsed.data.quizId,
      reporterId: session.user.id,
      createdAt: { gte: dayAgo },
    },
    select: { id: true },
  })
  if (existing) {
    return {
      ok: false,
      error: 'RATE_LIMIT',
      message: 'You can report this quiz once every 24 hours.',
    }
  }

  await prisma.report.create({
    data: {
      quizId: parsed.data.quizId,
      reporterId: session.user.id,
      reason: parsed.data.reason,
      details: parsed.data.details,
    },
  })

  return { ok: true }
}
