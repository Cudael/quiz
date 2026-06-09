'use server'

import { revalidatePath } from 'next/cache'
import type { Prisma } from '@prisma/client'
import { z } from 'zod'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'
import { questionSchema } from '@/schemas'

const quizIdSchema = z.string().cuid()
const questionIdSchema = z.string().cuid()

export type QuestionActionResult =
  | { ok: true; questionId?: string }
  | {
      ok: false
      error: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION_ERROR'
      message: string
    }

async function assertOwnership(
  quizId: string,
  userId: string,
  role?: string
): Promise<QuestionActionResult> {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    select: { id: true, authorId: true },
  })

  if (!quiz) {
    return { ok: false, error: 'NOT_FOUND', message: 'Quiz not found.' }
  }

  if (quiz.authorId !== userId && role !== 'ADMIN') {
    return { ok: false, error: 'FORBIDDEN', message: 'Not allowed.' }
  }

  return { ok: true }
}

const questionMetaSchema = z.object({
  quizId: z.string().cuid(),
  imageUrl: z.string().trim().url().optional(),
  order: z.coerce.number().int().min(0),
})

function mapChoicesForCreate(choices: z.infer<typeof questionSchema>['choices']) {
  return choices.map((choice) => ({
    text: choice.text,
    imageUrl: choice.imageUrl || null,
    isCorrect: choice.isCorrect,
    ...(choice.meta ? { meta: choice.meta as Prisma.InputJsonValue } : {}),
  }))
}

export async function addQuestion(formData: FormData): Promise<QuestionActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'UNAUTHORIZED', message: 'Please sign in.' }
  }

  let choices: unknown[]
  try {
    choices = JSON.parse(formData.get('choices') as string) as unknown[]
  } catch {
    return { ok: false, error: 'VALIDATION_ERROR', message: 'Invalid choices JSON.' }
  }

  const parsedMeta = questionMetaSchema.safeParse({
    quizId: formData.get('quizId'),
    imageUrl: formData.get('imageUrl') || undefined,
    order: formData.get('order') ?? 0,
  })
  const parsedQuestion = questionSchema.safeParse({
    type: formData.get('type'),
    prompt: formData.get('prompt'),
    explanation: formData.get('explanation') || undefined,
    timeLimitSec: Number(formData.get('timeLimitSec')),
    choices,
  })

  if (!parsedMeta.success || !parsedQuestion.success) {
    return { ok: false, error: 'VALIDATION_ERROR', message: 'Invalid question input.' }
  }

  const allowed = await assertOwnership(parsedMeta.data.quizId, session.user.id, session.user.role)
  if (!allowed.ok) return allowed

  const created = await prisma.$transaction(async (tx) => {
    await tx.question.updateMany({
      where: {
        quizId: parsedMeta.data.quizId,
        order: { gte: parsedMeta.data.order },
      },
      data: {
        order: { increment: 1 },
      },
    })

    return tx.question.create({
      data: {
        quizId: parsedMeta.data.quizId,
        type: parsedQuestion.data.type,
        prompt: parsedQuestion.data.prompt,
        imageUrl: parsedMeta.data.imageUrl || null,
        explanation: parsedQuestion.data.explanation || null,
        timeLimitSec: parsedQuestion.data.timeLimitSec,
        order: parsedMeta.data.order,
        choices: {
          create: mapChoicesForCreate(parsedQuestion.data.choices),
        },
      },
      select: { id: true },
    })
  })

  revalidatePath(`/studio/quiz/${parsedMeta.data.quizId}/edit`)
  return { ok: true, questionId: created.id }
}

