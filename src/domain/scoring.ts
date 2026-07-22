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
  /** Time spent answering. A valid value enables the speed bonus. */
  timeTakenMs?: number
  /** Question time limit used to calculate the remaining-time ratio. */
  timeLimitMs?: number
  mode?: 'STANDARD' | 'DAILY' | 'PRACTICE' | 'BLITZ'
}

const BASE_POINTS = 10
const MAX_SPEED_BONUS = 5
const BLITZ_MULTIPLIER = 1.2

/**
 * Compute per-question score.
 * A fully-correct answer earns 10 base points plus up to 5 points based on the
 * percentage of question time remaining. Blitz applies a 20% multiplier after
 * the speed bonus. Partial-credit question types earn the same proportion of
 * the combined score; wrong answers always earn 0.
 *
 * `Question.points` is intentionally not accepted here: changing to weighted
 * questions requires a data and leaderboard migration.
 */
export function scoreQuestion({
  correct,
  credit,
  timeTakenMs,
  timeLimitMs,
  mode = 'STANDARD',
}: ScoreQuestionParams): number {
  const effectiveCredit = Math.min(1, Math.max(0, credit ?? (correct ? 1 : 0)))
  if (effectiveCredit === 0) return 0

  const hasValidTiming =
    Number.isFinite(timeTakenMs) &&
    Number.isFinite(timeLimitMs) &&
    timeTakenMs !== undefined &&
    timeLimitMs !== undefined &&
    timeLimitMs > 0
  const remainingRatio = hasValidTiming
    ? 1 - Math.min(1, Math.max(0, timeTakenMs / timeLimitMs))
    : 0
  const pointsBeforeMode = (BASE_POINTS + MAX_SPEED_BONUS * remainingRatio) * effectiveCredit
  const modeMultiplier = mode === 'BLITZ' ? BLITZ_MULTIPLIER : 1

  return Math.round(pointsBeforeMode * modeMultiplier)
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
