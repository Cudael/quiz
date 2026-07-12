import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/server/prisma'
import { checkRateLimit, getClientIp } from '@/server/rate-limit'

// Survival answers one question at a time; 60/min covers fast players.
const CHECK_RATE_LIMIT = { limit: 60, windowMs: 60 * 1000 } as const

const checkSchema = z.object({
  questionId: z.string().cuid(),
  choiceId: z.string().cuid().nullable(),
})

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!(await checkRateLimit(`survival-check:${ip}`, CHECK_RATE_LIMIT))) {
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

  const question = await prisma.question.findFirst({
    where: { id: parsed.data.questionId, quiz: { isPublished: true } },
    select: { choices: { select: { id: true, isCorrect: true } } },
  })

  if (!question) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 })
  }

  const chosen = parsed.data.choiceId
    ? question.choices.find((c) => c.id === parsed.data.choiceId)
    : null

  return NextResponse.json({
    isCorrect: chosen?.isCorrect === true,
    correctChoiceIds: question.choices.filter((c) => c.isCorrect).map((c) => c.id),
  })
}
