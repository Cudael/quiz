import { prisma } from '@/lib/prisma'
import {
  HomePageClient,
  type HomeFeaturedCategory,
  type HomeStats,
  type HomeTopPlayer,
} from '@/components/home-page-client'
import { Skeleton } from '@/components/ui/skeleton'

const FALLBACK_CATEGORY_GRADIENT = 'var(--background-image-card-gradient)'

async function getHomePageData(): Promise<{
  featuredCategories: HomeFeaturedCategory[]
  topPlayers: HomeTopPlayer[]
  stats: HomeStats
}> {
  const [categories, playerGroups, totalPlayers, totalQuizzes, totalQuestions, totalCategories] =
    await Promise.all([
      prisma.category.findMany({
        select: {
          id: true,
          slug: true,
          name: true,
          icon: true,
          color: true,
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
    ])

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

  return {
    featuredCategories,
    topPlayers,
    stats: {
      totalPlayers,
      totalQuizzes,
      totalQuestions,
      totalCategories,
    },
  }
}

export async function HomePage() {
  const data = await getHomePageData()

  return <HomePageClient {...data} />
}

export function HomePageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Skeleton className="h-72 w-full rounded-2xl" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
