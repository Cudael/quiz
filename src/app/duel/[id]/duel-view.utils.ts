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

export function getOptimisticPoints() {
  return scoreQuestion({ correct: true })
}
