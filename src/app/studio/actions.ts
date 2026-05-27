'use server'

import { revalidatePath } from 'next/cache'
import type { Prisma } from '@prisma/client'
import { z } from 'zod'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'
import { parseCsvQuizImport, parseJsonQuizImport } from '@/domain/quiz-import'
import { categorySuggestionSchema, draftQuizSchema, quizSchema } from '@/schemas'
import { IMPORT_QUESTION_BATCH_SIZE } from '@/domain/quiz-constants'

const quizIdSchema = z.string().cuid()
const quizInputSchema = quizSchema

export type ActionResult =
  | { ok: true }
  | {
      ok: false
      error: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'EMAIL_NOT_VERIFIED'
      message: string
    }

async function assertOwnership(quizId: string, userId: string, role?: string) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    select: { id: true, authorId: true },
  })

  if (!quiz) {
    return { ok: false as const, error: 'NOT_FOUND' as const, message: 'Quiz not found.' }
  }

  if (quiz.authorId !== userId && role !== 'ADMIN') {
    return { ok: false as const, error: 'FORBIDDEN' as const, message: 'Not allowed.' }
  }

  return { ok: true as const }
}

function assertEmailVerified(emailVerified: Date | null | undefined): ActionResult | null {
  if (!emailVerified) {
    return {
      ok: false,
      error: 'EMAIL_NOT_VERIFIED',
      message: 'Please verify your email address before creating or editing quizzes.',
    }
  }
  return null
}

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

export async function importQuestions(formData: FormData): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'UNAUTHORIZED', message: 'Please sign in.' }
  }

  const emailCheck = assertEmailVerified(session.user.emailVerified)
  if (emailCheck) return emailCheck

  const quizIdParsed = quizIdSchema.safeParse(formData.get('quizId'))
  const format = formData.get('format')
  const content = formData.get('content')
  if (
    !quizIdParsed.success ||
    (format !== 'csv' && format !== 'json') ||
    typeof content !== 'string'
  ) {
    return { ok: false, error: 'VALIDATION_ERROR', message: 'Invalid import payload.' }
  }

  const allowed = await assertOwnership(quizIdParsed.data, session.user.id, session.user.role)
  if (!allowed.ok) {
    return allowed
  }

  const parsed = format === 'csv' ? parseCsvQuizImport(content) : parseJsonQuizImport(content)
  if (parsed.errors.length > 0) {
    return {
      ok: false,
      error: 'VALIDATION_ERROR',
      message: parsed.errors.map((error) => `Row ${error.row}: ${error.message}`).join(' '),
    }
  }

  const existingCount = await prisma.question.count({ where: { quizId: quizIdParsed.data } })
  for (let start = 0; start < parsed.questions.length; start += IMPORT_QUESTION_BATCH_SIZE) {
    const batch = parsed.questions.slice(start, start + IMPORT_QUESTION_BATCH_SIZE)
    await prisma.$transaction(
      batch.map((question, index) =>
        prisma.question.create({
          data: {
            quizId: quizIdParsed.data,
            type: question.type,
            prompt: question.prompt,
            explanation: question.explanation,
            timeLimitSec: question.timeLimitSec,
            order: existingCount + start + index,
            choices: {
              create: question.choices.map((choice) => ({
                text: choice.text,
                isCorrect: choice.isCorrect,
              })),
            },
          },
        })
      )
    )
  }

  revalidatePath(`/studio/quiz/${quizIdParsed.data}/edit`)
  revalidatePath(`/studio/quiz/${quizIdParsed.data}/import`)
  return { ok: true }
}

export async function suggestCategory(formData: FormData): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'UNAUTHORIZED', message: 'Please sign in.' }
  }

  const parsed = categorySuggestionSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    icon: formData.get('icon'),
    color: formData.get('color'),
  })
  if (!parsed.success) {
    return { ok: false, error: 'VALIDATION_ERROR', message: 'Invalid category suggestion.' }
  }

  await prisma.categorySuggestion.create({
    data: {
      ...parsed.data,
      suggestedById: session.user.id,
    },
  })

  revalidatePath('/studio/quiz/new')
  return { ok: true }
}
