import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { PlayMode as PrismaPlayMode } from '@prisma/client'
import { prisma } from '@/server/prisma'
import { verifyPlayToken } from '@/server/play-token'
import { scoreQuestion } from '@/domain/scoring'
import { auth } from '@/server/auth'
import { evaluateBadgesWithClient } from '@/domain/badges'
import { levelForXp } from '@/domain/leveling'
import { computeStreak } from '@/domain/streak'
import { HOME_POPULAR_QUIZZES_TAG, HOME_TRENDING_QUIZZES_TAG } from '@/server/home-quiz-cache'
import { LEADERBOARD_TAG } from '@/server/leaderboard'
import { submitPlaySchema } from '@/schemas'
import { checkRateLimit, getClientIp } from '@/server/rate-limit'

const SUBMIT_RATE_LIMIT = { limit: 30, windowMs: 5 * 60 * 1000 } as const

function sanitizeChoiceIds(choiceIds: string[], validChoiceIds: Set<string>) {
  return Array.from(new Set(choiceIds.filter((choiceId) => validChoiceIds.has(choiceId)))).sort()
}

function isPlayMode(value: string): value is PrismaPlayMode {
  return value in PrismaPlayMode
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!(await checkRateLimit(`submit:${ip}`, SUBMIT_RATE_LIMIT))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const authSession = await auth()
  let rawBody: unknown
  try {
    rawBody = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = submitPlaySchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { playToken, quizId, mode, answers, guestName } = parsed.data

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
  if (!isPlayMode(normalizedMode)) {
    return NextResponse.json({ error: 'Invalid play mode' }, { status: 400 })
  }
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
  const evaluatedAnswers: Array<{
    questionId: string
    chosenIds: string[]
    isCorrect: boolean
    timeTakenMs: number
  }> = []

  // Deduplicate answers: keep the first submission per question ID
  const seenQuestionIds = new Set<string>()
  for (const answer of answers) {
    if (seenQuestionIds.has(answer.questionId)) continue
    seenQuestionIds.add(answer.questionId)

    const question = quiz.questions.find((q) => q.id === answer.questionId)
    if (!question) continue

    const validChoiceIds = new Set(question.choices.map((choice) => choice.id))
    const timeLimitMs = question.timeLimitSec * 1000
    // Clamp timeTakenMs to [0, timeLimitMs] to prevent negative-time exploits
    const timeTakenMs = Math.min(Math.max(0, answer.timeTakenMs), timeLimitMs)

    let isCorrect: boolean
    let givenIds: string[]

    if (question.type === 'ORDERING') {
      // Order matters: compare submitted sequence against correct order from meta.order
      const sortedChoices = [...question.choices].sort(
        (a, b) =>
          (((a.meta as Record<string, unknown> | null)?.order as number) ?? 0) -
          (((b.meta as Record<string, unknown> | null)?.order as number) ?? 0)
      )
      const correctOrder = sortedChoices.map((c) => c.id)
      // Preserve submitted order — do NOT sort
      givenIds = answer.choiceIds.filter((id) => validChoiceIds.has(id))
      isCorrect =
        givenIds.length === correctOrder.length && givenIds.every((id, i) => id === correctOrder[i])
    } else if (question.type === 'MATCHING') {
      // Score by verifying each pair shares the same pairKey
      const pairMap = new Map<string, { left?: string; right?: string }>()
      for (const choice of question.choices) {
        const m = choice.meta as { pairKey?: string; side?: string } | null
        const pairKey = m?.pairKey ?? ''
        const side = m?.side
        if (!pairMap.has(pairKey)) pairMap.set(pairKey, {})
        const entry = pairMap.get(pairKey)!
        if (side === 'left') entry.left = choice.id
        else if (side === 'right') entry.right = choice.id
      }
      const givenSet = new Set(answer.choiceIds.filter((id) => validChoiceIds.has(id)))
      givenIds = [...givenSet]
      isCorrect =
        pairMap.size > 0 &&
        [...pairMap.values()].every(
          (pair) => pair.left && pair.right && givenSet.has(pair.left) && givenSet.has(pair.right)
        )
    } else if (question.type === 'CATEGORIZE') {
      // Score by verifying item→category assignments stored in textAnswer (JSON)
      givenIds = []
      let assignments: Record<string, string> = {}
      try {
        assignments = JSON.parse(answer.textAnswer ?? '{}') as Record<string, string>
      } catch {
        assignments = {}
      }
      const items = question.choices.filter(
        (c) => !(c.meta as { isHeader?: boolean } | null)?.isHeader
      )
      isCorrect =
        items.length > 0 &&
        items.every((item) => {
          const correctCategory = (item.meta as { category?: string } | null)?.category ?? ''
          return assignments[item.id] === correctCategory
        })
    } else if (question.type === 'LABEL') {
      // Score by verifying label text answers stored in textAnswer (JSON)
      givenIds = []
      let labelAnswers: Record<string, string> = {}
      try {
        labelAnswers = JSON.parse(answer.textAnswer ?? '{}') as Record<string, string>
      } catch {
        labelAnswers = {}
      }
      isCorrect =
        question.choices.length > 0 &&
        question.choices.every((pos) => {
          const correctLabel = (pos.meta as { label?: string } | null)?.label ?? ''
          const given = labelAnswers[pos.id] ?? ''
          return given.trim().toLowerCase() === correctLabel.trim().toLowerCase()
        })
    } else {
      // Classic types (SINGLE, MULTIPLE, TRUEFALSE, FILL_BLANK)
      const correctChoiceIds = question.choices
        .filter((c) => c.isCorrect)
        .map((c) => c.id)
        .sort()
      givenIds = sanitizeChoiceIds(answer.choiceIds, validChoiceIds)
      isCorrect =
        correctChoiceIds.length === givenIds.length &&
        correctChoiceIds.every((id, i) => id === givenIds[i])
    }

    evaluatedAnswers.push({
      questionId: question.id,
      chosenIds: givenIds,
      isCorrect,
      timeTakenMs,
    })

    if (isCorrect) {
      correctCount++
      streak++
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

  // Use evaluated (deduplicated + clamped) answers for the total time, so that
  // duplicate submissions and out-of-range timeTakenMs values cannot inflate the total.
  const totalTimeTakenMs = evaluatedAnswers.reduce((sum, a) => sum + a.timeTakenMs, 0)
  const xpEarned = Math.round(score / 10)

  const now = new Date()

  const result = await prisma.$transaction(async (tx) => {
    const playSession = await tx.playSession.create({
      data: {
        userId: authSession?.user?.id ?? null,
        quizId,
        guestName: guestName?.trim() ? guestName.trim() : 'Guest',
        guestKey,
        score,
        correctCount,
        totalCount,
        timeTakenMs: totalTimeTakenMs,
        mode: normalizedMode,
      },
    })

    if (evaluatedAnswers.length > 0) {
      await tx.questionAnswer.createMany({
        data: evaluatedAnswers.map((answer) => ({
          sessionId: playSession.id,
          questionId: answer.questionId,
          chosenIds: answer.chosenIds,
          isCorrect: answer.isCorrect,
          timeTakenMs: answer.timeTakenMs,
        })),
      })
    }

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
          bestStreak: currentUser.bestStreak,
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

  revalidateTag(HOME_TRENDING_QUIZZES_TAG, 'max')
  revalidateTag(HOME_POPULAR_QUIZZES_TAG, 'max')
  revalidateTag(LEADERBOARD_TAG, 'max')

  return NextResponse.json(result)
}
