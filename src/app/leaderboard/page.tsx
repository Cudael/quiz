import type { Metadata } from 'next'
import Link from 'next/link'
import { Trophy } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
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
  const title = `Leaderboard — ${periodLabel}${suffix ? ` • ${suffix}` : ''} | BusQuiz`

  return {
    title,
    description:
      'See top performers, filter by mode and category, and chase your next personal best.',
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
  const { categories: categoryParams, page, period, quizId, sort } = params

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
            href={getQuizPath(quiz)}
            className="rounded-md border border-border px-3 py-2 text-sm"
          >
            Back to quiz
          </Link>
        ) : null}
      </div>

      <LeaderboardFilters
        period={period}
        sort={sort}
        categoryParams={categoryParams}
        quizId={quizId}
        categories={categories}
      />

      {pageRows.length === 0 ? (
        <EmptyState
          icon={<Trophy className="h-8 w-8 text-muted-foreground" />}
          title={copy.emptyStates.leaderboard}
          description="Try changing period, mode, or categories."
        />
      ) : (
        <LeaderboardTable pageRows={pageRows} currentUserId={session?.user?.id} />
      )}

      <LeaderboardPagination
        page={page}
        totalPages={totalPages}
        period={period}
        sort={sort}
        categoryParams={categoryParams}
        quizId={quizId}
      />

      {!!currentUserRank && !currentUserVisible && <CurrentUserRank row={currentUserRank} />}
    </div>
  )
}
