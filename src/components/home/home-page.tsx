import { prisma } from '@/server/prisma'
import { auth } from '@/server/auth'
import {
  HomePageClient,
  type HomeCurrentUser,
  type HomeFeaturedCategory,
  type HomeStats,
  type HomeTopPlayer,
} from '@/components/home/home-page-client'
import type { QuizCardData } from '@/components/ui/quiz-card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  getPopularQuizzes,
  getTrendingQuizzes,
  type HomeQuizRecord,
} from '@/server/home-quiz-cache'

const FALLBACK_CATEGORY_GRADIENT = 'var(--background-image-card-gradient)'

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
  }
}

async function getHomePageData(): Promise<{
  featuredCategories: HomeFeaturedCategory[]
  topPlayers: HomeTopPlayer[]
  stats: HomeStats
  popularQuizzes: QuizCardData[]
  trendingQuizzes: QuizCardData[]
  newestQuizzes: QuizCardData[]
  personalizedQuizzes: QuizCardData[]
  recentlyPlayed: QuizCardData[]
  currentUser: HomeCurrentUser | null
}> {
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
      take: 8,
      select: {
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
            take: 8,
            select: {
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
            },
          })
        : Promise.resolve([]),
      prisma.playSession.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        distinct: ['quizId'],
        take: 6,
        select: {
          quiz: {
            select: {
              id: true,
              title: true,
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
      }))
  }

  return {
    featuredCategories,
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

export async function HomePage() {
  const data = await getHomePageData()

  return <HomePageClient {...data} />
}

export function HomePageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      <Skeleton className="h-52 w-full rounded-3xl" />
      <div className="space-y-3">
        <Skeleton className="h-7 w-48 rounded-xl" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Skeleton className="col-span-2 row-span-2 h-56 rounded-2xl" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-7 w-44 rounded-xl" />
        <Skeleton className="h-72 w-full rounded-3xl md:h-80" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-7 w-40 rounded-xl" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-7 w-40 rounded-xl" />
        <div className="flex gap-4 overflow-hidden">
          {[0, 1, 2, 3].map((j) => (
            <Skeleton key={j} className="h-44 w-64 shrink-0 rounded-2xl" />
          ))}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_280px]">
        <Skeleton className="h-52 rounded-2xl" />
        <Skeleton className="h-52 rounded-2xl" />
      </div>
    </div>
  )
}
