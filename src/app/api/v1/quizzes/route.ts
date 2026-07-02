import { NextRequest } from 'next/server'
import { prisma } from '@/server/prisma'
import { checkRateLimit, getClientIp } from '@/server/rate-limit'
import { getQuizPath } from '@/lib/quiz-url'
import { absoluteUrl } from '@/lib/site'
import { apiError, apiJson, corsPreflight } from '../cors'

const RATE_LIMIT = { limit: 60, windowMs: 60 * 1000 } as const
const MAX_PER_PAGE = 50

export function OPTIONS() {
  return corsPreflight()
}

/**
 * Public API: list published quizzes.
 * Query params: page (1-based), perPage (max 50), category (slug),
 * difficulty (EASY|MEDIUM|HARD), q (title search).
 */
export async function GET(req: NextRequest) {
  const ip = getClientIp(req)
  if (!(await checkRateLimit(`api-v1:${ip}`, RATE_LIMIT))) {
    return apiError('Too many requests', 429)
  }

  const params = req.nextUrl.searchParams
  const page = Math.max(1, Number.parseInt(params.get('page') ?? '1', 10) || 1)
  const perPage = Math.min(
    MAX_PER_PAGE,
    Math.max(1, Number.parseInt(params.get('perPage') ?? '20', 10) || 20)
  )
  const category = params.get('category') || undefined
  const difficultyParam = params.get('difficulty')?.toUpperCase()
  const difficulty = ['EASY', 'MEDIUM', 'HARD'].includes(difficultyParam ?? '')
    ? (difficultyParam as 'EASY' | 'MEDIUM' | 'HARD')
    : undefined
  const q = params.get('q')?.trim().slice(0, 100) || undefined

  const where = {
    isPublished: true,
    ...(category ? { category: { slug: category } } : {}),
    ...(difficulty ? { difficulty } : {}),
    ...(q ? { title: { contains: q, mode: 'insensitive' as const } } : {}),
  }

  const [total, quizzes] = await Promise.all([
    prisma.quiz.count({ where }),
    prisma.quiz.findMany({
      where,
      orderBy: [{ playCount: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        difficulty: true,
        coverImage: true,
        playCount: true,
        avgScore: true,
        createdAt: true,
        category: { select: { slug: true, name: true } },
        _count: { select: { questions: true } },
      },
    }),
  ])

  return apiJson({
    page,
    perPage,
    total,
    totalPages: Math.ceil(total / perPage),
    quizzes: quizzes.map((quiz) => ({
      id: quiz.id,
      slug: quiz.slug,
      title: quiz.title,
      description: quiz.description,
      difficulty: quiz.difficulty,
      coverImage: quiz.coverImage,
      playCount: quiz.playCount,
      avgScore: quiz.avgScore,
      questionCount: quiz._count.questions,
      category: quiz.category,
      url: absoluteUrl(getQuizPath(quiz)),
      createdAt: quiz.createdAt.toISOString(),
    })),
  })
}
