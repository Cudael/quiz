import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { cookies } from 'next/headers'
import { prisma } from '@/server/prisma'
import { auth } from '@/server/auth'
import { checkRateLimit, getClientIp } from '@/server/rate-limit'

const SUBMIT_RATE_LIMIT = { limit: 20, windowMs: 5 * 60 * 1000 } as const

const survivalSubmitSchema = z.object({
  categorySlug: z.string().trim().max(100).optional(),
  guestName: z.string().max(60).optional(),
  answers: z
    .array(
      z.object({
        questionId: z.string().cuid(),
        choiceIds: z.array(z.string()).max(10),
      })
    )
    .max(300),
})

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!(await checkRateLimit(`survival-submit:${ip}`, SUBMIT_RATE_LIMIT))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  let rawBody: unknown
  try {
    rawBody = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = survivalSubmitSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { categorySlug, guestName, answers } = parsed.data
  const authSession = await auth()

  const category = categorySlug
    ? await prisma.category.findUnique({ where: { slug: categorySlug }, select: { id: true } })
    : null

  // Server-side revalidation: count consecutive correct answers from the start.
  let correctCount = 0
  if (answers.length > 0) {
    const questions = await prisma.question.findMany({
      where: { id: { in: answers.map((a) => a.questionId) }, quiz: { isPublished: true } },
      select: { id: true, choices: { select: { id: true, isCorrect: true } } },
    })
    const byId = new Map(questions.map((q) => [q.id, q]))
    const seen = new Set<string>()

    for (const answer of answers) {
      if (seen.has(answer.questionId)) break
      seen.add(answer.questionId)
      const question = byId.get(answer.questionId)
      if (!question) break
      const correctIds = question.choices
        .filter((c) => c.isCorrect)
        .map((c) => c.id)
        .sort()
      const validIds = new Set(question.choices.map((c) => c.id))
      const givenIds = [...new Set(answer.choiceIds.filter((id) => validIds.has(id)))].sort()
      const isCorrect =
        correctIds.length > 0 &&
        correctIds.length === givenIds.length &&
        correctIds.every((id, i) => id === givenIds[i])
      if (!isCorrect) break
      correctCount++
    }
  }

  const cookieStore = await cookies()
  const guestKey = cookieStore.get('qa_guest_id')?.value ?? crypto.randomUUID()
  const userId = authSession?.user?.id ?? null

  const previousBest = userId
    ? await prisma.survivalRun.aggregate({
        where: { userId },
        _max: { correctCount: true },
      })
    : null

  const run = await prisma.survivalRun.create({
    data: {
      userId,
      guestName: userId ? null : guestName?.trim() || 'Guest',
      guestKey: userId ? null : guestKey,
      categoryId: category?.id ?? null,
      correctCount,
    },
    select: { id: true },
  })

  const previousBestCount = previousBest?._max.correctCount ?? 0
  const bestForYou = Math.max(previousBestCount, correctCount)

  return NextResponse.json(
    {
      runId: run.id,
      correctCount,
      bestForYou,
      isPersonalBest: correctCount > 0 && correctCount > previousBestCount,
    },
    { status: 201 }
  )
}
