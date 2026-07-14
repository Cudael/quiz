import { Prisma } from '@prisma/client'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/server/prisma'
import type { PeriodFilter, SortFilter } from '@/app/leaderboard/params'
import { getPeriodStart } from '@/app/leaderboard/params'

export const LEADERBOARD_TAG = 'leaderboard'

export interface LeaderboardRow {
  key: string
  userId: string | null
  username: string | null
  image: string | null
  displayName: string
  totalScore: number
  bestScore: number
  plays: number
  correct: number
  totalQuestions: number
  accuracy: number
}

interface RawLeaderboardRow {
  key: string
  userId: string | null
  username: string | null
  image: string | null
  displayName: string
  totalScore: number | bigint | null
  bestScore: number | bigint | null
  plays: number | bigint | null
  correct: number | bigint | null
  totalQuestions: number | bigint | null
}

function toNumber(value: number | bigint | null | undefined) {
  if (typeof value === 'bigint') return Number(value)
  return value ?? 0
}

// Keep sort-specific primary ordering in SQL and use stable score/play tiebreakers
// so the URL-driven leaderboard matches the previous UI behavior.
function orderByClause(sort: SortFilter) {
  if (sort === 'best') {
    return Prisma.sql`MAX(ps."score") DESC, SUM(ps."score") DESC, COUNT(*) DESC`
  }

  if (sort === 'plays') {
    return Prisma.sql`COUNT(*) DESC, SUM(ps."score") DESC, MAX(ps."score") DESC`
  }

  if (sort === 'accuracy') {
    return Prisma.sql`
      CASE
        WHEN SUM(ps."totalCount") = 0 THEN 0
        ELSE (SUM(ps."correctCount") * 100.0) / SUM(ps."totalCount")
      END DESC,
      SUM(ps."score") DESC,
      MAX(ps."score") DESC
    `
  }

  return Prisma.sql`SUM(ps."score") DESC, MAX(ps."score") DESC, COUNT(*) DESC`
}

export function getLeaderboardRows(params: {
  period: PeriodFilter
  sort: SortFilter
  categories: string[]
  quizId?: string
  userIds?: string[]
}) {
  const { period, sort, categories, quizId, userIds } = params
  const sortedCategories = categories.slice().sort()

  // Friend-scoped boards are per-viewer, so skip the shared cache.
  if (userIds) {
    return fetchLeaderboardRows({ period, sort, categories: sortedCategories, quizId, userIds })
  }

  // Build a stable cache key from the query parameters.
  const key = [period, sort, sortedCategories.join(','), quizId ?? ''].join('|')
  return unstable_cache(
    () => fetchLeaderboardRows({ period, sort, categories: sortedCategories, quizId }),
    ['leaderboard-rows', key],
    { revalidate: 300, tags: [LEADERBOARD_TAG] }
  )()
}

async function fetchLeaderboardRows({
  period,
  sort,
  categories,
  quizId,
  userIds,
}: {
  period: PeriodFilter
  sort: SortFilter
  categories: string[]
  quizId?: string
  userIds?: string[]
}) {
  const periodStart = getPeriodStart(period)

  if (userIds && userIds.length === 0) return []

  // Guests have no durable identity and are excluded from the leaderboard —
  // only sessions tied to a real account are ranked.
  const rows = await prisma.$queryRaw<RawLeaderboardRow[]>(Prisma.sql`
    SELECT
      'user:' || ps."userId" AS "key",
      ps."userId" AS "userId",
      u."username" AS "username",
      u."image" AS "image",
      COALESCE(u."username", 'Player') AS "displayName",
      SUM(ps."score") AS "totalScore",
      MAX(ps."score") AS "bestScore",
      COUNT(*) AS "plays",
      SUM(ps."correctCount") AS "correct",
      SUM(ps."totalCount") AS "totalQuestions"
    FROM "PlaySession" ps
    LEFT JOIN "User" u ON u."id" = ps."userId"
    LEFT JOIN "Quiz" q ON q."id" = ps."quizId"
    LEFT JOIN "Category" c ON c."id" = q."categoryId"
    WHERE ps."userId" IS NOT NULL
      AND ps."mode" <> 'PRACTICE'
      ${periodStart ? Prisma.sql`AND ps."createdAt" >= ${periodStart}` : Prisma.empty}
      ${quizId ? Prisma.sql`AND ps."quizId" = ${quizId}` : Prisma.empty}
      ${categories.length ? Prisma.sql`AND c."slug" IN (${Prisma.join(categories)})` : Prisma.empty}
      ${userIds ? Prisma.sql`AND ps."userId" IN (${Prisma.join(userIds)})` : Prisma.empty}
    GROUP BY ps."userId", u."username", u."image"
    ORDER BY ${orderByClause(sort)}
  `)

  return rows.map<LeaderboardRow>((row) => {
    const totalScore = toNumber(row.totalScore)
    const bestScore = toNumber(row.bestScore)
    const plays = toNumber(row.plays)
    const correct = toNumber(row.correct)
    const totalQuestions = toNumber(row.totalQuestions)

    return {
      key: row.key,
      userId: row.userId,
      username: row.username,
      image: row.image,
      displayName: row.displayName,
      totalScore,
      bestScore,
      plays,
      correct,
      totalQuestions,
      accuracy: totalQuestions > 0 ? (correct / totalQuestions) * 100 : 0,
    }
  })
}

export function getLeaderboardTopPlayerNames() {
  return unstable_cache(
    () =>
      fetchLeaderboardRows({
        period: 'all',
        sort: 'total',
        categories: [],
      }).then((rows) => rows.slice(0, 3).map((row) => row.displayName)),
    ['leaderboard-top-names'],
    { revalidate: 300, tags: [LEADERBOARD_TAG] }
  )()
}
