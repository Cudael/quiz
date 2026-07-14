import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/prisma'
import { auth } from '@/server/auth'
import { signPlayToken } from '@/server/play-token'
import { sanitizeChoiceForPlay, sanitizeQuestionMetaForPlay } from '@/server/play-safety'
import { checkRateLimit, getClientIp } from '@/server/rate-limit'

const PLAY_RATE_LIMIT = { limit: 60, windowMs: 5 * 60 * 1000 } as const

/** Fisher-Yates shuffle — returns a new array with items in random order. */
function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

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
      author: { select: { id: true, username: true, image: true } },
      questions: {
        orderBy: { order: 'asc' },
        include: {
          choices: {
            select: { id: true, text: true, imageUrl: true, meta: true, isCorrect: true },
          },
        },
      },
    },
  })

  if (!quiz) {
    return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
  }

  // Practice mode: serve only the questions the signed-in viewer most recently missed.
  let servedQuestions = quiz.questions
  const requestedMode = req.nextUrl.searchParams.get('mode')
  if (requestedMode === 'practice') {
    const session = await auth()
    if (session?.user?.id) {
      const recentAnswers = await prisma.questionAnswer.findMany({
        where: {
          questionId: { in: quiz.questions.map((q) => q.id) },
          session: { userId: session.user.id, quizId: quiz.id },
        },
        orderBy: { session: { createdAt: 'desc' } },
        take: 1000,
        select: { questionId: true, isCorrect: true },
      })
      // First occurrence per question = most recent answer.
      const latest = new Map<string, boolean>()
      for (const answer of recentAnswers) {
        if (!latest.has(answer.questionId)) latest.set(answer.questionId, answer.isCorrect)
      }
      const missedIds = new Set(
        [...latest.entries()].filter(([, correct]) => !correct).map(([id]) => id)
      )
      if (missedIds.size > 0) {
        servedQuestions = quiz.questions.filter((q) => missedIds.has(q.id))
      }
    }
  }

  const playToken = await signPlayToken(quiz.id)

  return NextResponse.json({
    quiz: {
      id: quiz.id,
      slug: quiz.slug,
      title: quiz.title,
      description: quiz.description,
      difficulty: quiz.difficulty,
      category: quiz.category,
      author: quiz.author,
      playCount: quiz.playCount,
      avgScore: quiz.avgScore,
      // Blitz mode: hard 60-second timer for the whole quiz.
      timeLimitSec: requestedMode === 'blitz' ? 60 : quiz.defaultTimeLimitSec,
    },
    // Answer key (isCorrect, accepted answers, positions, group/match keys)
    // is stripped — feedback comes from POST /api/play/check after answering.
    questions: servedQuestions.map((q) => ({
      id: q.id,
      type: q.type,
      prompt: q.prompt,
      imageUrl: q.imageUrl,
      timeLimitSec: q.timeLimitSec,
      order: q.order,
      meta: sanitizeQuestionMetaForPlay(q),
      choices: shuffleArray(q.choices.map(sanitizeChoiceForPlay)),
    })),
    playToken,
  })
}
