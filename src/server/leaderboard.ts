import { Prisma } from '@prisma/client'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/server/prisma'
import type { ModeFilter, PeriodFilter, SortFilter } from '@/app/leaderboard/params'
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
  mode: ModeFilter
  sort: SortFilter
  categories: string[]
  quizId?: string
}) {
  const { period, mode, sort, categories, quizId } = params
  const sortedCategories = categories.slice().sort()
  // Build a stable cache key from the query parameters.
  const key = [period, mode, sort, sortedCategories.join(','), quizId ?? ''].join('|')
  return unstable_cache(
    () => fetchLeaderboardRows({ period, mode, sort, categories: sortedCategories, quizId }),
    ['leaderboard-rows', key],
    { revalidate: 60, tags: [LEADERBOARD_TAG] }
  )()
}

async function fetchLeaderboardRows({
  period,
  mode,
  sort,
  categories,
  quizId,
}: {
  period: PeriodFilter
  mode: ModeFilter
  sort: SortFilter
  categories: string[]
  quizId?: string
}) {
  const periodStart = getPeriodStart(period)

  const rows = await prisma.$queryRaw<RawLeaderboardRow[]>(Prisma.sql`
    SELECT
      CASE
        WHEN ps."userId" IS NOT NULL THEN 'user:' || ps."userId"
        ELSE 'guest:' || COALESCE(ps."guestName", 'Guest')
      END AS "key",
      ps."userId" AS "userId",
      u."username" AS "username",
      u."image" AS "image",
      COALESCE(u."name", ps."guestName", 'Guest') AS "displayName",
      SUM(ps."score") AS "totalScore",
      MAX(ps."score") AS "bestScore",
      COUNT(*) AS "plays",
      SUM(ps."correctCount") AS "correct",
      SUM(ps."totalCount") AS "totalQuestions"
    FROM "PlaySession" ps
    LEFT JOIN "User" u ON u."id" = ps."userId"
    LEFT JOIN "Quiz" q ON q."id" = ps."quizId"
    LEFT JOIN "Category" c ON c."id" = q."categoryId"
    WHERE 1 = 1
      ${periodStart ? Prisma.sql`AND ps."createdAt" >= ${periodStart}` : Prisma.empty}
      ${mode !== 'ALL' ? Prisma.sql`AND ps."mode" = ${mode}` : Prisma.empty}
      ${quizId ? Prisma.sql`AND ps."quizId" = ${quizId}` : Prisma.empty}
      ${categories.length ? Prisma.sql`AND c."slug" IN (${Prisma.join(categories)})` : Prisma.empty}
    GROUP BY ps."userId", ps."guestName", u."username", u."image", u."name"
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
        mode: 'ALL',
        sort: 'total',
        categories: [],
      }).then((rows) => rows.slice(0, 3).map((row) => row.displayName)),
    ['leaderboard-top-names'],
    { revalidate: 60, tags: [LEADERBOARD_TAG] }
  )()
}
