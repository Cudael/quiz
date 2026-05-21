interface ComputeStreakInput {
  lastPlayedAt: Date | null
  currentStreakDays: number
  bestStreakDays: number
  now: Date
}

interface ComputeStreakResult {
  newStreakDays: number
  newBestStreakDays: number
  wasReset: boolean
  wasIncremented: boolean
}

const DAY_MS = 24 * 60 * 60 * 1000
const GRACE_WINDOW_MS = 36 * 60 * 60 * 1000

function utcDayStart(date: Date) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}

/**
 * Streaks are computed in UTC day boundaries for deterministic server behavior.
 */
export function computeStreak({
  lastPlayedAt,
  currentStreakDays,
  bestStreakDays,
  now,
}: ComputeStreakInput): ComputeStreakResult {
  let newStreakDays = 1
  let wasReset = false
  let wasIncremented = true

  if (lastPlayedAt) {
    const nowStart = utcDayStart(now)
    const lastStart = utcDayStart(lastPlayedAt)
    const dayDiff = Math.floor((nowStart - lastStart) / DAY_MS)

    if (dayDiff <= 0) {
      newStreakDays = Math.max(1, currentStreakDays)
      wasIncremented = false
      wasReset = false
    } else if (dayDiff === 1) {
      newStreakDays = Math.max(1, currentStreakDays) + 1
    } else if (now.getTime() - lastPlayedAt.getTime() <= GRACE_WINDOW_MS) {
      newStreakDays = Math.max(1, currentStreakDays) + 1
    } else {
      newStreakDays = 1
      wasReset = true
    }
  }

  return {
    newStreakDays,
    newBestStreakDays: Math.max(bestStreakDays, newStreakDays),
    wasReset,
    wasIncremented,
  }
}
