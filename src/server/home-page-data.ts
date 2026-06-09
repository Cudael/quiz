import { prisma } from '@/server/prisma'
import { auth } from '@/server/auth'
import {
  getPopularQuizzes,
  getTrendingQuizzes,
  type HomeQuizRecord,
} from '@/server/home-quiz-cache'
import type { QuizCardData } from '@/components/ui/quiz-card'
import type { HomeCurrentUser, CategoryWithQuizzes } from '@/components/home/home-page-client.types'

const FALLBACK_CATEGORY_GRADIENT = 'var(--background-image-card-gradient)'

const QUIZ_CARD_SELECT_WITH_RATINGS = {
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
  _count: { select: { ratings: true } },
  ratings: { select: { stars: true } },
} as const

function computeRatingInfo(quiz: {
  _count?: { ratings?: number } | null
  ratings?: readonly { stars: number }[] | { stars: number }[] | null
}) {
  const ratingCount = quiz._count?.ratings ?? 0
  const ratings = quiz.ratings ?? []
  const avgRating =
    ratingCount > 0
      ? ratings.reduce((sum: number, r: { stars: number }) => sum + r.stars, 0) / ratingCount
      : undefined
  return { avgRating, ratingCount }
}

export interface HomePageData {
  categoriesWithQuizzes: CategoryWithQuizzes[]
  popularQuizzes: QuizCardData[]
  trendingQuizzes: QuizCardData[]
  newestQuizzes: QuizCardData[]
  personalizedQuizzes: QuizCardData[]
  recentlyPlayed: QuizCardData[]
  currentUser: HomeCurrentUser | null
}

function mapQuizCard(quiz: HomeQuizRecord, completedQuizIds?: Set<string>): QuizCardData {
  const { avgRating, ratingCount } = computeRatingInfo(quiz)

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
    avgRating,
    ratingCount,
    authorName: quiz.author?.name ?? undefined,
    completed: completedQuizIds?.has(quiz.id) ?? undefined,
  }
}

export async function getHomePageData(): Promise<HomePageData> {
  const [session, categories, popularQuizzesRaw, trendingQuizzesRaw, newestQuizzesRaw] =
    await Promise.all([
      auth(),
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
      }),
      getPopularQuizzes(),
      getTrendingQuizzes(),
      prisma.quiz.findMany({
        where: { isPublished: true },
        orderBy: { createdAt: 'desc' },
        take: 12,
        select: QUIZ_CARD_SELECT_WITH_RATINGS,
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

  // Fetch user's played quiz IDs early to mark completed cards
  const playedQuizIds = new Set<string>()
  if (isAuthenticatedUser && session?.user?.id) {
    const userSessions = await prisma.playSession.findMany({
      where: { userId: session.user.id },
      select: { quizId: true },
      distinct: ['quizId'],
    })
    for (const s of userSessions) {
      playedQuizIds.add(s.quizId)
    }
  }

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
        take: 12,
        select: QUIZ_CARD_SELECT_WITH_RATINGS,
      })
      return {
        slug: parent.slug,
        name: parent.name,
        icon: parent.icon,
        color: parent.color || FALLBACK_CATEGORY_GRADIENT,
        imageUrl: parent.imageUrl ?? undefined,
        quizzes: quizzes.map((q) => mapQuizCard(q, playedQuizIds)),
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

    const previouslyPlayedIds = [...new Set(userSessions.map((playSession) => playSession.quizId))]
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
              ...(previouslyPlayedIds.length > 0 ? { id: { notIn: previouslyPlayedIds } } : {}),
            },
            orderBy: [{ playCount: 'desc' }, { createdAt: 'desc' }],
            take: 12,
            select: QUIZ_CARD_SELECT_WITH_RATINGS,
          })
        : Promise.resolve([]),
      prisma.playSession.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        distinct: ['quizId'],
        take: 10,
        select: {
          quiz: {
            select: QUIZ_CARD_SELECT_WITH_RATINGS,
          },
        },
      }),
    ])

    personalizedQuizzes = personalizedRaw.map((q) => mapQuizCard(q, playedQuizIds))
    recentlyPlayed = recentlyPlayedSessions
      .map((s) => s.quiz)
      .map((quiz) => {
        const { avgRating, ratingCount } = computeRatingInfo(quiz)
        return {
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
          avgRating,
          ratingCount,
          authorName: quiz.author?.name ?? undefined,
          completed: playedQuizIds.has(quiz.id) || undefined,
        }
      })
  }

  return {
    categoriesWithQuizzes,
    popularQuizzes: popularQuizzesRaw.map((q) => mapQuizCard(q, playedQuizIds)),
    trendingQuizzes: trendingQuizzesRaw.map((q) => mapQuizCard(q, playedQuizIds)),
    newestQuizzes: newestQuizzesRaw.map((q) => mapQuizCard(q, playedQuizIds)),
    personalizedQuizzes,
    recentlyPlayed,
    currentUser,
  }
}
