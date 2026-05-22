'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'

const quizIdSchema = z.string().cuid()
const questionIdSchema = z.string().cuid()

export type QuestionActionResult =
  | { ok: true }
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

const choiceSchema = z.object({
  text: z.string().trim().min(1),
  isCorrect: z.boolean(),
})

const questionInputSchema = z.object({
  quizId: z.string().cuid(),
  type: z.enum(['SINGLE', 'MULTIPLE', 'TRUEFALSE', 'FILL_BLANK']),
  prompt: z.string().trim().min(1),
  imageUrl: z.string().trim().url().optional(),
  explanation: z.string().trim().max(500).optional(),
  timeLimitSec: z.coerce.number().int().min(5).max(120),
  choices: z.array(choiceSchema).min(1),
})

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

  const parsed = questionInputSchema.safeParse({
    quizId: formData.get('quizId'),
    type: formData.get('type'),
    prompt: formData.get('prompt'),
    imageUrl: formData.get('imageUrl') || undefined,
    explanation: formData.get('explanation') || undefined,
    timeLimitSec: formData.get('timeLimitSec'),
    choices,
  })

  if (!parsed.success) {
    return { ok: false, error: 'VALIDATION_ERROR', message: 'Invalid question input.' }
  }

  const allowed = await assertOwnership(parsed.data.quizId, session.user.id, session.user.role)
  if (!allowed.ok) return allowed

  const order = await prisma.question.count({ where: { quizId: parsed.data.quizId } })

  await prisma.question.create({
    data: {
      quizId: parsed.data.quizId,
      type: parsed.data.type,
      prompt: parsed.data.prompt,
      imageUrl: parsed.data.imageUrl || null,
      explanation: parsed.data.explanation || null,
      timeLimitSec: parsed.data.timeLimitSec,
      order,
      choices: {
        create: parsed.data.choices,
      },
    },
  })

  revalidatePath(`/studio/quiz/${parsed.data.quizId}/edit`)
  return { ok: true }
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

  const parsed = questionInputSchema.safeParse({
    quizId: formData.get('quizId'),
    type: formData.get('type'),
    prompt: formData.get('prompt'),
    imageUrl: formData.get('imageUrl') || undefined,
    explanation: formData.get('explanation') || undefined,
    timeLimitSec: formData.get('timeLimitSec'),
    choices,
  })

  if (!parsed.success) {
    return { ok: false, error: 'VALIDATION_ERROR', message: 'Invalid question input.' }
  }

  const allowed = await assertOwnership(parsed.data.quizId, session.user.id, session.user.role)
  if (!allowed.ok) return allowed

  await prisma.$transaction([
    prisma.choice.deleteMany({ where: { questionId: questionIdParsed.data } }),
    prisma.question.update({
      where: { id: questionIdParsed.data },
      data: {
        type: parsed.data.type,
        prompt: parsed.data.prompt,
        imageUrl: parsed.data.imageUrl || null,
        explanation: parsed.data.explanation || null,
        timeLimitSec: parsed.data.timeLimitSec,
        choices: {
          create: parsed.data.choices,
        },
      },
    }),
  ])

  revalidatePath(`/studio/quiz/${parsed.data.quizId}/edit`)
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
