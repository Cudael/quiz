import { levelForXp, xpForLevel } from './leveling'
import { computeStreak as computeStreakDetailed } from './streak'

/**
 * Pure scoring functions for QuizArena.
 * All logic is server-authoritative; these functions run on both client (display)
 * and server (submission validation).
 */

// ---------------------------------------------------------------------------
// Question scoring
// ---------------------------------------------------------------------------

interface ScoreQuestionParams {
  correct: boolean
  timeRemainingMs: number
  timeLimitMs: number
  /** Survival streak count (0 = no multiplier) */
  streak?: number
}

/**
 * Compute per-question score.
 * base = 100 if correct, 0 if wrong
 * speedBonus = round(100 * timeRemaining / timeLimit) if correct
 * survivalMultiplier = 1 + 0.25 * floor(streak / 3)  (applied to whole score)
 */
export function scoreQuestion({
  correct,
  timeRemainingMs,
  timeLimitMs,
  streak = 0,
}: ScoreQuestionParams): number {
  if (!correct) return 0
  const base = 100
  const ratio = timeLimitMs > 0 ? Math.min(1, Math.max(0, timeRemainingMs / timeLimitMs)) : 0
  const speedBonus = Math.round(100 * ratio)
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
