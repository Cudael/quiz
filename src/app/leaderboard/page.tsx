import type { Metadata } from 'next'
import Link from 'next/link'
import { Medal, Trophy } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { EmptyState } from '@/components/ui/empty-state'
import { copy } from '@/lib/copy'
import { absoluteUrl } from '@/lib/site'
import { auth } from '@/server/auth'
import { getLeaderboardRows } from '@/server/leaderboard'
import { prisma } from '@/server/prisma'
import {
  buildLeaderboardQuery,
  parseLeaderboardSearchParams,
  toggleCategory,
  type LeaderboardSearchParams,
  type ModeFilter,
  type PeriodFilter,
  type SortFilter,
} from './params'

const PAGE_SIZE = 50
const sortOptions: Array<{ value: SortFilter; label: string }> = [
  { value: 'total', label: 'Total Score' },
  { value: 'best', label: 'Best Score' },
  { value: 'plays', label: 'Play Count' },
  { value: 'accuracy', label: 'Accuracy' },
]

function medal(rank: number) {
  if (rank === 1) return <Medal className="h-4 w-4 text-yellow-400" />
  if (rank === 2) return <Medal className="h-4 w-4 text-slate-300" />
  if (rank === 3) return <Medal className="h-4 w-4 text-amber-700" />
  return null
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<LeaderboardSearchParams>
}): Promise<Metadata> {
  const params = parseLeaderboardSearchParams(await searchParams)
  const periodLabel =
    params.period === 'today' ? 'Today' : params.period === 'week' ? 'This Week' : 'All-time'
  const quiz = params.quizId
    ? await prisma.quiz.findUnique({
        where: { id: params.quizId },
        select: { title: true },
      })
    : null
  const categoryLabel = params.categories[0]
  const suffix = [quiz?.title, categoryLabel].filter(Boolean).join(' • ')
  const title = `Leaderboard — ${periodLabel}${suffix ? ` • ${suffix}` : ''} | QuizArena`

  return {
    title,
    description:
      'See top performers, filter by mode and category, and chase your next personal best.',
    openGraph: {
      title,
      description: 'Track top players on the QuizArena leaderboard.',
      url: absoluteUrl('/leaderboard'),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: 'Track top players on the QuizArena leaderboard.',
    },
  }
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<LeaderboardSearchParams>
}) {
  const params = parseLeaderboardSearchParams(await searchParams)
  const session = await auth()
  const { categories: categoryParams, mode, page, period, quizId, sort } = params

  const [categories, quiz, rankedRows] = await Promise.all([
    prisma.category.findMany({
      select: { slug: true, name: true },
      orderBy: { name: 'asc' },
    }),
    quizId
      ? prisma.quiz.findUnique({
          where: { id: quizId },
          select: { id: true, title: true },
        })
      : null,
    getLeaderboardRows({
      period,
      mode,
      sort,
      categories: categoryParams,
      quizId,
    }),
  ])

  const rows = rankedRows.map((row, index) => ({ ...row, rank: index + 1 }))
  const startIndex = (page - 1) * PAGE_SIZE
  const pageRows = rows.slice(startIndex, startIndex + PAGE_SIZE)
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))

  const currentUserRank = session?.user?.id
    ? rows.find((row) => row.userId === session.user.id)
    : undefined
  const currentUserVisible =
    !!currentUserRank && pageRows.some((row) => row.userId === session?.user?.id)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">
            {quiz ? `${quiz.title} Leaderboard` : 'Global Leaderboard'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {quiz ? 'Compare runs for this quiz only.' : 'Track the top players across every quiz.'}
          </p>
        </div>
        {quiz ? (
          <Link
            href={`/quiz/${quiz.id}`}
            className="rounded-md border border-border px-3 py-2 text-sm"
          >
            Back to quiz
          </Link>
        ) : null}
      </div>

      <div className="mb-4 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {(['all', 'week', 'today'] as PeriodFilter[]).map((value) => (
            <Link
              key={value}
              href={`/leaderboard?${buildLeaderboardQuery({
                period: value,
                mode,
                sort,
                categories: categoryParams,
                quizId,
              })}`}
              className={`rounded-full px-3 py-1.5 text-sm ${
                period === value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {value === 'all' ? 'All-time' : value === 'week' ? 'This Week' : 'Today'}
            </Link>
          ))}

          {quizId ? (
            <Link
              href={`/leaderboard?${buildLeaderboardQuery({
                period,
                mode,
                sort,
                categories: categoryParams,
              })}`}
              className="rounded-full bg-muted px-3 py-1.5 text-sm text-muted-foreground"
            >
              Clear quiz filter
            </Link>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(['ALL', 'CLASSIC', 'TIMED', 'SURVIVAL', 'DAILY'] as ModeFilter[]).map((value) => (
            <Link
              key={value}
              href={`/leaderboard?${buildLeaderboardQuery({
                period,
                mode: value,
                sort,
                categories: categoryParams,
                quizId,
              })}`}
              className={`rounded-full px-3 py-1.5 text-sm ${
                mode === value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {value === 'ALL' ? 'All modes' : value}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {sortOptions.map((option) => (
            <Link
              key={option.value}
              href={`/leaderboard?${buildLeaderboardQuery({
                period,
                mode,
                sort: option.value,
                categories: categoryParams,
                quizId,
              })}`}
              className={`rounded-full px-3 py-1.5 text-sm ${
                sort === option.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {option.label}
            </Link>
          ))}
        </div>

        <details className="rounded-xl border border-border p-3">
          <summary className="cursor-pointer text-sm font-medium">
            Categories ({categoryParams.length || 'All'})
          </summary>
          <div
            className="mt-3 flex flex-wrap gap-2"
            role="group"
            aria-label="Leaderboard category filters"
          >
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/leaderboard?${buildLeaderboardQuery({
                  period,
                  mode,
                  sort,
                  categories: toggleCategory(categoryParams, category.slug),
                  quizId,
                })}`}
                className={`rounded-full px-3 py-1.5 text-sm ${
                  categoryParams.includes(category.slug)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </details>
      </div>

      {pageRows.length === 0 ? (
        <EmptyState
          icon={<Trophy className="h-8 w-8 text-muted-foreground" />}
          title={copy.emptyStates.leaderboard}
          description="Try changing period, mode, or categories."
        />
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
                        <Avatar
                          src={row.image}
                          alt={row.displayName}
                          fallback={row.displayName}
                          size="sm"
                        />
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
                period,
                mode,
                sort,
                page: page - 1,
                categories: categoryParams,
                quizId,
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
                period,
                mode,
                sort,
                page: page + 1,
                categories: categoryParams,
                quizId,
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
