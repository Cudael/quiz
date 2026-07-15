'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'
import { HOME_STATIC_DATA_TAG } from '@/server/home-quiz-cache'
import { assertOwnership, assertQuizOwner, quizIdSchema, type ActionResult } from './_shared'

const MAX_REVISIONS_PER_QUIZ = 20

interface QuizSnapshot {
  title: string
  description: string
  coverImage: string | null
  categoryId: string
  difficulty: string
  format: string
  defaultTimeLimitSec: number | null
  questions: Array<{
    type: string
    prompt: string
    imageUrl: string | null
    explanation: string | null
    timeLimitSec: number
    points: number
    order: number
    meta: unknown
    choices: Array<{
      text: string
      imageUrl: string | null
      isCorrect: boolean
      meta: unknown
    }>
  }>
}

async function buildSnapshot(quizId: string): Promise<QuizSnapshot | null> {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    select: {
      title: true,
      description: true,
      coverImage: true,
      categoryId: true,
      difficulty: true,
      format: true,
      defaultTimeLimitSec: true,
      questions: {
        orderBy: { order: 'asc' },
        select: {
          type: true,
          prompt: true,
          imageUrl: true,
          explanation: true,
          timeLimitSec: true,
          points: true,
          order: true,
          meta: true,
          choices: {
            select: { text: true, imageUrl: true, isCorrect: true, meta: true },
          },
        },
      },
    },
  })
  if (!quiz) return null
  return quiz as unknown as QuizSnapshot
}

/**
 * Saves a snapshot of the quiz's current state as a new revision.
 * Called manually from the revisions page and automatically on publish.
 */
export async function saveRevision(formData: FormData): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'UNAUTHORIZED', message: 'Please sign in.' }
  }

  const schema = z.object({
    quizId: quizIdSchema,
    note: z.string().trim().max(200).optional(),
  })
  const parsed = schema.safeParse({
    quizId: formData.get('quizId'),
    note: formData.get('note') || undefined,
  })
  if (!parsed.success) {
    return { ok: false, error: 'VALIDATION_ERROR', message: 'Invalid revision payload.' }
  }

  const allowed = await assertOwnership(parsed.data.quizId, session.user.id, session.user.role)
  if (!allowed.ok) return allowed

  const snapshot = await buildSnapshot(parsed.data.quizId)
  if (!snapshot) {
    return { ok: false, error: 'NOT_FOUND', message: 'Quiz not found.' }
  }

  await prisma.$transaction(async (tx) => {
    const latest = await tx.quizRevision.findFirst({
      where: { quizId: parsed.data.quizId },
      orderBy: { version: 'desc' },
      select: { version: true },
    })
    await tx.quizRevision.create({
      data: {
        quizId: parsed.data.quizId,
        version: (latest?.version ?? 0) + 1,
        snapshot: snapshot as unknown as Prisma.InputJsonValue,
        note: parsed.data.note ?? null,
        createdById: session.user.id,
      },
    })
    // Keep revision history bounded.
    const stale = await tx.quizRevision.findMany({
      where: { quizId: parsed.data.quizId },
      orderBy: { version: 'desc' },
      skip: MAX_REVISIONS_PER_QUIZ,
      select: { id: true },
    })
    if (stale.length > 0) {
      await tx.quizRevision.deleteMany({ where: { id: { in: stale.map((r) => r.id) } } })
    }
  })

  revalidatePath(`/studio/quiz/${parsed.data.quizId}/revisions`)
  return { ok: true }
}

/**
 * Restores the quiz's content (meta + questions) from a stored revision.
 * The current state is snapshotted first so the restore itself can be undone.
 */
export async function restoreRevision(formData: FormData): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'UNAUTHORIZED', message: 'Please sign in.' }
  }

  const schema = z.object({
    quizId: quizIdSchema,
    revisionId: z.string().cuid(),
  })
  const parsed = schema.safeParse({
    quizId: formData.get('quizId'),
    revisionId: formData.get('revisionId'),
  })
  if (!parsed.success) {
    return { ok: false, error: 'VALIDATION_ERROR', message: 'Invalid restore payload.' }
  }

  // Restoring rewrites content — owner only.
  const allowed = await assertQuizOwner(parsed.data.quizId, session.user.id, session.user.role)
  if (!allowed.ok) return allowed

  const revision = await prisma.quizRevision.findUnique({
    where: { id: parsed.data.revisionId },
    select: { quizId: true, version: true, snapshot: true },
  })
  if (!revision || revision.quizId !== parsed.data.quizId) {
    return { ok: false, error: 'NOT_FOUND', message: 'Revision not found.' }
  }

  const snapshot = revision.snapshot as unknown as QuizSnapshot
  const backup = await buildSnapshot(parsed.data.quizId)
  if (!backup) {
    return { ok: false, error: 'NOT_FOUND', message: 'Quiz not found.' }
  }

  await prisma.$transaction(async (tx) => {
    // Snapshot current state before overwriting.
    const latest = await tx.quizRevision.findFirst({
      where: { quizId: parsed.data.quizId },
      orderBy: { version: 'desc' },
      select: { version: true },
    })
    await tx.quizRevision.create({
      data: {
        quizId: parsed.data.quizId,
        version: (latest?.version ?? 0) + 1,
        snapshot: backup as unknown as Prisma.InputJsonValue,
        note: `Auto-backup before restoring v${revision.version}`,
        createdById: session.user.id,
      },
    })

    await tx.quiz.update({
      where: { id: parsed.data.quizId },
      data: {
        title: snapshot.title,
        description: snapshot.description ?? '',
        coverImage: snapshot.coverImage,
        categoryId: snapshot.categoryId,
        difficulty: snapshot.difficulty as never,
        format: snapshot.format as never,
        defaultTimeLimitSec: snapshot.defaultTimeLimitSec,
        isPublished: false,
        reviewStatus: 'DRAFT',
        submittedForReviewAt: null,
        reviewedAt: null,
      },
    })

    await tx.question.deleteMany({ where: { quizId: parsed.data.quizId } })
    for (const question of snapshot.questions) {
      await tx.question.create({
        data: {
          quizId: parsed.data.quizId,
          type: question.type as never,
          prompt: question.prompt,
          imageUrl: question.imageUrl,
          explanation: question.explanation,
          timeLimitSec: question.timeLimitSec,
          points: question.points,
          order: question.order,
          meta: (question.meta ?? Prisma.JsonNull) as Prisma.InputJsonValue,
          choices: {
            create: question.choices.map((choice) => ({
              text: choice.text,
              imageUrl: choice.imageUrl,
              isCorrect: choice.isCorrect,
              meta: (choice.meta ?? Prisma.JsonNull) as Prisma.InputJsonValue,
            })),
          },
        },
      })
    }
  })

  revalidatePath(`/studio/quiz/${parsed.data.quizId}/revisions`)
  revalidatePath(`/studio/quiz/${parsed.data.quizId}/edit`)
  revalidatePath('/studio')
  revalidateTag(HOME_STATIC_DATA_TAG, 'max')
  return { ok: true }
}
