import { levelForXp, xpForLevel } from './leveling'
import { computeStreak as computeStreakDetailed } from './streak'

/**
 * Pure scoring functions for BusQuiz.
 * All logic is server-authoritative; these functions run on both client (display)
 * and server (submission validation).
 */

// ---------------------------------------------------------------------------
// Question scoring
// ---------------------------------------------------------------------------

interface ScoreQuestionParams {
  correct?: boolean
  /** Partial credit 0..1 (overrides `correct` when provided). */
  credit?: number
  timeRemainingMs: number
  timeLimitMs: number
  /** Survival streak count (0 = no multiplier) */
  streak?: number
}

/**
 * Compute per-question score.
 * base = round(100 * credit) — credit is 1 for fully correct, 0 for wrong,
 *   and may be fractional for partial-credit question types (ORDER, MATCH,
 *   GROUPS, NUMBER_GUESS, list-mode FILL_BLANK)
 * speedBonus = round(100 * timeRemaining / timeLimit) only when fully correct
 * survivalMultiplier = 1 + 0.25 * floor(streak / 3)  (applied to whole score)
 */
export function scoreQuestion({
  correct,
  credit,
  timeRemainingMs,
  timeLimitMs,
  streak = 0,
}: ScoreQuestionParams): number {
  const effectiveCredit = Math.min(1, Math.max(0, credit ?? (correct ? 1 : 0)))
  if (effectiveCredit <= 0) return 0
  const base = Math.round(100 * effectiveCredit)
  const ratio = timeLimitMs > 0 ? Math.min(1, Math.max(0, timeRemainingMs / timeLimitMs)) : 0
  const speedBonus = effectiveCredit === 1 ? Math.round(100 * ratio) : 0
  const rawScore = base + speedBonus
  const multiplier = 1 + 0.25 * Math.floor(streak / 3)
  return Math.round(rawScore * multiplier)
}

// ---------------------------------------------------------------------------
// XP / Level
// ---------------------------------------------------------------------------

/**
 * XP required to reach level n (cumulative).
 * xpForLevel(n) = 100 * n * (n + 1) / 2
 */
export { xpForLevel, levelForXp }

/**
 * Return the level a player is at given their total XP.
 * Level starts at 1.
 */
interface StreakResult {
  newStreakDays: number
  wasReset: boolean
}

/**
 * Compute updated streak given the last play timestamp and current time.
 * Grace window: last play was yesterday OR today within 36h of last increment.
 */
export function computeStreak(
  lastPlayedAt: Date | null,
  now: Date,
  currentStreakDays: number
): StreakResult {
  const result = computeStreakDetailed({
    lastPlayedAt,
    currentStreakDays,
    bestStreak: currentStreakDays,
    now,
  })
  return { newStreakDays: result.newStreakDays, wasReset: result.wasReset }
}
