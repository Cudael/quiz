import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { Prisma } from '@prisma/client'
import { prisma } from '@/server/prisma'
import { verifyPlayToken } from '@/server/play-token'
import { scoreQuestion } from '@/domain/scoring'
import { evaluateAnswer } from '@/domain/evaluate-answer'
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

  // Questions this user has already answered correctly before, for this quiz —
  // replaying and re-answering them correctly earns 0 points to prevent farming.
  // Only enforced for signed-in users; guests have no durable identity and are
  // excluded from the leaderboard entirely, so there's no farming incentive to guard against.
  const previouslyCorrectIds = authSession?.user?.id
    ? new Set(
        (
          await prisma.questionAnswer.findMany({
            where: {
              questionId: { in: quiz.questions.map((q) => q.id) },
              isCorrect: true,
              session: { userId: authSession.user.id, quizId },
            },
            select: { questionId: true },
          })
        ).map((a) => a.questionId)
      )
    : new Set<string>()

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

    const timeLimitMs = question.timeLimitSec * 1000
    // Clamp timeTakenMs to [0, timeLimitMs] to prevent negative-time exploits
    const timeTakenMs = Math.min(Math.max(0, answer.timeTakenMs), timeLimitMs)

    // Server-authoritative evaluation for every question type
    const { credit, chosenIds } = evaluateAnswer(question, {
      choiceIds: answer.choiceIds,
      textAnswer: answer.textAnswer,
      textAnswers: answer.textAnswers,
      numberAnswer: answer.numberAnswer,
      pairs: answer.pairs,
      groups: answer.groups,
    })
    const isCorrect = credit === 1

    evaluatedAnswers.push({
      questionId: question.id,
      chosenIds,
      isCorrect,
      timeTakenMs,
    })

    if (isCorrect) {
      correctCount++
    }
    if (credit > 0 && !previouslyCorrectIds.has(question.id)) {
      score += scoreQuestion({ credit })
    }
  }

  // Use evaluated (deduplicated + clamped) answers for the total time, so that
  // duplicate submissions and out-of-range timeTakenMs values cannot inflate the total.
  const totalTimeTakenMs = evaluatedAnswers.reduce((sum, a) => sum + a.timeTakenMs, 0)
  // Practice runs are for review only — no XP, streak, badge, or quest rewards.
  const isPractice = sessionMode === 'PRACTICE'
  const xpEarned = isPractice ? 0 : score

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
      // Serialize reward updates for this user. PostgreSQL transaction-scoped
      // advisory locks prevent two simultaneous submissions from reading the
      // same XP/streak state and overwriting one another.
      await tx.$executeRaw(
        Prisma.sql`SELECT pg_advisory_xact_lock(hashtext(${authSession.user.id}))`
      )

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
      // Maintain the aggregate in one row-locked statement instead of scanning
      // every historical play after every submission. PostgreSQL evaluates the
      // right-hand expressions from the pre-update row, keeping this safe when
      // multiple plays finish concurrently.
      await tx.$executeRaw(Prisma.sql`
        UPDATE "Quiz"
        SET
          "avgScore" = (("avgScore" * "playCount") + ${score}) / ("playCount" + 1),
          "playCount" = "playCount" + 1
        WHERE "id" = ${quizId}
      `)
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
