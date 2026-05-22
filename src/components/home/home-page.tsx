import { prisma } from '@/server/prisma'
import { auth } from '@/server/auth'
import {
  HomePageClient,
  type HomeCurrentUser,
  type HomeFeaturedCategory,
  type HomeQuizCard,
  type HomeStats,
  type HomeTopPlayer,
} from '@/components/home/home-page-client'
import { Skeleton } from '@/components/ui/skeleton'

const FALLBACK_CATEGORY_GRADIENT = 'var(--background-image-card-gradient)'
const PUBLISHED_QUIZ_SELECT = {
  id: true,
  title: true,
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
} as const

function mapQuizCard(quiz: {
  id: string
  title: string
  difficulty: string
  playCount: number
  avgScore: number
  category: {
    slug: string
    name: string
    icon: string
    color: string
  }
}): HomeQuizCard {
  return {
    id: quiz.id,
    title: quiz.title,
    difficulty:
      quiz.difficulty === 'EASY' || quiz.difficulty === 'MEDIUM' || quiz.difficulty === 'HARD'
        ? quiz.difficulty
        : 'MEDIUM',
    playCount: quiz.playCount,
    avgScore: quiz.avgScore,
    category: {
      ...quiz.category,
      color: quiz.category.color || FALLBACK_CATEGORY_GRADIENT,
    },
  }
}

async function getHomePageData(): Promise<{
  featuredCategories: HomeFeaturedCategory[]
  topPlayers: HomeTopPlayer[]
  stats: HomeStats
  popularQuizzes: HomeQuizCard[]
  newestQuizzes: HomeQuizCard[]
  personalizedQuizzes: HomeQuizCard[]
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
    prisma.quiz.findMany({
      where: { isPublished: true },
      orderBy: [{ playCount: 'desc' }, { createdAt: 'desc' }],
      take: 8,
      select: PUBLISHED_QUIZ_SELECT,
    }),
    prisma.quiz.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: PUBLISHED_QUIZ_SELECT,
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

  let personalizedQuizzes: HomeQuizCard[] = []

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

    if (topCategoryIds.length > 0) {
      const personalizedQuizzesRaw = await prisma.quiz.findMany({
        where: {
          isPublished: true,
          categoryId: { in: topCategoryIds },
          ...(playedQuizIds.length > 0 ? { id: { notIn: playedQuizIds } } : {}),
        },
        orderBy: [{ playCount: 'desc' }, { createdAt: 'desc' }],
        take: 8,
        select: PUBLISHED_QUIZ_SELECT,
      })

      personalizedQuizzes = personalizedQuizzesRaw.map(mapQuizCard)
    }
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
    newestQuizzes: newestQuizzesRaw.map(mapQuizCard),
    personalizedQuizzes,
    currentUser,
  }
}

export async function HomePage() {
  const data = await getHomePageData()

  return <HomePageClient {...data} />
}

export function HomePageSkeleton() {
  return (
    <div className="container mx-auto space-y-8 px-4 py-8 md:space-y-10 md:py-12">
      <Skeleton className="h-36 w-full rounded-3xl md:h-44" />
      <div className="space-y-4">
        <Skeleton className="h-8 w-56 rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={`quiz-row-1-${index}`} className="h-40 rounded-2xl" />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={`quiz-row-2-${index}`} className="h-40 rounded-2xl" />
          ))}
        </div>
      </div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <Skeleton className="h-8 w-40 rounded-xl" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={`category-${index}`} className="h-32 rounded-2xl" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-32 rounded-xl" />
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={`player-${index}`} className="h-20 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
