import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  authMock,
  quizFindManyMock,
  quizFindFirstMock,
  playSessionFindManyMock,
  getPopularQuizzesMock,
  getTrendingQuizzesMock,
  getHomeStaticDataMock,
} = vi.hoisted(() => ({
  authMock: vi.fn(),
  quizFindManyMock: vi.fn(),
  quizFindFirstMock: vi.fn(),
  playSessionFindManyMock: vi.fn(),
  getPopularQuizzesMock: vi.fn(),
  getTrendingQuizzesMock: vi.fn(),
  getHomeStaticDataMock: vi.fn(),
}))

vi.mock('@/server/auth', () => ({
  auth: authMock,
}))

vi.mock('@/server/home-quiz-cache', () => ({
  getPopularQuizzes: getPopularQuizzesMock,
  getTrendingQuizzes: getTrendingQuizzesMock,
  getHomeStaticData: getHomeStaticDataMock,
}))

vi.mock('@/server/prisma', () => ({
  prisma: {
    quiz: {
      findMany: quizFindManyMock,
      findFirst: quizFindFirstMock,
    },
    playSession: { findMany: playSessionFindManyMock },
  },
}))

import { getHomePageData } from '@/server/home-page-data'

function makeQuiz(id: string, categoryId = 'cat-parent') {
  return {
    id,
    title: `Quiz ${id}`,
    slug: `quiz-${id}`,
    coverImage: null,
    difficulty: 'MEDIUM' as const,
    playCount: 10,
    avgScore: 70,
    author: { name: 'Alice', role: 'USER' },
    category: { slug: 'general', name: 'General', icon: 'BookOpen', color: '#123456' },
    _count: { ratings: 1 },
    ratings: [{ stars: 4 }],
    categoryId,
  }
}

describe('getHomePageData personalization bounds', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    authMock.mockResolvedValue({
      user: {
        id: 'user-1',
        email: 'user@example.com',
        name: 'User',
        xp: 10,
        level: 1,
        streakDays: 2,
      },
    })

    getHomeStaticDataMock.mockResolvedValue({
      categories: [
        {
          id: 'cat-parent',
          slug: 'general',
          name: 'General',
          icon: 'BookOpen',
          color: '#123456',
          imageUrl: null,
          parentSlug: null,
        },
      ],
      newestQuizzes: [makeQuiz('newest-1')],
      badges: [],
      totalQuizCount: 1,
    })

    getPopularQuizzesMock.mockResolvedValue([])
    getTrendingQuizzesMock.mockResolvedValue([])

    quizFindManyMock
      .mockResolvedValueOnce([makeQuiz('cat-1')])
      .mockResolvedValueOnce([makeQuiz('pers-1')])

    quizFindFirstMock.mockResolvedValue({
      id: 'challenge-1',
      title: 'Daily Challenge',
      difficulty: 'EASY',
      category: { name: 'General' },
      _count: { questions: 10 },
    })

    playSessionFindManyMock
      .mockResolvedValueOnce([
        { quizId: 'cat-1', quiz: { categoryId: 'cat-parent' } },
        { quizId: 'cat-2', quiz: { categoryId: 'cat-parent' } },
      ])
      .mockResolvedValueOnce([{ quiz: makeQuiz('recent-1') }])
  })

  it('bounds user session read and preserves distinct recently played query behavior', async () => {
    const data = await getHomePageData()

    expect(playSessionFindManyMock).toHaveBeenCalledTimes(2)

    expect(playSessionFindManyMock.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: 'user-1',
          createdAt: expect.objectContaining({ gte: expect.any(Date) }),
        }),
        orderBy: { createdAt: 'desc' },
        take: 500,
      })
    )

    expect(playSessionFindManyMock.mock.calls[1][0]).toEqual(
      expect.objectContaining({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
        distinct: ['quizId'],
        take: 10,
      })
    )

    expect(data.personalizedQuizzes.length).toBeGreaterThan(0)
    expect(data.recentlyPlayed.length).toBeGreaterThan(0)
  })
})
