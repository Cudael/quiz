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
}

/**
 * Compute per-question score.
 * Flat 10 points per fully-correct answer, proportional for partial-credit
 * question types (ORDER, MATCH, GROUPS, NUMBER_GUESS, list-mode FILL_BLANK),
 * 0 for wrong.
 */
export function scoreQuestion({ correct, credit }: ScoreQuestionParams): number {
  const effectiveCredit = Math.min(1, Math.max(0, credit ?? (correct ? 1 : 0)))
  return Math.round(10 * effectiveCredit)
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
