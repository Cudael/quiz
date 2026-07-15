'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import type { Prisma } from '@prisma/client'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'
import { draftQuizSchema, quizSchema } from '@/schemas'
import { HOME_STATIC_DATA_TAG } from '@/server/home-quiz-cache'
import { generateUniqueSlug } from '@/lib/slugify'
import {
  assertEmailVerified,
  assertOwnership,
  assertQuizOwner,
  quizIdSchema,
  type ActionResult,
} from './_shared'
import { saveRevision } from './revision-actions'

const quizInputSchema = quizSchema

export async function submitQuizForReview(formData: FormData): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'UNAUTHORIZED', message: 'Please sign in.' }
  }

  const parsed = quizIdSchema.safeParse(formData.get('quizId'))
  if (!parsed.success) {
    return { ok: false, error: 'VALIDATION_ERROR', message: 'Invalid quiz id.' }
  }

  const quizId = parsed.data
  const allowed = await assertQuizOwner(quizId, session.user.id, session.user.role)
  if (!allowed.ok) {
    return allowed
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    select: { isPublished: true, reviewStatus: true, _count: { select: { questions: true } } },
  })
  if (!quiz) {
    return { ok: false, error: 'NOT_FOUND', message: 'Quiz not found.' }
  }

  if (quiz.isPublished || quiz.reviewStatus === 'APPROVED') {
    return { ok: false, error: 'VALIDATION_ERROR', message: 'This quiz is already published.' }
  }
  if (quiz._count.questions < 5) {
    return {
      ok: false,
      error: 'VALIDATION_ERROR',
      message: 'A quiz must have at least 5 questions before review.',
    }
  }

  await prisma.quiz.update({
    where: { id: quizId },
    data: {
      isPublished: false,
      reviewStatus: 'PENDING',
      submittedForReviewAt: new Date(),
      reviewedAt: null,
    },
  })

  const snapshotForm = new FormData()
  snapshotForm.set('quizId', quizId)
  snapshotForm.set('note', 'Submitted for admin review')
  await saveRevision(snapshotForm)

  revalidatePath('/studio')
  revalidatePath('/admin/quizzes/review-drafts')
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
  // Deleting is owner-only — collaborators may edit but not delete.
  const allowed = await assertQuizOwner(quizId, session.user.id, session.user.role)
  if (!allowed.ok) {
    return allowed
  }

  await prisma.quiz.delete({ where: { id: quizId } })
  revalidatePath('/studio')
  revalidateTag(HOME_STATIC_DATA_TAG, 'max')
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
    format: formData.get('format') || 'TEXT_CHOICE',
    defaultTimeLimitSec: formData.get('defaultTimeLimitSec')
      ? Number(formData.get('defaultTimeLimitSec'))
      : undefined,
    isPublished: formData.get('isPublished') === 'on',
  })

  if (!parsed.success) {
    return { ok: false, error: 'VALIDATION_ERROR', message: 'Invalid quiz input.' }
  }

  const { isPublished: _ignoredPublish, ...createFields } = parsed.data
  void _ignoredPublish
  const data: Prisma.QuizUncheckedCreateInput = {
    ...createFields,
    coverImage: parsed.data.coverImage ?? null,
    isPublished: false,
    reviewStatus: 'DRAFT',
    authorId: session.user.id,
    slug: await generateUniqueSlug(parsed.data.title, (slug) =>
      prisma.quiz.findUnique({ where: { slug } }).then((q) => !!q)
    ),
  }

  const userExists = await prisma.user.count({ where: { id: session.user.id } })
  if (userExists === 0) {
    return { ok: false, error: 'UNAUTHORIZED', message: 'Session expired. Please sign in again.' }
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
    format: formData.get('format') || 'TEXT_CHOICE',
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

  const { isPublished: _ignored, ...updateFields } = parsed.data
  void _ignored
  const data: Prisma.QuizUncheckedUpdateInput = {
    ...updateFields,
    coverImage: updateFields.coverImage ?? null,
    isPublished: false,
    reviewStatus: 'DRAFT',
    submittedForReviewAt: null,
    reviewedAt: null,
  }

  await prisma.quiz.update({
    where: { id: quizIdParsed.data },
    data,
  })

  revalidatePath('/studio')
  revalidatePath(`/studio/quiz/${quizIdParsed.data}/edit`)
  revalidateTag(HOME_STATIC_DATA_TAG, 'max')
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
    format: formData.get('format') || 'TEXT_CHOICE',
    defaultTimeLimitSec: formData.get('defaultTimeLimitSec')
      ? Number(formData.get('defaultTimeLimitSec'))
      : undefined,
  })
  if (!parsed.success) {
    return { ok: false, error: 'VALIDATION_ERROR', message: 'Invalid quiz input.' }
  }

  const allowed = await assertOwnership(quizIdParsed.data, session.user.id, session.user.role)
  if (!allowed.ok) {
    return allowed
  }

  const { isPublished: _ignored, ...updateFields } = parsed.data
  void _ignored

  const data: Prisma.QuizUncheckedUpdateInput = {
    ...updateFields,
    coverImage: updateFields.coverImage ?? null,
    isPublished: false,
    reviewStatus: 'DRAFT',
    submittedForReviewAt: null,
    reviewedAt: null,
  }

  await prisma.quiz.update({
    where: { id: quizIdParsed.data },
    data,
  })

  revalidatePath('/studio')
  revalidatePath(`/studio/quiz/${quizIdParsed.data}/edit`)
  revalidateTag(HOME_STATIC_DATA_TAG, 'max')
  return { ok: true }
}
