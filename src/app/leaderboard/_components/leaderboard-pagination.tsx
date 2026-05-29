import Link from 'next/link'
import {
  buildLeaderboardQuery,
  type ModeFilter,
  type PeriodFilter,
  type SortFilter,
} from '../params'

interface LeaderboardPaginationProps {
  page: number
  totalPages: number
  period: PeriodFilter
  mode: ModeFilter
  sort: SortFilter
  categoryParams: string[]
  quizId?: string
}

export function LeaderboardPagination({
  page,
  totalPages,
  period,
  mode,
  sort,
  categoryParams,
  quizId,
}: LeaderboardPaginationProps) {
  return (
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
  )
}
