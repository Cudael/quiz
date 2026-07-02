export interface SeasonRange {
  /** Season key, e.g. "2026-06". */
  season: string
  start: Date
  end: Date
}

export function getSeasonKey(date: Date) {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

/** The season that just ended relative to `now` (the previous UTC calendar month). */
export function getPreviousSeasonRange(now: Date): SeasonRange {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1))
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  return { season: getSeasonKey(start), start, end }
}
