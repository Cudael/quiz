'use server'

import { revalidatePath } from 'next/cache'
import type { Prisma } from '@prisma/client'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'
import { draftQuizSchema, quizSchema } from '@/schemas'
import { assertEmailVerified, assertOwnership, quizIdSchema, type ActionResult } from './_shared'

const quizInputSchema = quizSchema

export async function togglePublish(formData: FormData): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'UNAUTHORIZED', message: 'Please sign in.' }
  }

  const parsed = quizIdSchema.safeParse(formData.get('quizId'))
  if (!parsed.success) {
    return { ok: false, error: 'VALIDATION_ERROR', message: 'Invalid quiz id.' }
  }

  const quizId = parsed.data
  const allowed = await assertOwnership(quizId, session.user.id, session.user.role)
  if (!allowed.ok) {
    return allowed
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    select: { isPublished: true },
  })
  if (!quiz) {
    return { ok: false, error: 'NOT_FOUND', message: 'Quiz not found.' }
  }

  await prisma.quiz.update({
    where: { id: quizId },
    data: { isPublished: !quiz.isPublished },
  })

  revalidatePath('/studio')
  return { ok: true }
}

export async function deleteQuiz(formData: FormData): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'UNAUTHORIZED', message: 'Please sign in.' }
  }

  const parsed = quizIdSchema.safeParse(formData.get('quizId'))
  if (!parsed.success) {
    return { ok: false, error: 'VALIDATION_ERROR', message: 'Invalid quiz id.' }
  }

  const quizId = parsed.data
  const allowed = await assertOwnership(quizId, session.user.id, session.user.role)
  if (!allowed.ok) {
    return allowed
  }

  await prisma.quiz.delete({ where: { id: quizId } })
  revalidatePath('/studio')
  return { ok: true }
}

export async function createQuiz(formData: FormData): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'UNAUTHORIZED', message: 'Please sign in.' }
  }

  const emailCheck = assertEmailVerified(session.user.emailVerified)
  if (emailCheck) return emailCheck

  const parsed = quizInputSchema.safeParse({
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

  await prisma.quiz.create({ data })

  revalidatePath('/studio')
  return { ok: true }
}

export async function updateQuiz(formData: FormData): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'UNAUTHORIZED', message: 'Please sign in.' }
  }

  const emailCheck = assertEmailVerified(session.user.emailVerified)
  if (emailCheck) return emailCheck

  const quizIdParsed = quizIdSchema.safeParse(formData.get('quizId'))
  if (!quizIdParsed.success) {
    return { ok: false, error: 'VALIDATION_ERROR', message: 'Invalid quiz id.' }
  }

  const parsed = quizInputSchema.safeParse({
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

  const allowed = await assertOwnership(quizIdParsed.data, session.user.id, session.user.role)
  if (!allowed.ok) {
    return allowed
  }

  if (parsed.data.isPublished) {
    const questionCount = await prisma.question.count({ where: { quizId: quizIdParsed.data } })
    if (questionCount < 5) {
      return {
        ok: false,
        error: 'VALIDATION_ERROR',
        message: 'A quiz must have at least 5 questions before publishing.',
      }
    }
  }

  const data: Prisma.QuizUncheckedUpdateInput = {
    ...parsed.data,
    coverImage: parsed.data.coverImage ?? null,
  }

  await prisma.quiz.update({
    where: { id: quizIdParsed.data },
    data,
  })

  revalidatePath('/studio')
  revalidatePath(`/studio/quiz/${quizIdParsed.data}/edit`)
  return { ok: true }
}

export async function saveDraft(formData: FormData): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'UNAUTHORIZED', message: 'Please sign in.' }
  }

  const emailCheck = assertEmailVerified(session.user.emailVerified)
  if (emailCheck) return emailCheck

  const quizIdParsed = quizIdSchema.safeParse(formData.get('quizId'))
  if (!quizIdParsed.success) {
    return { ok: false, error: 'VALIDATION_ERROR', message: 'Invalid quiz id.' }
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
    isPublished: false,
  })
  if (!parsed.success) {
    return { ok: false, error: 'VALIDATION_ERROR', message: 'Invalid quiz input.' }
  }

  const allowed = await assertOwnership(quizIdParsed.data, session.user.id, session.user.role)
  if (!allowed.ok) {
    return allowed
  }

  const data: Prisma.QuizUncheckedUpdateInput = {
    ...parsed.data,
    coverImage: parsed.data.coverImage ?? null,
  }

  await prisma.quiz.update({
    where: { id: quizIdParsed.data },
    data,
  })

  revalidatePath('/studio')
  revalidatePath(`/studio/quiz/${quizIdParsed.data}/edit`)
  return { ok: true }
}
