import { prisma } from '@/server/prisma'
import { auth } from '@/server/auth'
import {
  getPopularQuizzes,
  getTrendingQuizzes,
  type HomeQuizRecord,
} from '@/server/home-quiz-cache'
import type { QuizCardData } from '@/components/ui/quiz-card'
import type {
  HomeCurrentUser,
  HomeFeaturedCategory,
  HomeStats,
  HomeTopPlayer,
  CategoryWithQuizzes,
} from '@/components/home/home-page-client.types'

const FALLBACK_CATEGORY_GRADIENT = 'var(--background-image-card-gradient)'

export interface HomePageData {
  featuredCategories: HomeFeaturedCategory[]
  categoriesWithQuizzes: CategoryWithQuizzes[]
  topPlayers: HomeTopPlayer[]
  stats: HomeStats
  popularQuizzes: QuizCardData[]
  trendingQuizzes: QuizCardData[]
  newestQuizzes: QuizCardData[]
  personalizedQuizzes: QuizCardData[]
  recentlyPlayed: QuizCardData[]
  currentUser: HomeCurrentUser | null
}

function mapQuizCard(quiz: HomeQuizRecord): QuizCardData {
  return {
    id: quiz.id,
    title: quiz.title,
    coverImage: quiz.coverImage,
    difficulty:
      quiz.difficulty === 'EASY' || quiz.difficulty === 'MEDIUM' || quiz.difficulty === 'HARD'
        ? quiz.difficulty
        : 'MEDIUM',
    category: {
      name: quiz.category.name,
      color: quiz.category.color || FALLBACK_CATEGORY_GRADIENT,
    },
    playCount: quiz.playCount,
    avgScore: quiz.avgScore ?? undefined,
    authorName: quiz.author?.name ?? undefined,
  }
}

