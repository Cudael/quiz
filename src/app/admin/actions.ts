'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'
import { slugify } from '@/lib/slugify'

type AdminResult =
  | { ok: true }
  | {
      ok: false
      error: 'UNAUTHORIZED' | 'FORBIDDEN' | 'VALIDATION_ERROR' | 'NOT_FOUND'
      message: string
    }

const REPORT_ACTION_MAP = {
  DISMISS: 'REPORT_DISMISS',
  UNPUBLISH: 'REPORT_UNPUBLISH',
  DELETE: 'REPORT_DELETE',
  HIDE_COMMENT: 'REPORT_HIDE_COMMENT',
  DELETE_COMMENT: 'REPORT_DELETE_COMMENT',
} as const

async function assertAdmin() {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false as const, error: 'UNAUTHORIZED' as const, message: 'Please sign in.' }
  }
  if (session.user.role !== 'ADMIN') {
    return { ok: false as const, error: 'FORBIDDEN' as const, message: 'Admin only.' }
  }
  return { ok: true as const, userId: session.user.id }
}

export async function reviewCategorySuggestion(formData: FormData): Promise<AdminResult> {
  const guard = await assertAdmin()
  if (!guard.ok) return guard

  const schema = z.object({
    suggestionId: z.string().cuid(),
    decision: z.enum(['APPROVE', 'REJECT']),
    reason: z.string().optional(),
  })
  const parsed = schema.safeParse({
    suggestionId: formData.get('suggestionId'),
    decision: formData.get('decision'),
    reason: formData.get('reason') || undefined,
  })
  if (!parsed.success) {
    return { ok: false, error: 'VALIDATION_ERROR', message: 'Invalid moderation payload.' }
  }

  const suggestion = await prisma.categorySuggestion.findUnique({
    where: { id: parsed.data.suggestionId },
  })
  if (!suggestion) {
    return { ok: false, error: 'NOT_FOUND', message: 'Suggestion not found.' }
  }

  const isApprove = parsed.data.decision === 'APPROVE'
  await prisma.$transaction(async (tx) => {
    await tx.categorySuggestion.update({
      where: { id: suggestion.id },
      data: {
        status: isApprove ? 'APPROVED' : 'REJECTED',
        reviewedAt: new Date(),
        reviewedById: guard.userId,
      },
    })

    if (isApprove) {
      await tx.category.create({
        data: {
          slug: slugify(suggestion.name),
          name: suggestion.name,
          description: suggestion.description,
          icon: suggestion.icon,
          color: suggestion.color,
          createdById: suggestion.suggestedById,
        },
      })
    }

    await tx.adminAction.create({
      data: {
        actorId: guard.userId,
        action: isApprove ? 'CATEGORY_SUGGESTION_APPROVED' : 'CATEGORY_SUGGESTION_REJECTED',
        targetType: 'CategorySuggestion',
        targetId: suggestion.id,
        meta: { reason: parsed.data.reason ?? null },
      },
    })
  })

  revalidatePath('/admin')
  return { ok: true }
}

export async function resolveReport(formData: FormData): Promise<AdminResult> {
  const guard = await assertAdmin()
  if (!guard.ok) return guard

  const schema = z.object({
    reportId: z.string().cuid(),
    resolution: z.enum(['DISMISS', 'UNPUBLISH', 'DELETE', 'HIDE_COMMENT', 'DELETE_COMMENT']),
  })
  const parsed = schema.safeParse({
    reportId: formData.get('reportId'),
    resolution: formData.get('resolution'),
  })
  if (!parsed.success) {
    return { ok: false, error: 'VALIDATION_ERROR', message: 'Invalid report action payload.' }
  }

  const report = await prisma.report.findUnique({
    where: { id: parsed.data.reportId },
    include: { quiz: true },
  })
  if (!report) {
    return { ok: false, error: 'NOT_FOUND', message: 'Report not found.' }
  }

  if (
    (parsed.data.resolution === 'HIDE_COMMENT' || parsed.data.resolution === 'DELETE_COMMENT') &&
    !report.commentId
  ) {
    return { ok: false, error: 'VALIDATION_ERROR', message: 'Report is not about a comment.' }
  }

  await prisma.$transaction(async (tx) => {
    await tx.report.update({
      where: { id: report.id },
      data: {
        status: parsed.data.resolution === 'DISMISS' ? 'DISMISSED' : 'ACTIONED',
        resolvedAt: new Date(),
        resolvedById: guard.userId,
      },
    })

    if (parsed.data.resolution === 'UNPUBLISH') {
      await tx.quiz.update({ where: { id: report.quizId }, data: { isPublished: false } })
    }
    if (parsed.data.resolution === 'DELETE') {
      await tx.quiz.delete({ where: { id: report.quizId } })
    }
    if (parsed.data.resolution === 'HIDE_COMMENT' && report.commentId) {
      await tx.quizComment.update({
        where: { id: report.commentId },
        data: { isHidden: true },
      })
    }
    if (parsed.data.resolution === 'DELETE_COMMENT' && report.commentId) {
      await tx.quizComment.delete({ where: { id: report.commentId } })
    }

    await tx.adminAction.create({
      data: {
        actorId: guard.userId,
        action: REPORT_ACTION_MAP[parsed.data.resolution],
        targetType: 'Report',
        targetId: report.id,
        meta: {
          quizId: report.quizId,
          ...(report.commentId ? { commentId: report.commentId } : {}),
          ...(report.questionId ? { questionId: report.questionId } : {}),
        },
      },
    })
  })

  revalidatePath('/admin')
  return { ok: true }
}

export async function updateFeedbackStatus(formData: FormData): Promise<AdminResult> {
  const guard = await assertAdmin()
  if (!guard.ok) return guard

  const schema = z.object({
    feedbackId: z.string().cuid(),
    newStatus: z.enum(['REVIEWED', 'RESOLVED']),
  })
  const parsed = schema.safeParse({
    feedbackId: formData.get('feedbackId'),
    newStatus: formData.get('newStatus'),
  })
  if (!parsed.success) {
    return { ok: false, error: 'VALIDATION_ERROR', message: 'Invalid feedback action payload.' }
  }

  const feedback = await prisma.feedback.findUnique({
    where: { id: parsed.data.feedbackId },
  })
  if (!feedback) {
    return { ok: false, error: 'NOT_FOUND', message: 'Feedback not found.' }
  }

  await prisma.$transaction(async (tx) => {
    await tx.feedback.update({
      where: { id: feedback.id },
      data: {
        status: parsed.data.newStatus,
        reviewedAt: new Date(),
        reviewedById: guard.userId,
      },
    })

    await tx.adminAction.create({
      data: {
        actorId: guard.userId,
        action: `FEEDBACK_${parsed.data.newStatus}`,
        targetType: 'Feedback',
        targetId: feedback.id,
        meta: {},
      },
    })
  })

  revalidatePath('/admin')
  return { ok: true }
}
