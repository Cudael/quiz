'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'
import { parseCsvQuizImport, parseJsonQuizImport } from '@/domain/quiz-import'
import { IMPORT_QUESTION_BATCH_SIZE } from '@/domain/quiz-constants'
import { assertEmailVerified, assertOwnership, quizIdSchema, type ActionResult } from './_shared'
import { HOME_STATIC_DATA_TAG } from '@/server/home-quiz-cache'

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
                imageUrl: choice.imageUrl || null,
                isCorrect: choice.isCorrect,
              })),
            },
          },
        })
      )
    )
  }

  await prisma.quiz.update({
    where: { id: quizIdParsed.data },
    data: {
      isPublished: false,
      reviewStatus: 'DRAFT',
      submittedForReviewAt: null,
      reviewedAt: null,
    },
  })

  revalidatePath(`/studio/quiz/${quizIdParsed.data}/edit`)
  revalidatePath(`/studio/quiz/${quizIdParsed.data}/import`)
  revalidateTag(HOME_STATIC_DATA_TAG, 'max')
  return { ok: true }
}