export async function getHomePageData(): Promise<HomePageData> {
  const [
    session,
    categories,
    playerGroups,
    totalPlayers,
    totalQuizzes,
    totalQuestions,
    totalCategories,
    popularQuizzesRaw,
    trendingQuizzesRaw,
    newestQuizzesRaw,
  ] = await Promise.all([
    auth(),
    prisma.category.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        icon: true,
        color: true,
        imageUrl: true,
        description: true,
        parentSlug: true,
        quizzes: {
          where: { isPublished: true },
          select: { playCount: true },
        },
      },
    }),
    prisma.playSession.groupBy({
      by: ['userId'],
      where: { userId: { not: null } },
      _sum: { score: true },
      orderBy: {
        _sum: {
          score: 'desc',
        },
      },
      take: 5,
    }),
    prisma.user.count(),
    prisma.quiz.count({ where: { isPublished: true } }),
    prisma.question.count(),
    prisma.category.count(),
    getPopularQuizzes(),
    getTrendingQuizzes(),
    prisma.quiz.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      take: 12,
      select: {
        id: true,
        title: true,
        coverImage: true,
        difficulty: true,
        playCount: true,
        avgScore: true,
        author: { select: { name: true } },
        category: {
          select: {
            slug: true,
            name: true,
            icon: true,
            color: true,
          },
        },
      },
    }),
  ])

  const isAuthenticatedUser = Boolean(session?.user?.id && session?.user?.email)
  const currentUser: HomeCurrentUser | null = isAuthenticatedUser
    ? {
        name: session?.user?.name ?? null,
        xp: session?.user?.xp ?? 0,
        level: session?.user?.level ?? 1,
        streakDays: session?.user?.streakDays ?? 0,
      }
    : null

  const topUserIds = playerGroups
    .map((group) => group.userId)
    .filter((userId): userId is string => !!userId)

  const users = topUserIds.length
    ? await prisma.user.findMany({
        where: { id: { in: topUserIds } },
        select: {
          id: true,
          name: true,
          image: true,
        },
      })
    : []

  const categoriesWithTotals = categories.map((category) => {
    const totalPlayCount = category.quizzes.reduce((sum, quiz) => sum + quiz.playCount, 0)
    const quizCount = category.quizzes.length
    return {
      ...category,
      totalPlayCount,
      quizCount,
    }
  })

  const allPlayCountsZero = categoriesWithTotals.every((category) => category.totalPlayCount === 0)

  const featuredCategories = categoriesWithTotals
    .sort((a, b) => {
      if (allPlayCountsZero) {
        return b.quizCount - a.quizCount
      }
      return b.totalPlayCount - a.totalPlayCount || b.quizCount - a.quizCount
    })
    .slice(0, 8)
    .map<HomeFeaturedCategory>((category) => ({
      slug: category.slug,
      name: category.name,
      icon: category.icon,
      color: category.color || FALLBACK_CATEGORY_GRADIENT,
      imageUrl: category.imageUrl ?? undefined,
      description: category.description,
      quizCount: category.quizCount,
    }))

  const usersById = new Map(users.map((user) => [user.id, user]))

  const topPlayers = playerGroups
    .map<HomeTopPlayer | null>((group) => {
      if (!group.userId) return null
      const user = usersById.get(group.userId)
      if (!user) return null
      return {
        userId: user.id,
        name: user.name,
        image: user.image,
        totalScore: group._sum.score ?? 0,
      }
    })
    .filter((player): player is HomeTopPlayer => !!player)

  // --- Fetch quizzes grouped by parent category (includes subcategory quizzes) ---
  const parentCategories = categories.filter((cat) => cat.parentSlug === null)

  const categoriesWithQuizzes: CategoryWithQuizzes[] = await Promise.all(
    parentCategories.map(async (parent) => {
      // Collect IDs of parent + all its child categories
      const childIds = categories
        .filter((cat) => cat.parentSlug === parent.slug)
        .map((cat) => cat.id)
      const allCategoryIds = [parent.id, ...childIds]

      const quizzes = await prisma.quiz.findMany({
        where: { categoryId: { in: allCategoryIds }, isPublished: true },
        orderBy: { playCount: 'desc' },
        take: 15,
        select: {
          id: true,
          title: true,
          coverImage: true,
          difficulty: true,
          playCount: true,
          avgScore: true,
          author: { select: { name: true } },
          category: {
            select: { slug: true, name: true, icon: true, color: true },
          },
        },
      })
      return {
        slug: parent.slug,
        name: parent.name,
        icon: parent.icon,
        color: parent.color || FALLBACK_CATEGORY_GRADIENT,
        imageUrl: parent.imageUrl ?? undefined,
        quizzes: quizzes.map(mapQuizCard),
      }
    })
  )

  let personalizedQuizzes: QuizCardData[] = []
  let recentlyPlayed: QuizCardData[] = []

  if (isAuthenticatedUser && session?.user?.id) {
    const userSessions = await prisma.playSession.findMany({
      where: { userId: session.user.id },
      select: {
        quizId: true,
        quiz: {
          select: {
            categoryId: true,
          },
        },
      },
    })

    const playedQuizIds = [...new Set(userSessions.map((playSession) => playSession.quizId))]
    const categoryCounts = new Map<string, number>()

    for (const playSession of userSessions) {
      const currentCount = categoryCounts.get(playSession.quiz.categoryId) ?? 0
      categoryCounts.set(playSession.quiz.categoryId, currentCount + 1)
    }

    const topCategoryIds = [...categoryCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([categoryId]) => categoryId)

    const [personalizedRaw, recentlyPlayedSessions] = await Promise.all([
      topCategoryIds.length > 0
        ? prisma.quiz.findMany({
            where: {
              isPublished: true,
              categoryId: { in: topCategoryIds },
              ...(playedQuizIds.length > 0 ? { id: { notIn: playedQuizIds } } : {}),
            },
            orderBy: [{ playCount: 'desc' }, { createdAt: 'desc' }],
            take: 12,
            select: {
              id: true,
              title: true,
              coverImage: true,
              difficulty: true,
              playCount: true,
              avgScore: true,
              author: { select: { name: true } },
              category: {
                select: {
                  slug: true,
                  name: true,
                  icon: true,
                  color: true,
                },
              },
            },
          })
        : Promise.resolve([]),
      prisma.playSession.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        distinct: ['quizId'],
        take: 10,
        select: {
          quiz: {
            select: {
              id: true,
              title: true,
              coverImage: true,
              difficulty: true,
              playCount: true,
              avgScore: true,
              author: { select: { name: true } },
              category: {
                select: {
                  name: true,
                  color: true,
                },
              },
            },
          },
        },
      }),
    ])

    personalizedQuizzes = personalizedRaw.map(mapQuizCard)
    recentlyPlayed = recentlyPlayedSessions
      .map((s) => s.quiz)
      .map((quiz) => ({
        id: quiz.id,
        title: quiz.title,
        coverImage: quiz.coverImage,
        difficulty:
          quiz.difficulty === 'EASY' || quiz.difficulty === 'MEDIUM' || quiz.difficulty === 'HARD'
            ? quiz.difficulty
            : ('MEDIUM' as const),
        category: {
          name: quiz.category.name,
          color: quiz.category.color || FALLBACK_CATEGORY_GRADIENT,
        },
        playCount: quiz.playCount,
        avgScore: quiz.avgScore ?? undefined,
        authorName: quiz.author?.name ?? undefined,
      }))
  }

  return {
    featuredCategories,
    categoriesWithQuizzes,
    topPlayers,
    stats: {
      totalPlayers,
      totalQuizzes,
      totalQuestions,
      totalCategories,
    },
    popularQuizzes: popularQuizzesRaw.map(mapQuizCard),
    trendingQuizzes: trendingQuizzesRaw.map(mapQuizCard),
    newestQuizzes: newestQuizzesRaw.map(mapQuizCard),
    personalizedQuizzes,
    recentlyPlayed,
    currentUser,
  }
}
