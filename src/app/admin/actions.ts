'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
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
        meta: JSON.stringify({ reason: parsed.data.reason ?? null }),
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
    resolution: z.enum(['DISMISS', 'UNPUBLISH', 'DELETE']),
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

    await tx.adminAction.create({
      data: {
        actorId: guard.userId,
        action: REPORT_ACTION_MAP[parsed.data.resolution],
        targetType: 'Report',
        targetId: report.id,
        meta: JSON.stringify({ quizId: report.quizId }),
      },
    })
  })

  revalidatePath('/admin')
  return { ok: true }
}
