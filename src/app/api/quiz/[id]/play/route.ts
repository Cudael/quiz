import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/prisma'
import { signPlayToken } from '@/server/play-token'
import { checkRateLimit, getClientIp } from '@/server/rate-limit'

const PLAY_RATE_LIMIT = { limit: 60, windowMs: 5 * 60 * 1000 } as const

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ip = getClientIp(req)
  if (!(await checkRateLimit(`quiz-play:${ip}`, PLAY_RATE_LIMIT))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const { id } = await params

  const quiz = await prisma.quiz.findUnique({
    where: { id, isPublished: true },
    include: {
      category: true,
      author: { select: { id: true, name: true, image: true } },
      questions: {
        orderBy: { order: 'asc' },
        include: {
          choices: {
            select: { id: true, text: true, meta: true },
            // isCorrect is intentionally omitted from select
          },
        },
      },
    },
  })

  if (!quiz) {
    return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
  }

  const playToken = await signPlayToken(quiz.id)

  return NextResponse.json({
    quiz: {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      difficulty: quiz.difficulty,
      category: quiz.category,
      author: quiz.author,
      playCount: quiz.playCount,
      avgScore: quiz.avgScore,
    },
    questions: quiz.questions.map((q) => ({
      id: q.id,
      type: q.type,
      prompt: q.prompt,
      imageUrl: q.imageUrl,
      timeLimitSec: q.timeLimitSec,
      order: q.order,
      choices: q.choices,
    })),
    playToken,
  })
}
