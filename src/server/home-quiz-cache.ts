import { Prisma } from '@prisma/client'
import { unstable_cache } from 'next/cache'
import { WEEK_IN_MS } from '@/lib/time'
import { prisma } from '@/server/prisma'

export const HOME_POPULAR_QUIZZES_TAG = 'home-popular-quizzes'
export const HOME_TRENDING_QUIZZES_TAG = 'home-trending-quizzes'

export const HOME_QUIZ_SELECT = {
  id: true,
  title: true,
  coverImage: true,
  difficulty: true,
  playCount: true,
  avgScore: true,
  category: {
    select: {
      slug: true,
      name: true,
      icon: true,
      color: true,
    },
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
