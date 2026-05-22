'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'
import { quizSchema } from '@/schemas'

const quizInputSchema = quizSchema

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

  const parsed = quizInputSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    categoryId: formData.get('categoryId'),
    difficulty: formData.get('difficulty'),
    isPublished: formData.get('isPublished') === 'on',
  })

  if (!parsed.success) {
    return { ok: false, error: 'VALIDATION_ERROR', message: 'Invalid quiz input.' }
  }

  const quiz = await prisma.quiz.create({
    data: {
      ...parsed.data,
      authorId: session.user.id,
    },
  })

  revalidatePath('/studio')
  return { ok: true, quizId: quiz.id }
}
