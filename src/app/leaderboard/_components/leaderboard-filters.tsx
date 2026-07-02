import Link from 'next/link'
import {
  buildLeaderboardQuery,
  toggleCategory,
  type PeriodFilter,
  type ScopeFilter,
  type SortFilter,
} from '../params'

const sortOptions: Array<{ value: SortFilter; label: string }> = [
  { value: 'total', label: 'Total Score' },
  { value: 'best', label: 'Best Score' },
  { value: 'plays', label: 'Play Count' },
  { value: 'accuracy', label: 'Accuracy' },
]

const periodLabels: Record<PeriodFilter, string> = {
  all: 'All-time',
  season: 'This Season',
  week: 'This Week',
  today: 'Today',
}

interface LeaderboardFiltersProps {
  period: PeriodFilter
  sort: SortFilter
  scope: ScopeFilter
  isSignedIn: boolean
  categoryParams: string[]
  quizId?: string
  categories: Array<{ slug: string; name: string }>
}

export function LeaderboardFilters({
  period,
  sort,
  scope,
  isSignedIn,
  categoryParams,
  quizId,
  categories,
}: LeaderboardFiltersProps) {
  return (
    <div className="mb-4 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(['all', 'season', 'week', 'today'] as PeriodFilter[]).map((value) => (
          <Link
            key={value}
            href={`/leaderboard?${buildLeaderboardQuery({
              period: value,
              sort,
              scope,
              categories: categoryParams,
              quizId,
            })}`}
            className={`rounded-sm px-3 py-1.5 text-sm font-medium transition-colors ${
              period === value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-foreground/10'
            }`}
          >
            {periodLabels[value]}
          </Link>
        ))}

        <span className="mx-1 h-5 w-px bg-border" aria-hidden />

        {(['global', 'friends'] as ScopeFilter[]).map((value) => (
          <Link
            key={value}
            href={`/leaderboard?${buildLeaderboardQuery({
              period,
              sort,
              scope: value,
              categories: categoryParams,
              quizId,
            })}`}
            className={`rounded-sm px-3 py-1.5 text-sm font-medium transition-colors ${
              scope === value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-foreground/10'
            }`}
            title={
              value === 'friends' && !isSignedIn
                ? 'Sign in to compare with people you follow'
                : undefined
            }
          >
            {value === 'global' ? 'Everyone' : 'Friends'}
          </Link>
        ))}

        {quizId ? (
          <Link
            href={`/leaderboard?${buildLeaderboardQuery({
              period,
              sort,
              scope,
              categories: categoryParams,
            })}`}
            className="rounded-sm bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-foreground/10"
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
              scope,
              categories: categoryParams,
              quizId,
            })}`}
            className={`rounded-sm px-3 py-1.5 text-sm font-medium transition-colors ${
              sort === option.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-foreground/10'
            }`}
          >
            {option.label}
          </Link>
        ))}
      </div>

      <details className="rounded-md border border-border p-3">
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
                scope,
                categories: toggleCategory(categoryParams, category.slug),
                quizId,
              })}`}
              className={`rounded-sm px-3 py-1.5 text-sm font-medium transition-colors ${
                categoryParams.includes(category.slug)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-foreground/10'
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
