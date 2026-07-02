import { WEEK_IN_MS } from '@/lib/time'

export type PeriodFilter = 'all' | 'week' | 'today' | 'season'
export type SortFilter = 'best' | 'total' | 'plays' | 'accuracy'
export type ScopeFilter = 'global' | 'friends'

export interface LeaderboardSearchParams {
  period?: string
  range?: string
  sort?: string
  scope?: string
  page?: string
  category?: string | string[]
  quizId?: string
}

export interface ParsedLeaderboardSearchParams {
  period: PeriodFilter
  sort: SortFilter
  scope: ScopeFilter
  page: number
  categories: string[]
  quizId?: string
}

export function parseLeaderboardSearchParams(
  params: LeaderboardSearchParams
): ParsedLeaderboardSearchParams {
  const requestedPeriod = params.period ?? params.range
  const period: PeriodFilter =
    requestedPeriod === 'today' || requestedPeriod === 'week' || requestedPeriod === 'season'
      ? requestedPeriod
      : 'all'

  const sort =
    params.sort && ['best', 'total', 'plays', 'accuracy'].includes(params.sort)
      ? (params.sort as SortFilter)
      : 'total'

  const scope: ScopeFilter = params.scope === 'friends' ? 'friends' : 'global'

  const page = Math.max(1, Number(params.page ?? '1'))
  const categories = Array.from(
    new Set(
      (Array.isArray(params.category) ? params.category : params.category ? [params.category] : [])
        .map((value) => value.trim())
        .filter(Boolean)
    )
  )
  const quizId = params.quizId?.trim() || undefined

  return {
    period,
    sort,
    scope,
    page,
    categories,
    quizId,
  }
}

export function buildLeaderboardQuery({
  period,
  sort,
  scope,
  page,
  categories,
  quizId,
}: {
  period: PeriodFilter
  sort: SortFilter
  scope?: ScopeFilter
  page?: number
  categories: string[]
  quizId?: string
}) {
  const query = new URLSearchParams()
  query.set('period', period)
  if (sort !== 'total') query.set('sort', sort)
  if (scope && scope !== 'global') query.set('scope', scope)
  if (page && page > 1) query.set('page', String(page))
  if (quizId) query.set('quizId', quizId)
  categories.forEach((slug) => query.append('category', slug))
  return query.toString()
}

export function getPeriodStart(period: PeriodFilter): Date | undefined {
  const now = new Date()
  if (period === 'today') {
    const start = new Date(now)
    start.setUTCHours(0, 0, 0, 0)
    return start
  }

  if (period === 'week') {
    return new Date(now.getTime() - WEEK_IN_MS)
  }

  if (period === 'season') {
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  }

  return undefined
}

export function toggleCategory(categories: string[], slug: string) {
  return categories.includes(slug)
    ? categories.filter((value) => value !== slug)
    : [...categories, slug]
}
