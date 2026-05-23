import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/server/prisma'

const SEARCH_RESULT_LIMIT = 20

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim() ?? ''

  if (!query) {
    return NextResponse.json([])
  }

  const results = await prisma.quiz.findMany({
    where: {
      isPublished: true,
      OR: [{ title: { contains: query } }, { description: { contains: query } }],
    },
    orderBy: [{ playCount: 'desc' }, { createdAt: 'desc' }],
    take: SEARCH_RESULT_LIMIT,
    select: {
      id: true,
      title: true,
      description: true,
      coverImage: true,
      difficulty: true,
      playCount: true,
      avgScore: true,
      category: {
        select: {
          name: true,
          color: true,
        },
      },
      author: {
        select: {
          name: true,
        },
      },
    },
  })

  return NextResponse.json(results)
}
