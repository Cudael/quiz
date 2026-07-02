import { NextRequest } from 'next/server'
import { prisma } from '@/server/prisma'
import { checkRateLimit, getClientIp } from '@/server/rate-limit'
import { apiError, apiJson, corsPreflight } from '../cors'

const RATE_LIMIT = { limit: 60, windowMs: 60 * 1000 } as const

export function OPTIONS() {
  return corsPreflight()
}

/** Public API: list categories with published quiz counts. */
export async function GET(req: NextRequest) {
  const ip = getClientIp(req)
  if (!(await checkRateLimit(`api-v1:${ip}`, RATE_LIMIT))) {
    return apiError('Too many requests', 429)
  }

  const categories = await prisma.category.findMany({
    orderBy: [{ parentSlug: 'asc' }, { name: 'asc' }],
    take: 200,
    select: {
      slug: true,
      name: true,
      parentSlug: true,
      _count: { select: { quizzes: { where: { isPublished: true } } } },
    },
  })

  return apiJson({
    categories: categories.map((category) => ({
      slug: category.slug,
      name: category.name,
      parentSlug: category.parentSlug,
      quizCount: category._count.quizzes,
    })),
  })
}
