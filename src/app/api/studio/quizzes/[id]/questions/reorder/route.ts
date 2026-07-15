import { revalidatePath, revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'
import { HOME_STATIC_DATA_TAG } from '@/server/home-quiz-cache'

const reorderSchema = z.object({
  questions: z.array(z.object({ id: z.string().cuid(), order: z.number().int().min(0) })),
})

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = reorderSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid question order payload' }, { status: 400 })
  }

  const { id } = await params
  const quiz = await prisma.quiz.findUnique({
    where: { id },
    select: { id: true, authorId: true },
  })

  if (!quiz) {
    return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
  }

  if (quiz.authorId !== session.user.id && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const questionIds = parsed.data.questions.map((question) => question.id)
  const existingQuestions = await prisma.question.findMany({
    where: {
      quizId: id,
      id: { in: questionIds },
    },
    select: { id: true },
  })

  if (existingQuestions.length !== questionIds.length) {
    return NextResponse.json(
      { error: 'Question list does not match quiz questions' },
      { status: 400 }
    )
  }

  await prisma.$transaction([
    prisma.quiz.update({
      where: { id },
      data: {
        isPublished: false,
        reviewStatus: 'DRAFT',
        submittedForReviewAt: null,
        reviewedAt: null,
      },
    }),
    ...parsed.data.questions.map((question) =>
      prisma.question.update({
        where: { id: question.id },
        data: { order: question.order },
      })
    ),
  ])

  revalidatePath('/studio')
  revalidatePath(`/studio/quiz/${id}/edit`)
  revalidateTag(HOME_STATIC_DATA_TAG, 'max')

  return NextResponse.json({ ok: true })
}
