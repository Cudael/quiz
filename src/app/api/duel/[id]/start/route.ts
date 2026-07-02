import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { pickDuelQuestionIds } from '@/server/duel'
import { prisma } from '@/server/prisma'
import { checkRateLimit, getClientIp } from '@/server/rate-limit'

const START_RATE_LIMIT = { limit: 10, windowMs: 5 * 60 * 1000 } as const

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ip = getClientIp(req)
  if (!(await checkRateLimit(`duel-start:${ip}`, START_RATE_LIMIT))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const duel = await prisma.duel.findUnique({
    where: { id },
    include: { participants: { select: { id: true } } },
  })
  if (!duel) {
    return NextResponse.json({ error: 'Duel not found' }, { status: 404 })
  }

  if (duel.hostId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (duel.status !== 'WAITING') {
    return NextResponse.json({ error: 'Duel already started' }, { status: 409 })
  }

  if (duel.participants.length < 2) {
    return NextResponse.json({ error: 'At least 2 participants are required' }, { status: 400 })
  }

  // Lock in the question set at start time so submissions are always
  // validated against the same immutable set, even if the question pool
  // changes (quizzes published/unpublished) while the duel is running.
  const candidateQuestions = await prisma.question.findMany({
    where: {
      quiz: {
        isPublished: true,
        ...(duel.categoryId ? { categoryId: duel.categoryId } : {}),
      },
    },
    orderBy: { id: 'asc' },
    select: { id: true },
  })
  const selectedQuestionIds = pickDuelQuestionIds(
    candidateQuestions.map((question) => question.id),
    duel.id,
    duel.questionCount
  )
  if (selectedQuestionIds.length === 0) {
    return NextResponse.json({ error: 'No questions available for this duel' }, { status: 409 })
  }

  await prisma.$transaction([
    prisma.duel.update({
      where: { id: duel.id },
      data: {
        status: 'IN_PROGRESS',
        selectedQuestionIds,
        finishedAt: null,
      },
    }),
    prisma.duelParticipant.updateMany({
      where: { duelId: duel.id },
      data: { score: 0, correctCount: 0, finished: false, finishedAt: null },
    }),
  ])

  return NextResponse.json({ ok: true })
}
