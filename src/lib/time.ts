export const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000

/** Human-readable relative time ("3 days ago", "just now"). */
export function formatRelativeTime(timestamp: string | Date): string {
  const then = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp.getTime()
  if (Number.isNaN(then)) {
    return ''
  }

  const deltaSeconds = Math.floor((Date.now() - then) / 1000)
  if (deltaSeconds < 60) {
    return 'just now'
  }

  const steps = [
    { unit: 'year', seconds: 60 * 60 * 24 * 365 },
    { unit: 'month', seconds: 60 * 60 * 24 * 30 },
    { unit: 'week', seconds: 60 * 60 * 24 * 7 },
    { unit: 'day', seconds: 60 * 60 * 24 },
    { unit: 'hour', seconds: 60 * 60 },
    { unit: 'minute', seconds: 60 },
  ] as const

  for (const step of steps) {
    if (deltaSeconds >= step.seconds) {
      const value = Math.floor(deltaSeconds / step.seconds)
      return new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' }).format(-value, step.unit)
    }
  }

  return 'just now'
}