export async function updateQuestion(formData: FormData): Promise<QuestionActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'UNAUTHORIZED', message: 'Please sign in.' }
  }

  const questionIdParsed = questionIdSchema.safeParse(formData.get('questionId'))
  if (!questionIdParsed.success) {
    return { ok: false, error: 'VALIDATION_ERROR', message: 'Invalid question id.' }
  }

  let choices: unknown[]
  try {
    choices = JSON.parse(formData.get('choices') as string) as unknown[]
  } catch {
    return { ok: false, error: 'VALIDATION_ERROR', message: 'Invalid choices JSON.' }
  }

  const parsedMeta = questionMetaSchema.omit({ order: true }).safeParse({
    quizId: formData.get('quizId'),
    imageUrl: formData.get('imageUrl') || undefined,
  })
  const parsedQuestion = questionSchema.safeParse({
    type: formData.get('type'),
    prompt: formData.get('prompt'),
    explanation: formData.get('explanation') || undefined,
    timeLimitSec: Number(formData.get('timeLimitSec')),
    choices,
  })

  if (!parsedMeta.success || !parsedQuestion.success) {
    return { ok: false, error: 'VALIDATION_ERROR', message: 'Invalid question input.' }
  }

  const allowed = await assertOwnership(parsedMeta.data.quizId, session.user.id, session.user.role)
  if (!allowed.ok) return allowed

  await prisma.$transaction([
    prisma.choice.deleteMany({ where: { questionId: questionIdParsed.data } }),
    prisma.question.update({
      where: { id: questionIdParsed.data },
      data: {
        type: parsedQuestion.data.type,
        prompt: parsedQuestion.data.prompt,
        imageUrl: parsedMeta.data.imageUrl || null,
        explanation: parsedQuestion.data.explanation || null,
        timeLimitSec: parsedQuestion.data.timeLimitSec,
        choices: {
          create: mapChoicesForCreate(parsedQuestion.data.choices),
        },
      },
    }),
  ])

  revalidatePath(`/studio/quiz/${parsedMeta.data.quizId}/edit`)
  return { ok: true }
}

export async function deleteQuestion(formData: FormData): Promise<QuestionActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'UNAUTHORIZED', message: 'Please sign in.' }
  }

  const questionIdParsed = questionIdSchema.safeParse(formData.get('questionId'))
  const quizIdParsed = quizIdSchema.safeParse(formData.get('quizId'))

  if (!questionIdParsed.success || !quizIdParsed.success) {
    return { ok: false, error: 'VALIDATION_ERROR', message: 'Invalid ids.' }
  }

  const allowed = await assertOwnership(quizIdParsed.data, session.user.id, session.user.role)
  if (!allowed.ok) return allowed

  await prisma.question.delete({ where: { id: questionIdParsed.data } })

  const remaining = await prisma.question.findMany({
    where: { quizId: quizIdParsed.data },
    orderBy: { order: 'asc' },
    select: { id: true },
  })

  await prisma.$transaction(
    remaining.map((q, index) =>
      prisma.question.update({ where: { id: q.id }, data: { order: index } })
    )
  )

  revalidatePath(`/studio/quiz/${quizIdParsed.data}/edit`)
  return { ok: true }
}

export async function reorderQuestions(formData: FormData): Promise<QuestionActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'UNAUTHORIZED', message: 'Please sign in.' }
  }

  const quizIdParsed = quizIdSchema.safeParse(formData.get('quizId'))
  if (!quizIdParsed.success) {
    return { ok: false, error: 'VALIDATION_ERROR', message: 'Invalid quiz id.' }
  }

  let orderedIds: string[]
  try {
    orderedIds = JSON.parse(formData.get('orderedIds') as string) as string[]
  } catch {
    return { ok: false, error: 'VALIDATION_ERROR', message: 'Invalid orderedIds JSON.' }
  }

  const allowed = await assertOwnership(quizIdParsed.data, session.user.id, session.user.role)
  if (!allowed.ok) return allowed

  await prisma.$transaction(
    orderedIds.map((id, index) => prisma.question.update({ where: { id }, data: { order: index } }))
  )

  revalidatePath(`/studio/quiz/${quizIdParsed.data}/edit`)
  return { ok: true }
}
