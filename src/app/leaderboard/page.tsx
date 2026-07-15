import type { Metadata } from 'next'
import Link from 'next/link'
import { Trophy } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page-header'
import { copy } from '@/lib/copy'
import { absoluteUrl } from '@/lib/site'
import { getQuizPath } from '@/lib/quiz-url'
import { auth } from '@/server/auth'
import { getLeaderboardRows } from '@/server/leaderboard'
import { prisma } from '@/server/prisma'
import { CurrentUserRank } from './_components/current-user-rank'
import { LeaderboardFilters } from './_components/leaderboard-filters'
import { LeaderboardPagination } from './_components/leaderboard-pagination'
import { LeaderboardTable } from './_components/leaderboard-table'
import { parseLeaderboardSearchParams, type LeaderboardSearchParams } from './params'

const PAGE_SIZE = 50

// CDN cache: serve stale for 60s to absorb crawler/bot traffic.
// The underlying DB query is already cached for 300s via unstable_cache.
export const revalidate = 60

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<LeaderboardSearchParams>
}): Promise<Metadata> {
  const params = parseLeaderboardSearchParams(await searchParams)
  const periodLabel =
    params.period === 'today'
      ? 'Today'
      : params.period === 'week'
        ? 'This Week'
        : params.period === 'season'
          ? 'This Season'
          : 'All-time'
  const [quiz, latestPlay] = await Promise.all([
    params.quizId
      ? prisma.quiz.findUnique({
          where: { id: params.quizId },
          select: { title: true },
        })
      : null,
    prisma.playSession.findFirst({ select: { id: true } }),
  ])
  const categoryLabel = params.categories[0]
  const suffix = [quiz?.title, categoryLabel].filter(Boolean).join(' • ')
  const title = `Leaderboard — ${periodLabel}${suffix ? ` • ${suffix}` : ''}`

  // Only index the base leaderboard; filtered views are crawl bait
  const hasFilters =
    params.period !== 'all' ||
    params.sort !== 'total' ||
    !!params.quizId ||
    params.categories.length > 0

  return {
    title,
    description:
      'See top performers, filter by mode and category, and chase your next personal best.',
    robots: hasFilters || !latestPlay ? { index: false, follow: true } : undefined,
    alternates: { canonical: '/leaderboard' },
    openGraph: {
      title,
      description: 'Track top players on the BusQuiz leaderboard.',
      url: absoluteUrl('/leaderboard'),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: 'Track top players on the BusQuiz leaderboard.',
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
  const { categories: categoryParams, page, period, quizId, scope, sort } = params

  let friendIds: string[] | undefined
  if (scope === 'friends') {
    if (session?.user?.id) {
      const following = await prisma.follow.findMany({
        where: { followerId: session.user.id },
        select: { followingId: true },
      })
      friendIds = [session.user.id, ...following.map((f) => f.followingId)]
    } else {
      friendIds = []
    }
  }

  const [categories, quiz, rankedRows] = await Promise.all([
    prisma.category.findMany({
      select: { slug: true, name: true },
      orderBy: { name: 'asc' },
    }),
    quizId
      ? prisma.quiz.findUnique({
          where: { id: quizId },
          select: { id: true, title: true, slug: true },
        })
      : null,
    getLeaderboardRows({
      period,
      sort,
      categories: categoryParams,
      quizId,
      userIds: friendIds,
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
      <PageHeader
        className="mb-6"
        eyebrow="Compete"
        accent="yellow"
        title={quiz ? `${quiz.title} Leaderboard` : 'Global Leaderboard'}
        description={
          quiz ? 'Compare runs for this quiz only.' : 'Track the top players across every quiz.'
        }
        actions={
          quiz ? (
            <Link
              href={getQuizPath(quiz)}
              className="rounded-md border border-border px-3 py-2 text-sm"
            >
              Back to quiz
            </Link>
          ) : undefined
        }
      />

      <LeaderboardFilters
        period={period}
        sort={sort}
        scope={scope}
        isSignedIn={!!session?.user?.id}
        categoryParams={categoryParams}
        quizId={quizId}
        categories={categories}
      />

      {pageRows.length === 0 ? (
        <EmptyState
          icon={<Trophy className="h-8 w-8 text-muted-foreground" />}
          title={
            scope === 'friends' && !session?.user?.id
              ? 'Sign in to see your friends leaderboard'
              : copy.emptyStates.leaderboard
          }
          description={
            scope === 'friends'
              ? session?.user?.id
                ? 'Follow other players to compete with them here.'
                : 'The friends board ranks you against people you follow.'
              : 'Try changing period, mode, or categories.'
          }
        />
      ) : (
        <LeaderboardTable pageRows={pageRows} currentUserId={session?.user?.id} />
      )}

      <LeaderboardPagination
        page={page}
        totalPages={totalPages}
        period={period}
        sort={sort}
        scope={scope}
        categoryParams={categoryParams}
        quizId={quizId}
      />

      {!!currentUserRank && !currentUserVisible && <CurrentUserRank row={currentUserRank} />}
    </div>
  )
}
