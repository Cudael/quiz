'use server'

import { revalidatePath } from 'next/cache'
import type { Prisma } from '@prisma/client'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'
import { draftQuizSchema } from '@/schemas'

export type QuizMetaActionResult =
  | { ok: true; quizId: string }
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
  }

  const quiz = await prisma.quiz.create({ data })

  revalidatePath('/studio')
  return { ok: true, quizId: quiz.id }
}
