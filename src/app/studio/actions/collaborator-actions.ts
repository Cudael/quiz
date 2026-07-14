'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'
import { assertQuizOwner, quizIdSchema, type ActionResult } from './_shared'

const MAX_COLLABORATORS = 5

export async function addCollaborator(formData: FormData): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'UNAUTHORIZED', message: 'Please sign in.' }
  }

  const schema = z.object({
    quizId: quizIdSchema,
    username: z.string().trim().min(1).max(64),
  })
  const parsed = schema.safeParse({
    quizId: formData.get('quizId'),
    username: formData.get('username'),
  })
  if (!parsed.success) {
    return { ok: false, error: 'VALIDATION_ERROR', message: 'Invalid collaborator payload.' }
  }

  const allowed = await assertQuizOwner(parsed.data.quizId, session.user.id, session.user.role)
  if (!allowed.ok) return allowed

  const [quiz, collaborator, count] = await Promise.all([
    prisma.quiz.findUnique({
      where: { id: parsed.data.quizId },
      select: { id: true, title: true, authorId: true },
    }),
    prisma.user.findUnique({
      where: { username: parsed.data.username.toLowerCase() },
      select: { id: true },
    }),
    prisma.quizCollaborator.count({ where: { quizId: parsed.data.quizId } }),
  ])

  if (!quiz) {
    return { ok: false, error: 'NOT_FOUND', message: 'Quiz not found.' }
  }
  if (!collaborator) {
    return { ok: false, error: 'NOT_FOUND', message: 'No user found with that username.' }
  }
  if (collaborator.id === quiz.authorId) {
    return { ok: false, error: 'VALIDATION_ERROR', message: 'The author is already an owner.' }
  }
  if (count >= MAX_COLLABORATORS) {
    return {
      ok: false,
      error: 'VALIDATION_ERROR',
      message: `A quiz can have at most ${MAX_COLLABORATORS} co-authors.`,
    }
  }

  await prisma.quizCollaborator.upsert({
    where: { quizId_userId: { quizId: quiz.id, userId: collaborator.id } },
    create: { quizId: quiz.id, userId: collaborator.id, invitedById: session.user.id },
    update: {},
  })

  await prisma.notification.create({
    data: {
      userId: collaborator.id,
      type: 'COLLAB_INVITE',
      title: 'You are now a co-author!',
      message: `${session.user.username ?? 'Someone'} added you as a co-author on “${quiz.title}”.`,
      meta: { quizId: quiz.id },
    },
  })

  revalidatePath(`/studio/quiz/${quiz.id}/edit`)
  return { ok: true }
}

export async function removeCollaborator(formData: FormData): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'UNAUTHORIZED', message: 'Please sign in.' }
  }

  const schema = z.object({
    quizId: quizIdSchema,
    userId: z.string().cuid(),
  })
  const parsed = schema.safeParse({
    quizId: formData.get('quizId'),
    userId: formData.get('userId'),
  })
  if (!parsed.success) {
    return { ok: false, error: 'VALIDATION_ERROR', message: 'Invalid payload.' }
  }

  // Owners can remove anyone; collaborators can remove themselves (leave).
  const isSelf = parsed.data.userId === session.user.id
  if (!isSelf) {
    const allowed = await assertQuizOwner(parsed.data.quizId, session.user.id, session.user.role)
    if (!allowed.ok) return allowed
  }

  await prisma.quizCollaborator.deleteMany({
    where: { quizId: parsed.data.quizId, userId: parsed.data.userId },
  })

  revalidatePath(`/studio/quiz/${parsed.data.quizId}/edit`)
  revalidatePath('/studio')
  return { ok: true }
}
