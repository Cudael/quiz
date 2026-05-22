import { describe, it, expect } from 'vitest'
import { dailySeed, seededShuffle } from '@/server/daily-seed'

describe('dailySeed', () => {
  it('returns the same seed for the same date and quizId', () => {
    const date = new Date('2024-06-15T00:00:00Z')
    const quizId = 'quiz-abc-123'
    expect(dailySeed(date, quizId)).toBe(dailySeed(date, quizId))
  })

  it('returns different seeds for different dates', () => {
    const date1 = new Date('2024-06-15T00:00:00Z')
    const date2 = new Date('2024-06-16T00:00:00Z')
    const quizId = 'quiz-abc-123'
    expect(dailySeed(date1, quizId)).not.toBe(dailySeed(date2, quizId))
  })

  it('returns different seeds for different quizIds', () => {
    const date = new Date('2024-06-15T00:00:00Z')
    expect(dailySeed(date, 'quiz-1')).not.toBe(dailySeed(date, 'quiz-2'))
  })

  it('ignores time-of-day — same UTC date always gives same seed', () => {
    const morning = new Date('2024-06-15T06:00:00Z')
    const evening = new Date('2024-06-15T22:59:59Z')
    const quizId = 'quiz-xyz'
    expect(dailySeed(morning, quizId)).toBe(dailySeed(evening, quizId))
  })

  it('returns a non-negative 32-bit integer', () => {
    const seed = dailySeed(new Date('2024-01-01'), 'test')
    expect(seed).toBeGreaterThanOrEqual(0)
    expect(seed).toBeLessThanOrEqual(0xffffffff)
    expect(Number.isInteger(seed)).toBe(true)
  })
})

describe('seededShuffle', () => {
  const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

  it('preserves all elements', () => {
    const shuffled = seededShuffle(items, 42)
    expect(shuffled).toHaveLength(items.length)
    expect([...shuffled].sort((a, b) => a - b)).toEqual(items)
  })

  it('is deterministic for the same seed', () => {
    const s1 = seededShuffle(items, 12345)
    const s2 = seededShuffle(items, 12345)
    expect(s1).toEqual(s2)
  })

  it('produces different orderings for different seeds', () => {
    const s1 = seededShuffle(items, 111)
    const s2 = seededShuffle(items, 222)
    expect(s1).not.toEqual(s2)
  })

  it('does not mutate the original array', () => {
    const original = [1, 2, 3, 4, 5]
    const copy = [...original]
    seededShuffle(original, 99)
    expect(original).toEqual(copy)
  })

  it('different dates → different question orderings', () => {
    const quizId = 'quiz-date-test'
    const questionIds = ['q1', 'q2', 'q3', 'q4', 'q5']
    const date1 = new Date('2024-06-15')
    const date2 = new Date('2024-06-16')
    const order1 = seededShuffle(questionIds, dailySeed(date1, quizId))
    const order2 = seededShuffle(questionIds, dailySeed(date2, quizId))
    expect(order1).not.toEqual(order2)
  })
})
