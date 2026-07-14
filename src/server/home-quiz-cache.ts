import { Prisma } from '@prisma/client'
import { unstable_cache } from 'next/cache'
import { WEEK_IN_MS } from '@/lib/time'
import { prisma } from '@/server/prisma'

export const HOME_POPULAR_QUIZZES_TAG = 'home-popular-quizzes'
export const HOME_TRENDING_QUIZZES_TAG = 'home-trending-quizzes'
export const HOME_STATIC_DATA_TAG = 'home-static-data'

export const HOME_QUIZ_SELECT = {
  id: true,
  title: true,
  slug: true,
  coverImage: true,
  difficulty: true,
  playCount: true,
  avgScore: true,
  author: {
    select: {
      username: true,
      role: true,
    },
  },
  category: {
    select: {
      slug: true,
      name: true,
      icon: true,
      color: true,
    },
  },
  _count: {
    select: { ratings: true },
  },
  ratings: {
    select: { stars: true },
  },
} satisfies Prisma.QuizSelect

export type HomeQuizRecord = Prisma.QuizGetPayload<{ select: typeof HOME_QUIZ_SELECT }>

const getPopularQuizzesCached = unstable_cache(
  async () =>
    prisma.quiz.findMany({
      where: { isPublished: true },
      orderBy: [{ playCount: 'desc' }, { createdAt: 'desc' }],
      take: 12,
      select: HOME_QUIZ_SELECT,
    }),
  ['home-popular-quizzes'],
  {
    revalidate: 3600,
    tags: [HOME_POPULAR_QUIZZES_TAG],
  }
)

const getTrendingQuizzesCached = unstable_cache(
  async () => {
    const oneWeekAgo = new Date(Date.now() - WEEK_IN_MS)
    const quizGroups = await prisma.playSession.groupBy({
      by: ['quizId'],
      where: {
        createdAt: { gte: oneWeekAgo },
      },
      _count: {
        quizId: true,
      },
      orderBy: [
        {
          _count: {
            quizId: 'desc',
          },
        },
      ],
      take: 12,
    })

    if (quizGroups.length === 0) {
      return [] as HomeQuizRecord[]
    }

    const quizzes = await prisma.quiz.findMany({
      where: {
        id: { in: quizGroups.map((group) => group.quizId) },
        isPublished: true,
      },
      select: HOME_QUIZ_SELECT,
    })

    const quizzesById = new Map(quizzes.map((quiz) => [quiz.id, quiz]))
    return quizGroups
      .map((group) => quizzesById.get(group.quizId))
      .filter((quiz): quiz is HomeQuizRecord => !!quiz)
      .slice(0, 12)
  },
  ['home-trending-quizzes'],
  {
    revalidate: 300,
    tags: [HOME_TRENDING_QUIZZES_TAG],
  }
)

export function getPopularQuizzes() {
  return getPopularQuizzesCached()
}

export function getTrendingQuizzes() {
  return getTrendingQuizzesCached()
}

export interface HomeCategoryRecord {
  id: string
  slug: string
  name: string
  icon: string
  color: string | null
  imageUrl: string | null
  parentSlug: string | null
}

export interface HomeBadgePreviewRecord {
  slug: string
  name: string
  description: string
  earnedCount: number
}

export interface HomeStaticData {
  categories: HomeCategoryRecord[]
  newestQuizzes: HomeQuizRecord[]
  badges: HomeBadgePreviewRecord[]
  totalQuizCount: number
}

/** Everything on the homepage that's the same for every visitor and doesn't
 *  need to be second-fresh — categories, newest quizzes, badge counts, and
 *  the total published-quiz count. Personalized data (session-dependent) is
 *  fetched separately and is never cached here. */
const getHomeStaticDataCached = unstable_cache(
  async (): Promise<HomeStaticData> => {
    const [categories, newestQuizzesRaw, badgesRaw, totalQuizCount] = await Promise.all([
      prisma.category.findMany({
        select: {
          id: true,
          slug: true,
          name: true,
          icon: true,
          color: true,
          imageUrl: true,
          parentSlug: true,
        },
        take: 100, // Bounded to prevent unbounded result sets
      }),
      prisma.quiz.findMany({
        where: { isPublished: true },
        orderBy: { createdAt: 'desc' },
        take: 12,
        select: HOME_QUIZ_SELECT,
      }),
      prisma.badge.findMany({
        select: {
          slug: true,
          name: true,
          description: true,
          _count: { select: { awards: true } },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.quiz.count({ where: { isPublished: true } }),
    ])

    return {
      categories,
      newestQuizzes: newestQuizzesRaw,
      badges: badgesRaw.map((b) => ({
        slug: b.slug,
        name: b.name,
        description: b.description,
        earnedCount: b._count.awards,
      })),
      totalQuizCount,
    }
  },
  ['home-static-data'],
  {
    revalidate: 300,
    tags: [HOME_STATIC_DATA_TAG],
  }
)

export function getHomeStaticData() {
  return getHomeStaticDataCached()
}
