import { NextResponse } from 'next/server'
import { prisma } from '@/server/prisma'
import { isAuthorizedCronRequest } from '@/server/cron-auth'
import { getPreviousSeasonRange } from '@/server/season'

const MAX_RANKED_PLAYERS = 100
const NOTIFY_TOP_N = 10

const SEASON_BADGES = [
  {
    slug: 'season-champion',
    name: 'Season Champion',
    description: 'Finished #1 on a monthly seasonal leaderboard.',
    icon: 'crown',
    maxRank: 1,
  },
  {
    slug: 'season-podium',
    name: 'Season Podium',
    description: 'Finished in the top 3 of a monthly seasonal leaderboard.',
    icon: 'medal',
    maxRank: 3,
  },
  {
    slug: 'season-top-ten',
    name: 'Season Top 10',
    description: 'Finished in the top 10 of a monthly seasonal leaderboard.',
    icon: 'trophy',
    maxRank: 10,
  },
] as const

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { season, start, end } = getPreviousSeasonRange(new Date())

  const existing = await prisma.seasonResult.count({ where: { season } })
  if (existing > 0) {
    return NextResponse.json({ ok: true, season, skipped: true, reason: 'already finalized' })
  }

  const grouped = await prisma.playSession.groupBy({
    by: ['userId'],
    where: {
      userId: { not: null },
      createdAt: { gte: start, lt: end },
    },
    _sum: { score: true },
    _count: { _all: true },
    orderBy: { _sum: { score: 'desc' } },
    take: MAX_RANKED_PLAYERS,
  })

  const ranked = grouped
    .filter((row) => row.userId !== null)
    .map((row, index) => ({
      userId: row.userId!,
      rank: index + 1,
      score: row._sum.score ?? 0,
      plays: row._count._all,
    }))

  if (ranked.length === 0) {
    return NextResponse.json({ ok: true, season, ranked: 0 })
  }

  // Ensure the season badges exist (idempotent).
  const badgeIdsBySlug = new Map<string, string>()
  for (const badge of SEASON_BADGES) {
    const record = await prisma.badge.upsert({
      where: { slug: badge.slug },
      create: {
        slug: badge.slug,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        criteria: { type: 'seasonRank', maxRank: badge.maxRank },
      },
      update: {},
      select: { id: true },
    })
    badgeIdsBySlug.set(badge.slug, record.id)
  }

  await prisma.seasonResult.createMany({
    data: ranked.map((row) => ({
      userId: row.userId,
      season,
      rank: row.rank,
      score: row.score,
      plays: row.plays,
    })),
    skipDuplicates: true,
  })

  // Award the most prestigious applicable badge per player.
  const badgeAwards: Array<{ userId: string; badgeId: string }> = []
  for (const row of ranked) {
    const badge = SEASON_BADGES.find((candidate) => row.rank <= candidate.maxRank)
    if (badge) {
      badgeAwards.push({ userId: row.userId, badgeId: badgeIdsBySlug.get(badge.slug)! })
    }
  }
  if (badgeAwards.length > 0) {
    await prisma.userBadge.createMany({ data: badgeAwards, skipDuplicates: true })
  }

  await prisma.notification.createMany({
    data: ranked.slice(0, NOTIFY_TOP_N).map((row) => ({
      userId: row.userId,
      type: 'SEASON_RESULT' as const,
      title: `Season ${season} results are in!`,
      message:
        row.rank === 1
          ? `You won the ${season} season with ${row.score.toLocaleString()} points. Champion!`
          : `You finished #${row.rank} in the ${season} season with ${row.score.toLocaleString()} points.`,
      meta: { season, rank: row.rank, score: row.score },
    })),
  })

  return NextResponse.json({
    ok: true,
    season,
    ranked: ranked.length,
    badgesAwarded: badgeAwards.length,
  })
}
