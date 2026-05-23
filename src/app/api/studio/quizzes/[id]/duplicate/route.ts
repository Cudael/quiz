import { revalidatePath } from 'next/cache'
import type { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const quiz = await prisma.quiz.findUnique({
    where: { id },
    select: {
      title: true,
      description: true,
      coverImage: true,
      tags: true,
      categoryId: true,
      difficulty: true,
      authorId: true,
      defaultTimeLimitSec: true,
      questions: {
        orderBy: { order: 'asc' },
        select: {
          type: true,
          prompt: true,
          imageUrl: true,
          explanation: true,
          timeLimitSec: true,
          order: true,
          choices: {
            select: {
              text: true,
              isCorrect: true,
            },
          },
        },
      },
    },
  })

  if (!quiz) {
    return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
  }

  if (quiz.authorId !== session.user.id && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const data: Prisma.QuizUncheckedCreateInput = {
    title: `Copy of ${quiz.title}`,
    description: quiz.description,
    coverImage: quiz.coverImage,
    tags: quiz.tags,
    categoryId: quiz.categoryId,
    difficulty: quiz.difficulty,
    authorId: quiz.authorId,
    isPublished: false,
    playCount: 0,
    avgScore: 0,
    defaultTimeLimitSec: quiz.defaultTimeLimitSec,
    questions: {
      create: quiz.questions.map((question) => ({
        type: question.type,
        prompt: question.prompt,
        imageUrl: question.imageUrl,
        explanation: question.explanation,
        timeLimitSec: question.timeLimitSec,
        order: question.order,
        choices: {
          create: question.choices.map((choice) => ({
            text: choice.text,
            isCorrect: choice.isCorrect,
          })),
        },
      })),
    },
  }

  const copy = await prisma.quiz.create({
    data,
    select: { id: true },
  })

  revalidatePath('/studio')
  revalidatePath(`/studio/quiz/${copy.id}/edit`)

  return NextResponse.json({ ok: true, quizId: copy.id }, { status: 201 })
}
