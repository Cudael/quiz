import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/server/prisma'
import { verifyPlayToken } from '@/server/play-token'
import { scoreQuestion } from '@/domain/scoring'
import { auth } from '@/server/auth'
import { evaluateBadgesWithClient, evaluateBadges } from '@/domain/badges'
import { levelForXp } from '@/domain/leveling'
import { computeStreak } from '@/domain/streak'
import { HOME_POPULAR_QUIZZES_TAG, HOME_TRENDING_QUIZZES_TAG } from '@/server/home-quiz-cache'
import { LEADERBOARD_TAG } from '@/server/leaderboard'
import { recordQuestEventWithClient } from '@/server/quests'
import { submitPlaySchema } from '@/schemas'
import { checkRateLimit, getClientIp } from '@/server/rate-limit'

const SUBMIT_RATE_LIMIT = { limit: 30, windowMs: 5 * 60 * 1000 } as const

function sanitizeChoiceIds(choiceIds: string[], validChoiceIds: Set<string>) {
  return Array.from(new Set(choiceIds.filter((choiceId) => validChoiceIds.has(choiceId)))).sort()
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

  const { playToken, quizId, answers, guestName, mode } = parsed.data

  const tokenResult = await verifyPlayToken(playToken, quizId)
  if (!tokenResult.valid) {
    return NextResponse.json({ error: 'Invalid or expired play token' }, { status: 401 })
  }

  // DAILY mode is only valid for today's daily pick; otherwise fall back to STANDARD.
  let sessionMode: 'STANDARD' | 'DAILY' | 'PRACTICE' | 'BLITZ' = mode ?? 'STANDARD'
  if (sessionMode === 'DAILY') {
    const todayKey = new Date().toISOString().slice(0, 10)
    const dailyPick = await prisma.dailyQuiz.findUnique({
      where: { date: todayKey },
      select: { quizId: true },
    })
    if (dailyPick?.quizId !== quizId) {
      sessionMode = 'STANDARD'
    }
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        include: { choices: true },
        orderBy: { order: 'asc' },
      },
      category: { select: { slug: true } },
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

  let score = 0
  let correctCount = 0
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

    // Classic type (SINGLE)
    const correctChoiceIds = question.choices
      .filter((c) => c.isCorrect)
      .map((c) => c.id)
      .sort()
    const givenIds = sanitizeChoiceIds(answer.choiceIds, validChoiceIds)

    if (correctChoiceIds.length === 0) {
      // No correct choices are configured for this question — treat as always incorrect
      console.error(
        `[submit] Question ${question.id} (type=${question.type}) has no correct choices configured.`
      )
      isCorrect = false
    } else {
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
      const timeRemainingMs = timeLimitMs - timeTakenMs
      score += scoreQuestion({
        correct: true,
        timeRemainingMs,
        timeLimitMs,
        streak: 0,
      })
    }
  }

  // Use evaluated (deduplicated + clamped) answers for the total time, so that
  // duplicate submissions and out-of-range timeTakenMs values cannot inflate the total.
  const totalTimeTakenMs = evaluatedAnswers.reduce((sum, a) => sum + a.timeTakenMs, 0)
  // Practice runs are for review only — no XP, streak, badge, or quest rewards.
  const isPractice = sessionMode === 'PRACTICE'
  const xpEarned = isPractice ? 0 : Math.round(score / 10)

  if (evaluatedAnswers.length === 0) {
    console.warn(
      `[submit] No answers were scored for quiz ${quizId}. ` +
        `Submitted ${answers.length} answer(s), quiz has ${quiz.questions.length} question(s).`
    )
  }

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
        mode: sessionMode,
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

    if (authSession?.user?.id && !isPractice) {
      const currentUser = await tx.user.findUnique({
        where: { id: authSession.user.id },
        select: {
          xp: true,
          level: true,
          streakDays: true,
          bestStreak: true,
          streakFreezes: true,
          lastPlayedAt: true,
        },
      })

      if (currentUser) {
        const streakResult = computeStreak({
          lastPlayedAt: currentUser.lastPlayedAt,
          currentStreakDays: currentUser.streakDays,
          bestStreak: currentUser.bestStreak,
          streakFreezes: currentUser.streakFreezes,
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
            streakFreezes: streakResult.newStreakFreezes,
            lastPlayedAt: now,
          },
        })

        newlyAwardedBadges = await evaluateBadgesWithClient(tx, authSession.user.id, playSession.id)

        await recordQuestEventWithClient(
          tx,
          authSession.user.id,
          {
            type: 'quizPlayed',
            categorySlug: quiz.category?.slug ?? '',
            isPerfect: totalCount > 0 && correctCount === totalCount,
            xpEarned,
          },
          now
        )
      }
    } else {
      newLevel = levelForXp(xpEarned)
      leveledUp = newLevel > 1
    }

    if (!isPractice) {
      const quizScores = await tx.playSession.aggregate({
        where: { quizId, mode: { not: 'PRACTICE' } },
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
    }

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

  // Safety net: re-evaluate badges outside the transaction in case
  // transaction isolation prevented collectStats from seeing the new session.
  if (authSession?.user?.id && !isPractice && result.newlyAwardedBadges.length === 0) {
    const safetyBadges = await evaluateBadges(authSession.user.id, result.sessionId)
    if (safetyBadges.length > 0) {
      return NextResponse.json({ ...result, newlyAwardedBadges: safetyBadges })
    }
  }

  return NextResponse.json(result)
}
