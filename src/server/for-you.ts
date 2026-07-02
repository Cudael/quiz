import 'server-only'
import { prisma } from '@/server/prisma'
import { mapQuizCard, QUIZ_CARD_SELECT_WITH_RATINGS } from '@/server/home-page-data'
import type { HomeQuizRecord } from '@/server/home-quiz-cache'
import type { QuizCardData } from '@/components/ui/quiz-card'

const SESSION_READ_CAP = 500
const LOOKBACK_DAYS = 365

export type ForYouReason = 'category' | 'following' | 'fresh'

export interface ForYouItem {
  quiz: QuizCardData
  reason: ForYouReason
  reasonLabel: string
}

/**
 * Builds a personalized quiz feed from three signals:
 * - unplayed quizzes in the user's most-played categories
 * - new quizzes from authors the user follows
 * - fresh, well-rated quizzes across the platform
 */
export async function getForYouFeed(userId: string, limit = 24): Promise<ForYouItem[]> {
  const cutoff = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000)

  const [sessions, following] = await Promise.all([
    prisma.playSession.findMany({
      where: { userId, createdAt: { gte: cutoff } },
      select: { quizId: true, quiz: { select: { categoryId: true } } },
      orderBy: { createdAt: 'desc' },
      take: SESSION_READ_CAP,
    }),
    prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    }),
  ])

  const playedQuizIds = new Set(sessions.map((s) => s.quizId))
  const categoryCounts = new Map<string, number>()
  for (const s of sessions) {
    categoryCounts.set(s.quiz.categoryId, (categoryCounts.get(s.quiz.categoryId) ?? 0) + 1)
  }
  const topCategoryIds = [...categoryCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([categoryId]) => categoryId)
  const followedIds = following.map((f) => f.followingId)
  const excludeIds = [...playedQuizIds]

  const [fromCategories, fromFollowed, fresh] = await Promise.all([
    topCategoryIds.length > 0
      ? prisma.quiz.findMany({
          where: {
            isPublished: true,
            categoryId: { in: topCategoryIds },
            ...(excludeIds.length > 0 ? { id: { notIn: excludeIds } } : {}),
          },
          orderBy: [{ playCount: 'desc' }, { createdAt: 'desc' }],
          take: limit,
          select: QUIZ_CARD_SELECT_WITH_RATINGS,
        })
      : Promise.resolve([]),
    followedIds.length > 0
      ? prisma.quiz.findMany({
          where: {
            isPublished: true,
            authorId: { in: followedIds },
            ...(excludeIds.length > 0 ? { id: { notIn: excludeIds } } : {}),
          },
          orderBy: { createdAt: 'desc' },
          take: 12,
          select: QUIZ_CARD_SELECT_WITH_RATINGS,
        })
      : Promise.resolve([]),
    prisma.quiz.findMany({
      where: {
        isPublished: true,
        ...(excludeIds.length > 0 ? { id: { notIn: excludeIds } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 12,
      select: QUIZ_CARD_SELECT_WITH_RATINGS,
    }),
  ])

  const seen = new Set<string>()
  const items: ForYouItem[] = []

  function push(quiz: HomeQuizRecord, reason: ForYouReason, reasonLabel: string) {
    if (seen.has(quiz.id)) return
    seen.add(quiz.id)
    items.push({ quiz: mapQuizCard(quiz), reason, reasonLabel })
  }

  // Interleave sources so the feed isn't a single monolithic block.
  const buckets: Array<{
    list: HomeQuizRecord[]
    reason: ForYouReason
    label: string
  }> = [
    {
      list: fromFollowed as HomeQuizRecord[],
      reason: 'following',
      label: 'From creators you follow',
    },
    {
      list: fromCategories as HomeQuizRecord[],
      reason: 'category',
      label: 'Because of what you play',
    },
    { list: fresh as HomeQuizRecord[], reason: 'fresh', label: 'Fresh on BusQuiz' },
  ]

  let index = 0
  while (items.length < limit && buckets.some((b) => index < b.list.length)) {
    for (const bucket of buckets) {
      const quiz = bucket.list[index]
      if (quiz && items.length < limit) {
        push(quiz, bucket.reason, bucket.label)
      }
    }
    index += 1
  }

  return items
}
