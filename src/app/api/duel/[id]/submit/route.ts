import { z } from 'zod'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { scoreQuestion } from '@/domain/scoring'
import { pickDuelQuestionIds } from '@/server/duel'
import { prisma } from '@/server/prisma'
import { checkRateLimit, getClientIp } from '@/server/rate-limit'

const SUBMIT_RATE_LIMIT = { limit: 30, windowMs: 5 * 60 * 1000 } as const

const submitDuelSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string().min(1).max(100),
      choiceIds: z.array(z.string().max(100)).max(20),
      timeTakenMs: z.number().finite(),
    })
  ),
})

function sanitizeChoiceIds(choiceIds: string[], validChoiceIds: Set<string>) {
  return Array.from(new Set(choiceIds.filter((choiceId) => validChoiceIds.has(choiceId)))).sort()
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ip = getClientIp(req)
  if (!(await checkRateLimit(`duel-submit:${ip}`, SUBMIT_RATE_LIMIT))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const session = await auth()
  const cookieStore = await cookies()
  const guestKey = cookieStore.get('qa_guest_id')?.value
  const { id } = await params

  let rawBody: unknown
  try {
    rawBody = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = submitDuelSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const duel = await prisma.duel.findUnique({
    where: { id },
    include: {
      participants: {
        select: {
          id: true,
          userId: true,
          guestKey: true,
          finished: true,
        },
      },
    },
  })
  if (!duel) {
    return NextResponse.json({ error: 'Duel not found' }, { status: 404 })
  }
  if (duel.status !== 'IN_PROGRESS') {
    return NextResponse.json({ error: 'Duel is not in progress' }, { status: 409 })
  }

  const participant = duel.participants.find((entry) =>
    session?.user?.id
      ? entry.userId === session.user.id
      : guestKey
        ? entry.guestKey === guestKey
        : false
  )
  if (!participant) {
    return NextResponse.json({ error: 'Participant not found' }, { status: 404 })
  }
  if (participant.finished) {
    return NextResponse.json({ error: 'Answers already submitted' }, { status: 409 })
  }

  const candidateQuestions = await prisma.question.findMany({
    where: {
      quiz: {
        isPublished: true,
        ...(duel.categoryId ? { categoryId: duel.categoryId } : {}),
      },
    },
    orderBy: { id: 'asc' },
    include: {
      choices: {
        select: { id: true, isCorrect: true },
      },
    },
  })

  // Use the immutable question set locked in when the duel started.
  // Fall back to the deterministic pick for duels started before the
  // selectedQuestionIds column existed.
  const selectedQuestionIds =
    duel.selectedQuestionIds.length > 0
      ? duel.selectedQuestionIds
      : pickDuelQuestionIds(
          candidateQuestions.map((question) => question.id),
          duel.id,
          duel.questionCount
        )
  const allowedQuestionIds = new Set(selectedQuestionIds)
  for (const answer of parsed.data.answers) {
    if (!allowedQuestionIds.has(answer.questionId)) {
      return NextResponse.json({ error: 'Invalid question for this duel' }, { status: 400 })
    }
  }
  const questionById = new Map(candidateQuestions.map((question) => [question.id, question]))
  const selectedQuestions = selectedQuestionIds
    .map((questionId) => questionById.get(questionId))
    .filter((question): question is (typeof candidateQuestions)[number] => Boolean(question))

  const answersByQuestion = new Map<string, (typeof parsed.data.answers)[number]>()
  for (const answer of parsed.data.answers) {
    if (!answersByQuestion.has(answer.questionId)) {
      answersByQuestion.set(answer.questionId, answer)
    }
  }

  let score = 0
  let correctCount = 0
  for (const question of selectedQuestions) {
    const submitted = answersByQuestion.get(question.id)
    if (!submitted) continue
    const validChoiceIds = new Set(question.choices.map((choice) => choice.id))
    const selectedChoiceIds = sanitizeChoiceIds(submitted.choiceIds, validChoiceIds)
    const correctChoiceIds = question.choices
      .filter((choice) => choice.isCorrect)
      .map((choice) => choice.id)
      .sort()
    const isCorrect =
      selectedChoiceIds.length === correctChoiceIds.length &&
      selectedChoiceIds.every((choiceId, index) => correctChoiceIds[index] === choiceId)
    const timeLimitMs = duel.timeLimitSec * 1000
    const clampedTimeTakenMs = Math.min(Math.max(0, submitted.timeTakenMs), timeLimitMs)
    if (isCorrect) {
      correctCount += 1
      score += scoreQuestion({
        correct: true,
        timeRemainingMs: timeLimitMs - clampedTimeTakenMs,
        timeLimitMs,
        streak: 0,
      })
    }
  }

  const totalCount = selectedQuestions.length
  const now = new Date()

  await prisma.$transaction(async (tx) => {
    await tx.duelParticipant.update({
      where: { id: participant.id },
      data: {
        score,
        correctCount,
        finished: true,
        finishedAt: now,
      },
    })

    const unfinishedCount = await tx.duelParticipant.count({
      where: { duelId: duel.id, finished: false },
    })
    if (unfinishedCount === 0) {
      await tx.duel.update({
        where: { id: duel.id },
        data: {
          status: 'FINISHED',
          finishedAt: now,
        },
      })
    }
  })

  return NextResponse.json({
    score,
    correctCount,
    totalCount,
  })
}
