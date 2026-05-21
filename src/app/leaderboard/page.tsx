import Link from 'next/link'
import { Medal, Trophy } from 'lucide-react'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

type RangeFilter = 'all' | 'week' | 'today'
type ModeFilter = 'ALL' | 'CLASSIC' | 'TIMED' | 'SURVIVAL' | 'DAILY'
type SortFilter = 'best' | 'total' | 'plays' | 'accuracy'

interface LeaderboardRow {
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

const PAGE_SIZE = 50
const sortOptions: Array<{ value: SortFilter; label: string }> = [
  { value: 'total', label: 'Total Score' },
  { value: 'best', label: 'Best Score' },
  { value: 'plays', label: 'Play Count' },
  { value: 'accuracy', label: 'Accuracy' },
]

function buildLeaderboardQuery({
  range,
  mode,
  sort,
  page,
  categories,
}: {
  range: RangeFilter
  mode: ModeFilter
  sort: SortFilter
  page?: number
  categories: string[]
}) {
  const query = new URLSearchParams()
  query.set('range', range)
  if (mode !== 'ALL') query.set('mode', mode)
  if (sort !== 'total') query.set('sort', sort)
  if (page && page > 1) query.set('page', String(page))
  categories.forEach((slug) => query.append('category', slug))
  return query.toString()
}

function getRangeStart(range: RangeFilter): Date | undefined {
  const now = new Date()
  if (range === 'today') {
    const start = new Date(now)
    start.setUTCHours(0, 0, 0, 0)
    return start
  }

  if (range === 'week') {
    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  }

  return undefined
}

function medal(rank: number) {
  if (rank === 1) return <Medal className="h-4 w-4 text-yellow-400" />
  if (rank === 2) return <Medal className="h-4 w-4 text-slate-300" />
  if (rank === 3) return <Medal className="h-4 w-4 text-amber-700" />
  return null
}

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    range?: string
    mode?: string
    sort?: string
    page?: string
    category?: string | string[]
  }>
}) {
  const params = await searchParams
  const session = await auth()

  const range: RangeFilter =
    params.range === 'today' || params.range === 'week' ? params.range : 'all'
  const mode =
    params.mode && ['CLASSIC', 'TIMED', 'SURVIVAL', 'DAILY'].includes(params.mode.toUpperCase())
      ? (params.mode.toUpperCase() as ModeFilter)
      : 'ALL'
  const sort =
    params.sort && ['best', 'total', 'plays', 'accuracy'].includes(params.sort)
      ? (params.sort as SortFilter)
      : 'total'

  const categoryParams = Array.isArray(params.category)
    ? params.category
    : params.category
      ? [params.category]
      : []

  const page = Math.max(1, Number(params.page ?? 1) || 1)
  const rangeStart = getRangeStart(range)

  const [categories, sessions] = await Promise.all([
    prisma.category.findMany({
      select: { slug: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.playSession.findMany({
      where: {
        ...(rangeStart ? { createdAt: { gte: rangeStart } } : {}),
        ...(mode !== 'ALL' ? { mode } : {}),
        ...(categoryParams.length
          ? {
              quiz: {
                category: {
                  slug: { in: categoryParams },
                },
              },
            }
          : {}),
      },
      include: {
        user: {
          select: { id: true, name: true, username: true, image: true },
        },
      },
    }),
  ])

  const rows = sessions.reduce<Record<string, LeaderboardRow>>((acc, sessionRow) => {
    const key = sessionRow.userId
      ? `user:${sessionRow.userId}`
      : `guest:${sessionRow.guestName ?? 'Guest'}`

    if (!acc[key]) {
      acc[key] = {
        key,
        userId: sessionRow.userId,
        username: sessionRow.user?.username ?? null,
        image: sessionRow.user?.image ?? null,
        displayName: sessionRow.user?.name ?? sessionRow.guestName ?? 'Guest',
        totalScore: 0,
        bestScore: 0,
        plays: 0,
        correct: 0,
        totalQuestions: 0,
        accuracy: 0,
      }
    }

    const row = acc[key]
    row.totalScore += sessionRow.score
    row.bestScore = Math.max(row.bestScore, sessionRow.score)
    row.plays += 1
    row.correct += sessionRow.correctCount
    row.totalQuestions += sessionRow.totalCount
    row.accuracy = row.totalQuestions > 0 ? (row.correct / row.totalQuestions) * 100 : 0

    return acc
  }, {})

  const sorted = Object.values(rows).sort((a, b) => {
    if (sort === 'best') return b.bestScore - a.bestScore || b.totalScore - a.totalScore
    if (sort === 'plays') return b.plays - a.plays || b.totalScore - a.totalScore
    if (sort === 'accuracy') return b.accuracy - a.accuracy || b.totalScore - a.totalScore
    return b.totalScore - a.totalScore || b.bestScore - a.bestScore
  })

  const ranked = sorted.map((row, index) => ({ ...row, rank: index + 1 }))
  const startIndex = (page - 1) * PAGE_SIZE
  const pageRows = ranked.slice(startIndex, startIndex + PAGE_SIZE)
  const totalPages = Math.max(1, Math.ceil(ranked.length / PAGE_SIZE))

  const currentUserRank = session?.user?.id
    ? ranked.find((row) => row.userId === session.user.id)
    : undefined
  const currentUserVisible =
    !!currentUserRank && pageRows.some((row) => row.userId && row.userId === session?.user?.id)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Global Leaderboard</h1>
        <form className="flex items-center gap-2" method="get">
          {range && <input type="hidden" name="range" value={range} />}
          {mode !== 'ALL' && <input type="hidden" name="mode" value={mode} />}
          {categoryParams.map((slug) => (
            <input key={slug} type="hidden" name="category" value={slug} />
          ))}
          <label className="text-sm text-muted-foreground" htmlFor="sort">
            Sort
          </label>
          <select
            id="sort"
            name="sort"
            defaultValue={sort}
            className="rounded-md border border-border bg-background px-2 py-1 text-sm"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button className="rounded-md border border-border px-2 py-1 text-sm" type="submit">
            Apply
          </button>
        </form>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(['all', 'week', 'today'] as RangeFilter[]).map((value) => {
          return (
            <Link
              key={value}
              href={`/leaderboard?${buildLeaderboardQuery({
                range: value,
                mode,
                sort,
                categories: categoryParams,
              })}`}
              className={`rounded-full px-3 py-1.5 text-sm ${
                range === value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {value === 'all' ? 'All-time' : value === 'week' ? 'This Week' : 'Today'}
            </Link>
          )
        })}

        <form method="get" className="ml-auto flex flex-wrap items-center gap-2">
          <input type="hidden" name="range" value={range} />
          <input type="hidden" name="sort" value={sort} />

          <select
            name="mode"
            defaultValue={mode}
            className="rounded-md border border-border bg-background px-2 py-1 text-sm"
          >
            <option value="ALL">All modes</option>
            <option value="CLASSIC">Classic</option>
            <option value="TIMED">Timed</option>
            <option value="SURVIVAL">Survival</option>
            <option value="DAILY">Daily</option>
          </select>

          <details className="rounded-md border border-border px-2 py-1 text-sm">
            <summary className="cursor-pointer">
              Categories ({categoryParams.length || 'All'})
            </summary>
            <div
              className="mt-2 max-h-48 space-y-1 overflow-auto pr-2"
              role="group"
              aria-label="Leaderboard category filters"
            >
              {categories.map((category) => (
                <label key={category.slug} className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    name="category"
                    value={category.slug}
                    defaultChecked={categoryParams.includes(category.slug)}
                  />
                  {category.name}
                </label>
              ))}
            </div>
          </details>

          <button className="rounded-md border border-border px-2 py-1 text-sm" type="submit">
            Filter
          </button>
        </form>
      </div>

      {pageRows.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <Trophy className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="font-semibold">No leaderboard entries yet for this filter.</p>
          <p className="text-sm text-muted-foreground">Try changing range, mode, or categories.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Player</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Best</th>
                <th className="px-4 py-3 text-right">Plays</th>
                <th className="px-4 py-3 text-right">Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row) => {
                const isCurrentUser = !!session?.user?.id && row.userId === session.user.id
                return (
                  <tr
                    key={row.key}
                    className={`border-t border-border ${isCurrentUser ? 'bg-primary/10' : ''}`}
                  >
                    <td className="px-4 py-3 font-semibold">
                      <div className="inline-flex items-center gap-1">
                        <span>#{row.rank}</span>
                        {medal(row.rank)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-quiz-purple to-quiz-pink text-xs font-bold text-white">
                          {row.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={row.image}
                              alt={row.displayName}
                              className="h-full w-full rounded-full object-cover"
                            />
                          ) : (
                            initials(row.displayName)
                          )}
                        </div>
                        {row.userId && row.username ? (
                          <Link href={`/u/${row.username}`} className="font-medium hover:underline">
                            {row.displayName}
                          </Link>
                        ) : (
                          <span className="font-medium">{row.displayName}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {row.totalScore.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">{row.bestScore.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">{row.plays.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">{row.accuracy.toFixed(1)}%</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Page {page} / {totalPages}
        </span>
        <div className="flex items-center gap-2">
          {page > 1 ? (
            <Link
              href={`/leaderboard?${buildLeaderboardQuery({
                range,
                mode,
                sort,
                page: page - 1,
                categories: categoryParams,
              })}`}
              className="rounded border border-border px-3 py-1"
            >
              Previous
            </Link>
          ) : (
            <span />
          )}
          {page < totalPages && (
            <Link
              href={`/leaderboard?${buildLeaderboardQuery({
                range,
                mode,
                sort,
                page: page + 1,
                categories: categoryParams,
              })}`}
              className="rounded border border-border px-3 py-1"
            >
              Next
            </Link>
          )}
        </div>
      </div>

      {!!currentUserRank && !currentUserVisible && (
        <div className="sticky bottom-4 mt-6 rounded-xl border border-primary/40 bg-background/95 p-3 shadow-xl backdrop-blur">
          <p className="text-sm text-muted-foreground">Your rank</p>
          <p className="font-semibold">
            #{currentUserRank.rank} • {currentUserRank.totalScore.toLocaleString()} total •{' '}
            {currentUserRank.accuracy.toFixed(1)}% accuracy
          </p>
        </div>
      )}
    </div>
  )
}
