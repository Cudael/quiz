export type QuestPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY'

export type QuestCriteria =
  | { type: 'playQuizzes'; count: number; categorySlug?: string }
  | { type: 'winDuels'; count: number }
  | { type: 'playDuels'; count: number }
  | { type: 'perfectScores'; count: number }
  | { type: 'earnXp'; amount: number }

export type QuestEvent =
  | { type: 'quizPlayed'; categorySlug: string; isPerfect: boolean; xpEarned: number }
  | { type: 'duelPlayed'; won: boolean }

export function parseQuestCriteria(value: unknown): QuestCriteria | null {
  if (!value || typeof value !== 'object') return null
  const record = value as Record<string, unknown>

  if (record.type === 'playQuizzes' && typeof record.count === 'number' && record.count > 0) {
    return {
      type: 'playQuizzes',
      count: record.count,
      ...(typeof record.categorySlug === 'string' && record.categorySlug
        ? { categorySlug: record.categorySlug }
        : {}),
    }
  }
  if (record.type === 'winDuels' && typeof record.count === 'number' && record.count > 0) {
    return { type: 'winDuels', count: record.count }
  }
  if (record.type === 'playDuels' && typeof record.count === 'number' && record.count > 0) {
    return { type: 'playDuels', count: record.count }
  }
  if (record.type === 'perfectScores' && typeof record.count === 'number' && record.count > 0) {
    return { type: 'perfectScores', count: record.count }
  }
  if (record.type === 'earnXp' && typeof record.amount === 'number' && record.amount > 0) {
    return { type: 'earnXp', amount: record.amount }
  }
  return null
}

export function questTarget(criteria: QuestCriteria): number {
  return criteria.type === 'earnXp' ? criteria.amount : criteria.count
}

/** How much progress `event` contributes toward `criteria`. */
export function questProgressDelta(criteria: QuestCriteria, event: QuestEvent): number {
  if (event.type === 'quizPlayed') {
    if (criteria.type === 'playQuizzes') {
      if (criteria.categorySlug && criteria.categorySlug !== event.categorySlug) return 0
      return 1
    }
    if (criteria.type === 'perfectScores') {
      return event.isPerfect ? 1 : 0
    }
    if (criteria.type === 'earnXp') {
      return Math.max(0, event.xpEarned)
    }
    return 0
  }

  if (event.type === 'duelPlayed') {
    if (criteria.type === 'playDuels') return 1
    if (criteria.type === 'winDuels') return event.won ? 1 : 0
    return 0
  }

  return 0
}

function isoWeek(date: Date): { year: number; week: number } {
  // ISO-8601 week number, computed in UTC.
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const dayNumber = (target.getUTCDay() + 6) % 7 // Monday = 0
  target.setUTCDate(target.getUTCDate() - dayNumber + 3) // nearest Thursday
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4))
  const firstDayNumber = (firstThursday.getUTCDay() + 6) % 7
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNumber + 3)
  const week = 1 + Math.round((target.getTime() - firstThursday.getTime()) / (7 * 24 * 3600 * 1000))
  return { year: target.getUTCFullYear(), week }
}

/** Stable identifier for the period instance a quest run belongs to (UTC). */
export function getQuestPeriodKey(period: QuestPeriod, now: Date): string {
  if (period === 'DAILY') {
    return now.toISOString().slice(0, 10)
  }
  if (period === 'WEEKLY') {
    const { year, week } = isoWeek(now)
    return `${year}-W${String(week).padStart(2, '0')}`
  }
  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}
