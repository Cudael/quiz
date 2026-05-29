'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'

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
