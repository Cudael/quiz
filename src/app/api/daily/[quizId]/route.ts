import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/prisma'
import { dailySeed, seededShuffle } from '@/server/daily-seed'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = await params

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: { orderBy: { order: 'asc' }, select: { id: true } },
    },
  })

  if (!quiz) {
    return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
  }

  const today = new Date()
  const seed = dailySeed(today, quizId)
  const shuffled = seededShuffle(
    quiz.questions.map((q) => q.id),
    seed
  )

  return NextResponse.json({ questionIds: shuffled, seed })
}
