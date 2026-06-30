'use server'

import { revalidatePath } from 'next/cache'
import type { Prisma } from '@prisma/client'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'
import { draftQuizSchema } from '@/schemas'
import { generateUniqueSlug } from '@/lib/slugify'
import { evaluateBadges } from '@/domain/badges'

export type QuizMetaActionResult =
  | { ok: true; quizId: string; quizSlug: string }
  | {
      ok: false
      error: 'UNAUTHORIZED' | 'VALIDATION_ERROR'
      message: string
    }

export async function createQuizAndReturnId(formData: FormData): Promise<QuizMetaActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'UNAUTHORIZED', message: 'Please sign in.' }
  }

  const parsed = draftQuizSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    coverImage: formData.get('coverImage') || undefined,
    categoryId: formData.get('categoryId'),
    difficulty: formData.get('difficulty'),
    format: formData.get('format') || 'TEXT_CHOICE',
    defaultTimeLimitSec: formData.get('defaultTimeLimitSec')
      ? Number(formData.get('defaultTimeLimitSec'))
      : undefined,
    isPublished: formData.get('isPublished') === 'on',
  })

  if (!parsed.success) {
    return { ok: false, error: 'VALIDATION_ERROR', message: 'Invalid quiz input.' }
  }

  const data: Prisma.QuizUncheckedCreateInput = {
    ...parsed.data,
    coverImage: parsed.data.coverImage ?? null,
    authorId: session.user.id,
    slug: await generateUniqueSlug(parsed.data.title, (slug) =>
      prisma.quiz.findUnique({ where: { slug } }).then((q) => !!q)
    ),
  }

  // Verify the user still exists before creating to avoid FK violations
  // from stale JWT sessions where the user was deleted from the DB.
  const userExists = await prisma.user.count({ where: { id: session.user.id } })
  if (userExists === 0) {
    return { ok: false, error: 'UNAUTHORIZED', message: 'Session expired. Please sign in again.' }
  }

  const quiz = await prisma.quiz.create({ data })

  // Award badges for quiz-related achievements (e.g. Quiz Author)
  if (quiz.isPublished) {
    evaluateBadges(session.user.id, quiz.id).catch(() => {
      // Fire-and-forget — badge award failures shouldn't block quiz creation
    })
  }

  revalidatePath('/studio')
  return { ok: true, quizId: quiz.id, quizSlug: quiz.slug ?? '' }
}
