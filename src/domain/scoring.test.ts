import { describe, it, expect } from 'vitest'
import { scoreQuestion, xpForLevel, levelForXp, computeStreak } from '@/domain/scoring'

describe('scoreQuestion', () => {
  it('returns 0 for wrong answer', () => {
    expect(scoreQuestion({ correct: false })).toBe(0)
  })

  it('returns 10 for a fully correct answer', () => {
    expect(scoreQuestion({ correct: true })).toBe(10)
  })

  it('returns 0 for credit of 0', () => {
    expect(scoreQuestion({ credit: 0 })).toBe(0)
  })

  it('returns 10 for credit of 1', () => {
    expect(scoreQuestion({ credit: 1 })).toBe(10)
  })

  it('scales proportionally for partial credit', () => {
    // 0.75 credit (e.g. 3 of 4 matched) → round(10 * 0.75) = 8
    expect(scoreQuestion({ credit: 0.75 })).toBe(8)
  })

  it('rounds partial credit to the nearest point', () => {
    // 0.33 credit → round(10 * 0.33) = 3
    expect(scoreQuestion({ credit: 0.33 })).toBe(3)
  })

  it('clamps credit above 1 to a max of 10', () => {
    expect(scoreQuestion({ credit: 1.5 })).toBe(10)
  })

  it('clamps negative credit to 0', () => {
    expect(scoreQuestion({ credit: -0.5 })).toBe(0)
  })
})

describe('xpForLevel', () => {
  it('xpForLevel(1) = 0', () => expect(xpForLevel(1)).toBe(0))
  it('xpForLevel(2) = 100', () => expect(xpForLevel(2)).toBe(100))
  it('xpForLevel(3) = 300', () => expect(xpForLevel(3)).toBe(300))
  it('xpForLevel(10) = 4500', () => expect(xpForLevel(10)).toBe(4500))

  it('is strictly increasing', () => {
    for (let n = 1; n < 20; n++) {
      expect(xpForLevel(n + 1)).toBeGreaterThan(xpForLevel(n))
    }
  })
})

describe('levelForXp', () => {
  it('level 1 for 0 xp', () => expect(levelForXp(0)).toBe(1))
  it('level 1 for 99 xp', () => expect(levelForXp(99)).toBe(1))
  it('level 2 for exactly xpForLevel(2)', () => expect(levelForXp(100)).toBe(2))
  it('level 3 for exactly xpForLevel(3)', () => expect(levelForXp(300)).toBe(3))

  it('is consistent with xpForLevel', () => {
    for (let n = 1; n <= 10; n++) {
      expect(levelForXp(xpForLevel(n))).toBe(n)
    }
  })
})

describe('computeStreak', () => {
  const now = new Date('2024-06-15T12:00:00Z')

  it('starts streak at 1 if no previous play', () => {
    const result = computeStreak(null, now, 0)
    expect(result.newStreakDays).toBe(1)
    expect(result.wasReset).toBe(false)
  })

  it('does not increment streak if played same day', () => {
    const lastPlay = new Date('2024-06-15T08:00:00Z')
    const result = computeStreak(lastPlay, now, 5)
    expect(result.newStreakDays).toBe(5)
    expect(result.wasReset).toBe(false)
  })

  it('increments streak within 36h grace', () => {
    const lastPlay = new Date('2024-06-14T20:00:00Z') // 16h ago
    const result = computeStreak(lastPlay, now, 3)
    expect(result.newStreakDays).toBe(4)
    expect(result.wasReset).toBe(false)
  })

  it('resets streak beyond 36h', () => {
    const lastPlay = new Date('2024-06-12T12:00:00Z') // 3 days ago
    const result = computeStreak(lastPlay, now, 10)
    expect(result.newStreakDays).toBe(1)
    expect(result.wasReset).toBe(true)
  })
})
