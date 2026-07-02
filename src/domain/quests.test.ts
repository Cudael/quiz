import { describe, expect, it } from 'vitest'
import { getQuestPeriodKey, parseQuestCriteria, questProgressDelta, questTarget } from './quests'

describe('parseQuestCriteria', () => {
  it('parses valid criteria shapes', () => {
    expect(parseQuestCriteria({ type: 'playQuizzes', count: 3 })).toEqual({
      type: 'playQuizzes',
      count: 3,
    })
    expect(parseQuestCriteria({ type: 'playQuizzes', count: 3, categorySlug: 'science' })).toEqual({
      type: 'playQuizzes',
      count: 3,
      categorySlug: 'science',
    })
    expect(parseQuestCriteria({ type: 'winDuels', count: 2 })).toEqual({
      type: 'winDuels',
      count: 2,
    })
    expect(parseQuestCriteria({ type: 'earnXp', amount: 500 })).toEqual({
      type: 'earnXp',
      amount: 500,
    })
  })

  it('rejects malformed criteria', () => {
    expect(parseQuestCriteria(null)).toBeNull()
    expect(parseQuestCriteria('playQuizzes')).toBeNull()
    expect(parseQuestCriteria({ type: 'playQuizzes', count: 0 })).toBeNull()
    expect(parseQuestCriteria({ type: 'unknown', count: 3 })).toBeNull()
  })
})

describe('questTarget', () => {
  it('uses count or amount depending on criteria', () => {
    expect(questTarget({ type: 'playQuizzes', count: 3 })).toBe(3)
    expect(questTarget({ type: 'earnXp', amount: 500 })).toBe(500)
  })
})

describe('questProgressDelta', () => {
  const played = {
    type: 'quizPlayed',
    categorySlug: 'science',
    isPerfect: false,
    xpEarned: 42,
  } as const

  it('counts quiz plays with optional category filter', () => {
    expect(questProgressDelta({ type: 'playQuizzes', count: 3 }, played)).toBe(1)
    expect(
      questProgressDelta({ type: 'playQuizzes', count: 3, categorySlug: 'science' }, played)
    ).toBe(1)
    expect(
      questProgressDelta({ type: 'playQuizzes', count: 3, categorySlug: 'history' }, played)
    ).toBe(0)
  })

  it('counts perfect scores and earned xp', () => {
    expect(questProgressDelta({ type: 'perfectScores', count: 1 }, played)).toBe(0)
    expect(
      questProgressDelta({ type: 'perfectScores', count: 1 }, { ...played, isPerfect: true })
    ).toBe(1)
    expect(questProgressDelta({ type: 'earnXp', amount: 500 }, played)).toBe(42)
  })

  it('counts duel plays and wins', () => {
    expect(
      questProgressDelta({ type: 'playDuels', count: 3 }, { type: 'duelPlayed', won: false })
    ).toBe(1)
    expect(
      questProgressDelta({ type: 'winDuels', count: 2 }, { type: 'duelPlayed', won: false })
    ).toBe(0)
    expect(
      questProgressDelta({ type: 'winDuels', count: 2 }, { type: 'duelPlayed', won: true })
    ).toBe(1)
    expect(
      questProgressDelta({ type: 'playQuizzes', count: 3 }, { type: 'duelPlayed', won: true })
    ).toBe(0)
  })
})

describe('getQuestPeriodKey', () => {
  it('formats daily, weekly, and monthly period keys in UTC', () => {
    const date = new Date('2026-07-02T15:30:00Z') // Thursday, ISO week 27
    expect(getQuestPeriodKey('DAILY', date)).toBe('2026-07-02')
    expect(getQuestPeriodKey('WEEKLY', date)).toBe('2026-W27')
    expect(getQuestPeriodKey('MONTHLY', date)).toBe('2026-07')
  })

  it('handles ISO week boundaries around new year', () => {
    // 2027-01-01 is a Friday and belongs to ISO week 53 of 2026.
    expect(getQuestPeriodKey('WEEKLY', new Date('2027-01-01T00:00:00Z'))).toBe('2026-W53')
    // 2024-12-30 is a Monday and belongs to ISO week 1 of 2025.
    expect(getQuestPeriodKey('WEEKLY', new Date('2024-12-30T00:00:00Z'))).toBe('2025-W01')
  })
})
