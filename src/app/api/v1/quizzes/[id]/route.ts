import { NextRequest } from 'next/server'
import { prisma } from '@/server/prisma'
import { checkRateLimit, getClientIp } from '@/server/rate-limit'
import { getQuizPath } from '@/lib/quiz-url'
import { absoluteUrl } from '@/lib/site'
import { apiError, apiJson, corsPreflight } from '../../cors'

const RATE_LIMIT = { limit: 60, windowMs: 60 * 1000 } as const

export function OPTIONS() {
  return corsPreflight()
}

/**
 * Public API: quiz detail by id or slug.
 * Includes questions and choices WITHOUT correct-answer flags.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ip = getClientIp(req)
  if (!(await checkRateLimit(`api-v1:${ip}`, RATE_LIMIT))) {
    return apiError('Too many requests', 429)
  }

  const { id } = await params
  const quiz = await prisma.quiz.findFirst({
    where: {
      isPublished: true,
      OR: [{ id }, { slug: id }],
    },
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
      questions: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          type: true,
          prompt: true,
          imageUrl: true,
          timeLimitSec: true,
          points: true,
          order: true,
          choices: {
            select: { id: true, text: true, imageUrl: true },
          },
        },
      },
    },
  })

  if (!quiz) {
    return apiError('Quiz not found', 404)
  }

  return apiJson({
    quiz: {
      id: quiz.id,
      slug: quiz.slug,
      title: quiz.title,
      description: quiz.description,
      difficulty: quiz.difficulty,
      coverImage: quiz.coverImage,
      playCount: quiz.playCount,
      avgScore: quiz.avgScore,
      category: quiz.category,
      url: absoluteUrl(getQuizPath(quiz)),
      embedUrl: absoluteUrl(`/embed/quiz/${quiz.slug ?? quiz.id}`),
      createdAt: quiz.createdAt.toISOString(),
      questions: quiz.questions,
    },
  })
}
