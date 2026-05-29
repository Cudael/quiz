import { scoreQuestion } from '@/domain/scoring'

export async function readErrorMessage(response: Response, fallback: string) {
  try {
    const payload = (await response.json()) as { error?: string }
    return payload.error ?? fallback
  } catch {
    return fallback
  }
}

export function normalizeAnswer(value: string) {
  return value.trim().toLowerCase()
}

export function getOptimisticPoints(timeLimitSec: number, timeTakenMs: number) {
  const timeLimitMs = timeLimitSec * 1000
  const clampedTime = Math.min(Math.max(0, timeTakenMs), timeLimitMs)
  return scoreQuestion({
    correct: true,
    timeRemainingMs: timeLimitMs - clampedTime,
    timeLimitMs,
    streak: 0,
  })
}
