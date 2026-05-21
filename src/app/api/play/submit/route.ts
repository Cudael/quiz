import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifyPlayToken } from '@/lib/play-token'
import { scoreQuestion } from '@/lib/scoring'
import { auth } from '@/auth'
import { DEFAULT_GUEST_NAME } from '@/lib/quiz-constants'
import { evaluateBadgesWithClient } from '@/lib/badges'
import { levelForXp } from '@/lib/leveling'
import { computeStreak } from '@/lib/streak'

interface AnswerInput {
  questionId: string
  choiceIds: string[]
  timeTakenMs: number
}

interface SubmitBody {
  playToken: string
  quizId: string
  mode: string
  answers: AnswerInput[]
  guestName?: string
}

export async function POST(req: NextRequest) {
  const authSession = await auth()
  let body: SubmitBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { playToken, quizId, mode, answers, guestName } = body

  const tokenResult = await verifyPlayToken(playToken, quizId)
  if (!tokenResult.valid) {
    return NextResponse.json({ error: 'Invalid or expired play token' }, { status: 401 })
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        include: { choices: true },
        orderBy: { order: 'asc' },
      },
    },
  })
  if (!quiz) {
    return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
  }

  const cookieStore = await cookies()
  let guestKey = cookieStore.get('qa_guest_id')?.value
  if (!guestKey) {
    guestKey = crypto.randomUUID()
  }

  const normalizedMode = mode.toUpperCase()
  if (normalizedMode === 'DAILY') {
    const todayStart = new Date()
    todayStart.setUTCHours(0, 0, 0, 0)
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)

    const existing = await prisma.playSession.findFirst({
      where: {
        quizId,
        ...(authSession?.user?.id ? { userId: authSession.user.id } : { guestKey }),
        mode: 'DAILY',
        createdAt: { gte: todayStart, lt: todayEnd },
      },
    })
    if (existing) {
      return NextResponse.json({ error: 'Already played this daily quiz today' }, { status: 409 })
    }
  }

  let score = 0
  let correctCount = 0
  let streak = 0
  const totalCount = quiz.questions.length

  for (const answer of answers) {
    const question = quiz.questions.find((q) => q.id === answer.questionId)
    if (!question) continue

    const correctChoiceIds = question.choices
      .filter((c) => c.isCorrect)
      .map((c) => c.id)
      .sort()
    const givenIds = [...answer.choiceIds].sort()
    const isCorrect =
      correctChoiceIds.length === givenIds.length &&
      correctChoiceIds.every((id, i) => id === givenIds[i])

    if (isCorrect) {
      correctCount++
      streak++
      const timeLimitMs = question.timeLimitSec * 1000
      const timeTakenMs = Math.min(answer.timeTakenMs, timeLimitMs)
      const timeRemainingMs = timeLimitMs - timeTakenMs
      score += scoreQuestion({
        correct: true,
        timeRemainingMs,
        timeLimitMs,
        streak: normalizedMode === 'SURVIVAL' ? streak : 0,
      })
    } else {
      streak = 0
    }
  }

  const totalTimeTakenMs = answers.reduce((sum, a) => sum + a.timeTakenMs, 0)
  const xpEarned = Math.round(score / 10)

  const now = new Date()

  const result = await prisma.$transaction(async (tx) => {
    const playSession = await tx.playSession.create({
      data: {
        userId: authSession?.user?.id ?? null,
        quizId,
        guestName: guestName?.trim() ? guestName.trim() : DEFAULT_GUEST_NAME,
        guestKey,
        score,
        correctCount,
        totalCount,
        timeTakenMs: totalTimeTakenMs,
        mode: normalizedMode,
      },
    })

    let newLevel = 1
    let leveledUp = false
    let newlyAwardedBadges: Awaited<ReturnType<typeof evaluateBadgesWithClient>> = []

    if (authSession?.user?.id) {
      const currentUser = await tx.user.findUnique({
        where: { id: authSession.user.id },
        select: {
          xp: true,
          level: true,
          streakDays: true,
          bestStreak: true,
          lastPlayedAt: true,
        },
      })

      if (currentUser) {
        const streakResult = computeStreak({
          lastPlayedAt: currentUser.lastPlayedAt,
          currentStreakDays: currentUser.streakDays,
          bestStreakDays: currentUser.bestStreak,
          now,
        })

        const updatedXp = currentUser.xp + xpEarned
        newLevel = levelForXp(updatedXp)
        leveledUp = newLevel > currentUser.level

        await tx.user.update({
          where: { id: authSession.user.id },
          data: {
            xp: updatedXp,
            level: newLevel,
            streakDays: streakResult.newStreakDays,
            bestStreak: streakResult.newBestStreakDays,
            lastPlayedAt: now,
          },
        })

        newlyAwardedBadges = await evaluateBadgesWithClient(tx, authSession.user.id, playSession.id)
      }
    } else {
      newLevel = levelForXp(xpEarned)
      leveledUp = newLevel > 1
    }

    const quizScores = await tx.playSession.aggregate({
      where: { quizId },
      _avg: { score: true },
      _count: { _all: true },
    })

    await tx.quiz.update({
      where: { id: quizId },
      data: {
        playCount: quizScores._count._all,
        avgScore: quizScores._avg.score ?? 0,
      },
    })

    return {
      sessionId: playSession.id,
      score,
      correctCount,
      totalCount,
      xpEarned,
      leveledUp,
      newLevel,
      newlyAwardedBadges,
    }
  })

  const response = NextResponse.json(result)

  if (!cookieStore.get('qa_guest_id')?.value) {
    response.cookies.set('qa_guest_id', guestKey, {
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: true,
      sameSite: 'lax',
    })
  }

  return response
}
