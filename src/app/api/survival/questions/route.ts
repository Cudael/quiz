import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/prisma'
import { sanitizeChoiceForPlay, sanitizeQuestionMetaForPlay } from '@/server/play-safety'
import { checkRateLimit, getClientIp } from '@/server/rate-limit'

const QUESTIONS_RATE_LIMIT = { limit: 30, windowMs: 60 * 1000 } as const
const BATCH_SIZE = 10
const MAX_EXCLUDE = 500

/** Fisher-Yates shuffle — returns a new array with items in random order. */
function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export async function GET(req: NextRequest) {
  const ip = getClientIp(req)
  if (!(await checkRateLimit(`survival-questions:${ip}`, QUESTIONS_RATE_LIMIT))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const categorySlug = req.nextUrl.searchParams.get('category') || undefined
  const excludeParam = req.nextUrl.searchParams.get('exclude') ?? ''
  const excludeIds = excludeParam.split(',').filter(Boolean).slice(0, MAX_EXCLUDE)

  const candidates = await prisma.question.findMany({
    where: {
      // Survival renders a plain choice grid — exclude interactive formats
      type: { notIn: ['ORDER', 'MATCH', 'NUMBER_GUESS', 'GROUPS', 'FILL_BLANK'] },
      quiz: {
        isPublished: true,
        ...(categorySlug ? { category: { slug: categorySlug } } : {}),
      },
      ...(excludeIds.length > 0 ? { id: { notIn: excludeIds } } : {}),
    },
    select: { id: true },
    take: 500,
  })

  if (candidates.length === 0) {
    return NextResponse.json({ questions: [] })
  }

  const pickedIds = shuffleArray(candidates)
    .slice(0, BATCH_SIZE)
    .map((c) => c.id)

  const questions = await prisma.question.findMany({
    where: { id: { in: pickedIds } },
    select: {
      id: true,
      type: true,
      prompt: true,
      imageUrl: true,
      meta: true,
      choices: { select: { id: true, text: true, imageUrl: true, meta: true, isCorrect: true } },
    },
  })

  // Answer key is stripped — feedback comes from POST /api/survival/check.
  return NextResponse.json({
    questions: shuffleArray(questions).map((q) => ({
      id: q.id,
      type: q.type,
      prompt: q.prompt,
      imageUrl: q.imageUrl,
      meta: sanitizeQuestionMetaForPlay(q),
      choices: shuffleArray(q.choices.map(sanitizeChoiceForPlay)),
    })),
  })
}
