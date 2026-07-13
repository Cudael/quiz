import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { pickDuelQuestionIds } from '@/server/duel'
import { prisma } from '@/server/prisma'

function parseStoredAnswers(value: unknown) {
  if (!Array.isArray(value)) return []

  const answers: Array<{ questionId: string; choiceIds: string[]; timeTakenMs: number }> = []
  for (const entry of value) {
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) continue
    const answer = entry as Record<string, unknown>
    if (
      typeof answer.questionId !== 'string' ||
      !Array.isArray(answer.choiceIds) ||
      !answer.choiceIds.every((choiceId: unknown) => typeof choiceId === 'string') ||
      typeof answer.timeTakenMs !== 'number'
    ) {
      continue
    }
    answers.push({
      questionId: answer.questionId,
      choiceIds: answer.choiceIds as string[],
      timeTakenMs: answer.timeTakenMs,
    })
  }
  return answers
}

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
          answers: true,
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
  let review: {
    questions: Array<{
      id: string
      type: string
      prompt: string
      imageUrl: string | null
      choices: Array<{ id: string; text: string; isCorrect: boolean }>
    }>
    answers: Array<{ questionId: string; choiceIds: string[]; timeTakenMs: number }>
  } | null = null

  if (includeQuestions && (duel.status === 'IN_PROGRESS' || duel.status === 'FINISHED')) {
    const candidateQuestions = await prisma.question.findMany({
      where: {
        // Duels render a plain choice grid — exclude interactive formats
        type: { notIn: ['ORDER', 'MATCH', 'NUMBER_GUESS', 'GROUPS', 'FILL_BLANK'] },
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
          select: { id: true, text: true, isCorrect: true },
        },
      },
    })

    // Serve the immutable question set locked in when the duel started.
    // Fall back to the deterministic pick for duels started before the
    // selectedQuestionIds column existed.
    const selectedIds =
      duel.selectedQuestionIds.length > 0
        ? duel.selectedQuestionIds
        : pickDuelQuestionIds(
            candidateQuestions.map((question) => question.id),
            duel.id,
            duel.questionCount
          )
    const questionsById = new Map(candidateQuestions.map((question) => [question.id, question]))

    const selectedQuestions = selectedIds
      .map((id) => questionsById.get(id))
      .filter((question): question is (typeof candidateQuestions)[number] => Boolean(question))

    if (duel.status === 'IN_PROGRESS') {
      questions = selectedQuestions.map((question) => ({
        id: question.id,
        type: question.type,
        prompt: question.prompt,
        imageUrl: question.imageUrl,
        choices: question.choices.map(({ id: choiceId, text }) => ({ id: choiceId, text })),
      }))
    } else if (viewerParticipant) {
      const storedAnswers = parseStoredAnswers(viewerParticipant.answers)
      // Duels completed before answer persistence was introduced have no review
      // data; do not mislabel all of their questions as unanswered.
      if (storedAnswers.length > 0) {
        review = {
          questions: selectedQuestions,
          answers: storedAnswers,
        }
      }
    }
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
      maxPlayers: duel.maxPlayers,
      finishedAt: duel.finishedAt,
    },
    participants,
    questions,
    review,
    viewerParticipantId: viewerParticipant?.id ?? null,
    isHost: session?.user?.id ? duel.hostId === session.user.id : false,
  })
}
