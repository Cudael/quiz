interface ComputeStreakInput {
  lastPlayedAt: Date | null
  currentStreakDays: number
  bestStreak: number
  now: Date
  /** Streak freezes the user currently owns. Defaults to 0. */
  streakFreezes?: number
}

interface ComputeStreakResult {
  newStreakDays: number
  newBestStreakDays: number
  wasReset: boolean
  wasIncremented: boolean
  /** True when a freeze was consumed to save a streak that would have reset. */
  usedFreeze: boolean
  /** True when this play earned a new freeze (every 7th consecutive day). */
  earnedFreeze: boolean
  newStreakFreezes: number
}

const DAY_MS = 24 * 60 * 60 * 1000
const GRACE_WINDOW_MS = 36 * 60 * 60 * 1000

export const MAX_STREAK_FREEZES = 3
export const FREEZE_EARN_INTERVAL_DAYS = 7

function utcDayStart(date: Date) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}

/**
 * Streaks are computed in UTC day boundaries for deterministic server behavior.
 * Beyond the 36-hour grace window, an owned streak freeze is consumed to keep
 * the streak alive. Freezes are earned every 7th consecutive day (capped).
 */
export function computeStreak({
  lastPlayedAt,
  currentStreakDays,
  bestStreak,
  now,
  streakFreezes = 0,
}: ComputeStreakInput): ComputeStreakResult {
  let newStreakDays = 1
  let wasReset = false
  let wasIncremented = true
  let usedFreeze = false

  if (lastPlayedAt) {
    const nowStart = utcDayStart(now)
    const lastStart = utcDayStart(lastPlayedAt)
    const dayDiff = Math.floor((nowStart - lastStart) / DAY_MS)

    if (dayDiff <= 0) {
      newStreakDays = Math.max(1, currentStreakDays)
      wasIncremented = false
      wasReset = false
    } else if (dayDiff === 1) {
      // Played exactly yesterday (UTC day boundary) → increment.
      newStreakDays = Math.max(1, currentStreakDays) + 1
    } else if (now.getTime() - lastPlayedAt.getTime() <= GRACE_WINDOW_MS) {
      newStreakDays = Math.max(1, currentStreakDays) + 1
    } else if (streakFreezes > 0 && currentStreakDays > 0) {
      // A freeze repairs the missed window and the streak continues.
      usedFreeze = true
      newStreakDays = Math.max(1, currentStreakDays) + 1
    } else {
      newStreakDays = 1
      wasReset = true
    }
  }

  const earnedFreeze =
    wasIncremented &&
    !wasReset &&
    newStreakDays > 0 &&
    newStreakDays % FREEZE_EARN_INTERVAL_DAYS === 0 &&
    streakFreezes - (usedFreeze ? 1 : 0) < MAX_STREAK_FREEZES

  const newStreakFreezes = Math.min(
    MAX_STREAK_FREEZES,
    Math.max(0, streakFreezes - (usedFreeze ? 1 : 0) + (earnedFreeze ? 1 : 0))
  )

  return {
    newStreakDays,
    newBestStreakDays: Math.max(bestStreak, newStreakDays),
    wasReset,
    wasIncremented,
    usedFreeze,
    earnedFreeze,
    newStreakFreezes,
  }
}
