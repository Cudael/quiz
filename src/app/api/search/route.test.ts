import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    quiz: {
      findMany: vi.fn(),
    },
  },
}))

vi.mock('@/server/prisma', () => ({ prisma: prismaMock }))

import { GET } from '@/app/api/search/route'

describe('GET /api/search', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns an empty list when the query is blank', async () => {
    const response = await GET(new NextRequest('http://localhost/api/search?q=   '))

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual([])
    expect(prismaMock.quiz.findMany).not.toHaveBeenCalled()
  })

  it('searches published quizzes and returns the selected fields', async () => {
    prismaMock.quiz.findMany.mockResolvedValue([
      {
        id: 'quiz-1',
        title: 'Science facts',
        description: 'A fun quiz',
        coverImage: null,
        difficulty: 'MEDIUM',
        playCount: 12,
        avgScore: 87,
        category: { name: 'Science', color: '#10b981' },
        author: { name: 'Ada' },
      },
    ])

    const response = await GET(new NextRequest('http://localhost/api/search?q=science'))

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual([
      {
        id: 'quiz-1',
        title: 'Science facts',
        description: 'A fun quiz',
        coverImage: null,
        difficulty: 'MEDIUM',
        playCount: 12,
        avgScore: 87,
        category: { name: 'Science', color: '#10b981' },
        author: { name: 'Ada' },
      },
    ])
    expect(prismaMock.quiz.findMany).toHaveBeenCalledWith({
      where: {
        isPublished: true,
        OR: [{ title: { contains: 'science' } }, { description: { contains: 'science' } }],
      },
      orderBy: [{ playCount: 'desc' }, { createdAt: 'desc' }],
      take: 20,
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
  })
})
