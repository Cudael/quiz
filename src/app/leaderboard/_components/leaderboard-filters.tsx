import Link from 'next/link'
import {
  buildLeaderboardQuery,
  toggleCategory,
  type PeriodFilter,
  type SortFilter,
} from '../params'

const sortOptions: Array<{ value: SortFilter; label: string }> = [
  { value: 'total', label: 'Total Score' },
  { value: 'best', label: 'Best Score' },
  { value: 'plays', label: 'Play Count' },
  { value: 'accuracy', label: 'Accuracy' },
]

interface LeaderboardFiltersProps {
  period: PeriodFilter
  sort: SortFilter
  categoryParams: string[]
  quizId?: string
  categories: Array<{ slug: string; name: string }>
}

export function LeaderboardFilters({
  period,
  sort,
  categoryParams,
  quizId,
  categories,
}: LeaderboardFiltersProps) {
  return (
    <div className="mb-4 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(['all', 'week', 'today'] as PeriodFilter[]).map((value) => (
          <Link
            key={value}
            href={`/leaderboard?${buildLeaderboardQuery({
              period: value,
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
        {sortOptions.map((option) => (
          <Link
            key={option.value}
            href={`/leaderboard?${buildLeaderboardQuery({
              period,
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
  )
}
