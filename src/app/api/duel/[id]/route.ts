import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { pickDuelQuestionIds } from '@/server/duel'
import { prisma } from '@/server/prisma'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const cookieStore = await cookies()
  const guestKey = cookieStore.get('qa_guest_id')?.value
  const includeQuestions = req.nextUrl.searchParams.get('includeQuestions') === 'true'

  const { id } = await params
  const duel = await prisma.duel.findUnique({
    where: { id },
    include: {
      participants: {
        orderBy: { joinedAt: 'asc' },
        select: {
          id: true,
          userId: true,
          guestName: true,
          score: true,
          correctCount: true,
          finished: true,
          joinedAt: true,
          guestKey: true,
          user: { select: { name: true } },
        },
      },
    },
  })

  if (!duel) {
    return NextResponse.json({ error: 'Duel not found' }, { status: 404 })
  }

  const viewerParticipant = duel.participants.find((participant) =>
    session?.user?.id
      ? participant.userId === session.user.id
      : guestKey
        ? participant.guestKey === guestKey
        : false
  )

  const participants = duel.participants.map((participant) => ({
    id: participant.id,
    userId: participant.userId,
    name: participant.user?.name ?? participant.guestName,
    score: participant.score,
    correctCount: participant.correctCount,
    finished: participant.finished,
    joinedAt: participant.joinedAt,
  }))

  let questions: Array<{
    id: string
    type: string
    prompt: string
    imageUrl: string | null
    choices: Array<{ id: string; text: string }>
  }> | null = null

  if (includeQuestions && duel.status === 'IN_PROGRESS') {
    const candidateQuestions = await prisma.question.findMany({
      where: {
        quiz: {
          isPublished: true,
          ...(duel.categoryId ? { categoryId: duel.categoryId } : {}),
        },
      },
      orderBy: { id: 'asc' },
      select: {
        id: true,
        type: true,
        prompt: true,
        imageUrl: true,
        choices: {
          select: { id: true, text: true },
        },
      },
    })

    const selectedIds = pickDuelQuestionIds(
      candidateQuestions.map((question) => question.id),
      duel.id,
      duel.questionCount
    )
    const questionsById = new Map(candidateQuestions.map((question) => [question.id, question]))

    questions = selectedIds
      .map((id) => questionsById.get(id))
      .filter((question): question is (typeof candidateQuestions)[number] => Boolean(question))
      .map((question) => ({
        id: question.id,
        type: question.type,
        prompt: question.prompt,
        imageUrl: question.imageUrl,
        choices: question.choices,
      }))
  }

  return NextResponse.json({
    duel: {
      id: duel.id,
      code: duel.code,
      hostId: duel.hostId,
      status: duel.status,
      categoryId: duel.categoryId,
      questionCount: duel.questionCount,
      timeLimitSec: duel.timeLimitSec,
      finishedAt: duel.finishedAt,
    },
    participants,
    questions,
    viewerParticipantId: viewerParticipant?.id ?? null,
    isHost: session?.user?.id ? duel.hostId === session.user.id : false,
  })
}
