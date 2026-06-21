import type { Badge, Prisma, PrismaClient } from '@prisma/client'
import { prisma } from '@/server/prisma'

type PrismaLike = PrismaClient | Prisma.TransactionClient | typeof prisma

export type BadgeCriterion =
  | { type: 'wins'; count: number }
  | { type: 'perfectScore' }
  | { type: 'streak'; days: number }
  | { type: 'quizzesAuthored'; count: number }
  | { type: 'categoryMaster'; categorySlug: string; minQuizzes: number }
  | { type: 'avgAnswerMs'; lt: number }
  | { type: 'playedBetween'; fromHour: number; toHour: number }
  | { type: 'playsCount'; count: number }

interface BadgeStats {
  wins: number
  hasPerfectScore: boolean
  streakDays: number
  quizzesAuthored: number
  playsCount: number
  avgAnswerMs: number
  playedHours: number[]
  categoryCompletions: Record<string, number>
}

interface SessionSnapshot {
  correctCount: number
  totalCount: number
  timeTakenMs: number
  createdAt: Date
  quiz: {
    category: {
      slug: string
    }
  }
}

function parseCriterion(criteria: unknown): BadgeCriterion | null {
  if (criteria == null || typeof criteria !== 'object' || Array.isArray(criteria)) return null
  return criteria as BadgeCriterion
}

function metPlayedBetween(hours: number[], fromHour: number, toHour: number) {
  if (fromHour === toHour) return hours.length > 0

  return hours.some((hour) => {
    if (fromHour < toHour) {
      return hour >= fromHour && hour < toHour
    }
    return hour >= fromHour || hour < toHour
  })
}

function meetsCriterion(criterion: BadgeCriterion, stats: BadgeStats) {
  switch (criterion.type) {
    // Win definition: correctCount / totalCount >= 0.7.
    case 'wins':
      return stats.wins >= criterion.count
    case 'perfectScore':
      return stats.hasPerfectScore
    case 'streak':
      return stats.streakDays >= criterion.days
    case 'quizzesAuthored':
      return stats.quizzesAuthored >= criterion.count
    case 'categoryMaster':
      return (stats.categoryCompletions[criterion.categorySlug] ?? 0) >= criterion.minQuizzes
    case 'avgAnswerMs':
      return stats.playsCount > 0 && stats.avgAnswerMs < criterion.lt
    case 'playedBetween':
      return metPlayedBetween(stats.playedHours, criterion.fromHour, criterion.toHour)
    case 'playsCount':
      return stats.playsCount >= criterion.count
    default:
      return false
  }
}

async function collectStats(client: PrismaLike, userId: string): Promise<BadgeStats> {
  const [user, quizzesAuthored, sessions] = await Promise.all([
    client.user.findUnique({
      where: { id: userId },
      select: { streakDays: true },
    }),
    client.quiz.count({ where: { authorId: userId, isPublished: true } }),
    client.playSession.findMany({
      where: { userId },
      select: {
        correctCount: true,
        totalCount: true,
        timeTakenMs: true,
        createdAt: true,
        quiz: {
          select: {
            category: {
              select: { slug: true },
            },
          },
        },
      },
    }),
  ])

  const snapshots = sessions as SessionSnapshot[]
  const playsCount = snapshots.length
  const wins = snapshots.filter(
    (session) => session.totalCount > 0 && session.correctCount / session.totalCount >= 0.7
  ).length
  const hasPerfectScore = snapshots.some(
    (session) => session.totalCount > 0 && session.correctCount === session.totalCount
  )

  const totalAnswerMs = snapshots.reduce((sum, session) => {
    if (session.totalCount <= 0) return sum
    return sum + session.timeTakenMs / session.totalCount
  }, 0)

  const avgAnswerMs = playsCount > 0 ? totalAnswerMs / playsCount : Number.POSITIVE_INFINITY

  const categoryCompletions = snapshots.reduce<Record<string, number>>((acc, session) => {
    const slug = session.quiz.category.slug
    acc[slug] = (acc[slug] ?? 0) + 1
    return acc
  }, {})

  const playedHours = snapshots.map((session) => session.createdAt.getUTCHours())

  console.log(
    `[badges] collectStats for user ${userId}: ${snapshots.length} sessions, ${wins} wins, perfect=${hasPerfectScore}, streak=${user?.streakDays ?? 0}, authored=${quizzesAuthored}`
  )

  return {
    wins,
    hasPerfectScore,
    streakDays: user?.streakDays ?? 0,
    quizzesAuthored,
    playsCount,
    avgAnswerMs,
    playedHours,
    categoryCompletions,
  }
}

export async function evaluateBadgesWithClient(
  client: PrismaLike,
  userId: string,
  justFinishedSessionId: string
): Promise<Badge[]> {
  // Reserved for future incremental evaluators that only need data from the just-finished session.
  void justFinishedSessionId
  const [allBadges, existingAwards, stats] = await Promise.all([
    client.badge.findMany(),
    client.userBadge.findMany({
      where: { userId },
      select: { badgeId: true },
    }),
    collectStats(client, userId),
  ])

  const alreadyAwarded = new Set(existingAwards.map((entry) => entry.badgeId))

  const eligibleBadges = allBadges.filter((badge) => {
    if (alreadyAwarded.has(badge.id)) return false
    const criterion = parseCriterion(badge.criteria)
    if (!criterion) return false
    return meetsCriterion(criterion, stats)
  })

  if (!eligibleBadges.length) {
    return []
  }

  await client.userBadge.createMany({
    data: eligibleBadges.map((badge) => ({ userId, badgeId: badge.id })),
  })

  return eligibleBadges
}

// Evaluates all badges after a finished session and returns only newly-awarded badges.
export async function evaluateBadges(
  userId: string,
  justFinishedSessionId: string
): Promise<Badge[]> {
  return evaluateBadgesWithClient(prisma, userId, justFinishedSessionId)
}
