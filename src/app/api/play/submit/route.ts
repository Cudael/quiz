import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifyPlayToken } from '@/lib/play-token'
import { scoreQuestion, xpForLevel, levelForXp } from '@/lib/scoring'

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
  let body: SubmitBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { playToken, quizId, mode, answers, guestName } = body

  // Validate token
  const tokenResult = await verifyPlayToken(playToken, quizId)
  if (!tokenResult.valid) {
    return NextResponse.json({ error: 'Invalid or expired play token' }, { status: 401 })
  }

  // Fetch quiz with correct answers server-side
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

  // Resolve guestKey from cookie (or create one)
  const cookieStore = await cookies()
  let guestKey = cookieStore.get('qa_guest_id')?.value
  if (!guestKey) {
    guestKey = crypto.randomUUID()
  }

  // DAILY: enforce one attempt per (guestKey, quizId, day)
  const normalizedMode = mode.toUpperCase()
  if (normalizedMode === 'DAILY') {
    const todayStart = new Date()
    todayStart.setUTCHours(0, 0, 0, 0)
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)

    const existing = await prisma.playSession.findFirst({
      where: {
        quizId,
        guestName: guestKey,
        mode: 'DAILY',
        createdAt: { gte: todayStart, lt: todayEnd },
      },
    })
    if (existing) {
      return NextResponse.json({ error: 'Already played this daily quiz today' }, { status: 409 })
    }
  }

  // Server-side scoring
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
      const points = scoreQuestion({
        correct: true,
        timeRemainingMs,
        timeLimitMs,
        streak: normalizedMode === 'SURVIVAL' ? streak : 0,
      })
      score += points
    } else {
      streak = 0
    }
  }

  const totalTimeTakenMs = answers.reduce((sum, a) => sum + a.timeTakenMs, 0)

  // Persist session — use guestKey as the guestName for dedup purposes
  const session = await prisma.playSession.create({
    data: {
      quizId,
      guestName: guestName ?? guestKey,
      score,
      correctCount,
      totalCount,
      timeTakenMs: totalTimeTakenMs,
      mode: normalizedMode,
    },
  })

  // Update quiz aggregate stats
  const allSessions = await prisma.playSession.findMany({
    where: { quizId },
    select: { score: true },
  })
  const newPlayCount = allSessions.length
  const newAvgScore =
    newPlayCount > 0 ? allSessions.reduce((s, p) => s + p.score, 0) / newPlayCount : 0

  await prisma.quiz.update({
    where: { id: quizId },
    data: { playCount: newPlayCount, avgScore: newAvgScore },
  })

  // XP calculation (guest only for now — userId integration comes with NextAuth Phase 4)
  const xpEarned = Math.round(score / 10)
  const currentXp = xpEarned // guests have no persistent XP
  const newLevel = levelForXp(currentXp)
  const leveledUp = newLevel > 1 || xpForLevel(newLevel) <= currentXp

  const response = NextResponse.json({
    sessionId: session.id,
    score,
    correctCount,
    totalCount,
    xpEarned,
    leveledUp: leveledUp && newLevel > 1,
    newLevel,
  })

  // Set guest cookie if new
  if (!cookieStore.get('qa_guest_id')?.value) {
    response.cookies.set('qa_guest_id', guestKey, {
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: true,
      sameSite: 'lax',
    })
  }

  return response
}
