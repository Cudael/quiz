import { prisma } from '@/server/prisma'
import { auth } from '@/server/auth'
import {
  getPopularQuizzes,
  getTrendingQuizzes,
  type HomeQuizRecord,
} from '@/server/home-quiz-cache'
import { getDisplayAuthorName } from '@/lib/author-display'
import type { QuizCardData } from '@/components/ui/quiz-card'
import type {
  HomeCurrentUser,
  CategoryWithQuizzes,
  BadgePreview,
  TodayChallengeQuiz,
} from '@/components/home/home-page-client.types'
import { getBadgeEmoji } from '@/lib/badge-display'

const FALLBACK_CATEGORY_GRADIENT = 'var(--background-image-card-gradient)'
const PERSONALIZATION_SESSION_LOOKBACK_DAYS = 365
const PERSONALIZATION_SESSION_READ_CAP = 500

const QUIZ_CARD_SELECT_WITH_RATINGS = {
  id: true,
  title: true,
  slug: true,
  coverImage: true,
  difficulty: true,
  playCount: true,
  avgScore: true,
  author: { select: { name: true, role: true } },
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
  badgePreviews: BadgePreview[]
  totalQuizCount: number
  todayChallenge: TodayChallengeQuiz | null
}

function mapQuizCard(quiz: HomeQuizRecord, completedQuizIds?: Set<string>): QuizCardData {
  const { avgRating, ratingCount } = computeRatingInfo(quiz)

  return {
    id: quiz.id,
    title: quiz.title,
    slug: quiz.slug,
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
    authorName: quiz.author ? getDisplayAuthorName(quiz.author) : undefined,
    completed: completedQuizIds?.has(quiz.id) ?? undefined,
  }
}

export async function getHomePageData(): Promise<HomePageData> {
  const [
    session,
    categories,
    popularQuizzesRaw,
    trendingQuizzesRaw,
    newestQuizzesRaw,
    badgesRaw,
    totalQuizCount,
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
        parentSlug: true,
      },
      take: 100, // Bounded to prevent unbounded result sets
    }),
    getPopularQuizzes(),
    getTrendingQuizzes(),
    prisma.quiz.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      take: 12,
      select: QUIZ_CARD_SELECT_WITH_RATINGS,
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

  const badgePreviews: BadgePreview[] = badgesRaw.map((b) => ({
    slug: b.slug,
    name: b.name,
    description: b.description,
    emoji: getBadgeEmoji(b.slug),
    earnedCount: b._count.awards,
  }))

  const dayIndex = Math.floor(Date.now() / 86_400_000)
  const todayChallengeRaw =
    totalQuizCount > 0
      ? await prisma.quiz.findFirst({
          where: { isPublished: true },
          orderBy: { createdAt: 'asc' },
          skip: dayIndex % totalQuizCount,
          select: {
            id: true,
            title: true,
            difficulty: true,
            category: { select: { name: true } },
            _count: { select: { questions: true } },
          },
        })
      : null

  const todayChallenge: TodayChallengeQuiz | null = todayChallengeRaw
    ? {
        id: todayChallengeRaw.id,
        title: todayChallengeRaw.title,
        difficulty: todayChallengeRaw.difficulty,
        categoryName: todayChallengeRaw.category.name,
        questionCount: todayChallengeRaw._count.questions,
      }
    : null

  const isAuthenticatedUser = Boolean(session?.user?.id && session?.user?.email)
  const currentUser: HomeCurrentUser | null = isAuthenticatedUser
    ? {
        name: session?.user?.name ?? null,
        xp: session?.user?.xp ?? 0,
        level: session?.user?.level ?? 1,
        streakDays: session?.user?.streakDays ?? 0,
      }
    : null

  // Fetch user's play sessions once and reuse for played IDs, category counts, and recent plays.
  const playedQuizIds = new Set<string>()
  let userPlaySessions: { quizId: string; quiz: { categoryId: string } }[] = []

  if (isAuthenticatedUser && session?.user?.id) {
    const sessionLookbackCutoff = new Date(
      Date.now() - PERSONALIZATION_SESSION_LOOKBACK_DAYS * 24 * 60 * 60 * 1000
    )

    userPlaySessions = await prisma.playSession.findMany({
      where: {
        userId: session.user.id,
        createdAt: { gte: sessionLookbackCutoff },
      },
      select: {
        quizId: true,
        quiz: { select: { categoryId: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: PERSONALIZATION_SESSION_READ_CAP,
    })
    for (const s of userPlaySessions) {
      playedQuizIds.add(s.quizId)
    }
  }

  // --- Fetch quizzes grouped by parent category (single batch query) ---
  const parentCategories = categories.filter((cat) => cat.parentSlug === null)

  // Collect all category IDs across all parents to batch into one query
  const parentCategoryMap = new Map<
    string,
    { parent: (typeof parentCategories)[number]; allIds: string[] }
  >()
  for (const parent of parentCategories) {
    const childIds = categories.filter((cat) => cat.parentSlug === parent.slug).map((cat) => cat.id)
    parentCategoryMap.set(parent.id, { parent, allIds: [parent.id, ...childIds] })
  }

  const allCategoryIds = [...parentCategoryMap.values()].flatMap((v) => v.allIds)
  const allCategoryQuizzes = await prisma.quiz.findMany({
    where: { categoryId: { in: allCategoryIds }, isPublished: true },
    orderBy: { playCount: 'desc' },
    select: { ...QUIZ_CARD_SELECT_WITH_RATINGS, categoryId: true },
  })

  // Group quizzes by parent category (a quiz belongs to a parent if its
  // categoryId is in that parent's allIds set) and take top 12 per parent.
  const categoriesWithQuizzes: CategoryWithQuizzes[] = parentCategories.map((parent) => {
    const entry = parentCategoryMap.get(parent.id)!
    const idSet = new Set(entry.allIds)
    const quizzes = allCategoryQuizzes.filter((q) => idSet.has(q.categoryId)).slice(0, 12)
    return {
      slug: parent.slug,
      name: parent.name,
      icon: parent.icon,
      color: parent.color || FALLBACK_CATEGORY_GRADIENT,
      imageUrl: parent.imageUrl ?? undefined,
      quizzes: quizzes.map((q) => mapQuizCard(q, playedQuizIds)),
    }
  })

  let personalizedQuizzes: QuizCardData[] = []
  let recentlyPlayed: QuizCardData[] = []

  if (isAuthenticatedUser && session?.user?.id) {
    const previouslyPlayedIds = [...playedQuizIds]
    const categoryCounts = new Map<string, number>()

    for (const playSession of userPlaySessions) {
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
      .map((quiz) => mapQuizCard(quiz, playedQuizIds))
  }

  return {
    categoriesWithQuizzes,
    popularQuizzes: popularQuizzesRaw.map((q) => mapQuizCard(q, playedQuizIds)),
    trendingQuizzes: trendingQuizzesRaw.map((q) => mapQuizCard(q, playedQuizIds)),
    newestQuizzes: newestQuizzesRaw.map((q) => mapQuizCard(q, playedQuizIds)),
    personalizedQuizzes,
    recentlyPlayed,
    currentUser,
    badgePreviews,
    totalQuizCount,
    todayChallenge,
  }
}
