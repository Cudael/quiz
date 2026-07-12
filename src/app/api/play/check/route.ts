import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/server/prisma'
import { verifyPlayTokenSignature } from '@/server/play-token'
import { evaluateAnswer } from '@/domain/evaluate-answer'
import { buildAnswerReveal, probeGroupMatch } from '@/server/play-safety'
import { checkRateLimit, getClientIp } from '@/server/rate-limit'

// One check per answered question — 120/min is generous for humans while
// slowing down scripted answer harvesting.
const CHECK_RATE_LIMIT = { limit: 120, windowMs: 60 * 1000 } as const

const checkSchema = z.object({
  playToken: z.string().min(1),
  quizId: z.string().cuid(),
  questionId: z.string().cuid(),
  answer: z
    .object({
      choiceIds: z.array(z.string()).max(100).default([]),
      textAnswer: z.string().max(500).optional(),
      textAnswers: z.array(z.string().max(500)).max(100).optional(),
      numberAnswer: z.number().optional(),
      pairs: z
        .array(z.object({ leftId: z.string(), rightId: z.string() }))
        .max(100)
        .optional(),
      groups: z.array(z.array(z.string()).max(100)).max(100).optional(),
    })
    .optional(),
  /** GROUPS mid-question probe — validates one tile selection without
   *  locking in an answer or revealing the full grouping. */
  probeGroup: z.array(z.string()).min(2).max(100).optional(),
})

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!(await checkRateLimit(`play-check:${ip}`, CHECK_RATE_LIMIT))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  let rawBody: unknown
  try {
    rawBody = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = checkSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { playToken, quizId, questionId, answer, probeGroup } = parsed.data

  // Signature-only verification: the token's one-shot nonce must survive
  // for the final submit.
  const tokenResult = await verifyPlayTokenSignature(playToken, quizId)
  if (!tokenResult.valid) {
    return NextResponse.json({ error: 'Invalid or expired play token' }, { status: 401 })
  }

  const question = await prisma.question.findFirst({
    where: { id: questionId, quizId, quiz: { isPublished: true } },
    select: {
      id: true,
      type: true,
      prompt: true,
      meta: true,
      choices: { select: { id: true, text: true, isCorrect: true, meta: true } },
    },
  })

  if (!question) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 })
  }

  if (probeGroup) {
    if (question.type !== 'GROUPS') {
      return NextResponse.json({ error: 'Probe not supported for this question' }, { status: 400 })
    }
    const label = probeGroupMatch(question, probeGroup)
    return NextResponse.json({ probeMatch: label !== null, label })
  }

  const { credit } = evaluateAnswer(
    {
      id: question.id,
      type: question.type,
      meta: question.meta ?? undefined,
      choices: question.choices,
    },
    {
      choiceIds: answer?.choiceIds ?? [],
      textAnswer: answer?.textAnswer,
      textAnswers: answer?.textAnswers,
      numberAnswer: answer?.numberAnswer,
      pairs: answer?.pairs,
      groups: answer?.groups,
    }
  )

  return NextResponse.json({
    credit,
    isCorrect: credit === 1,
    reveal: buildAnswerReveal(question),
  })
}
