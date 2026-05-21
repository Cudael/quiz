import { describe, it, expect } from 'vitest'
import { scoreQuestion, xpForLevel, levelForXp, computeStreak } from '../scoring'

describe('scoreQuestion', () => {
  it('returns 0 for wrong answer', () => {
    expect(scoreQuestion({ correct: false, timeRemainingMs: 5000, timeLimitMs: 20000 })).toBe(0)
  })

  it('returns base + speedBonus for correct answer', () => {
    // Full time remaining → speedBonus = 100, total = 200
    expect(scoreQuestion({ correct: true, timeRemainingMs: 20000, timeLimitMs: 20000 })).toBe(200)
  })

  it('returns only base when no time remains', () => {
    expect(scoreQuestion({ correct: true, timeRemainingMs: 0, timeLimitMs: 20000 })).toBe(100)
  })

  it('rounds speed bonus', () => {
    // 7500ms remaining / 20000ms limit = 0.375 → round(100 * 0.375) = 38
    expect(scoreQuestion({ correct: true, timeRemainingMs: 7500, timeLimitMs: 20000 })).toBe(138)
  })

  it('applies no multiplier at streak < 3', () => {
    const score = scoreQuestion({
      correct: true,
      timeRemainingMs: 20000,
      timeLimitMs: 20000,
      streak: 2,
    })
    expect(score).toBe(200)
  })

  it('applies 1.25x multiplier at streak 3', () => {
    const base = scoreQuestion({
      correct: true,
      timeRemainingMs: 20000,
      timeLimitMs: 20000,
    })
    const withStreak = scoreQuestion({
      correct: true,
      timeRemainingMs: 20000,
      timeLimitMs: 20000,
      streak: 3,
    })
    expect(withStreak).toBe(Math.round(base * 1.25))
  })

  it('handles timeLimitMs = 0 gracefully', () => {
    expect(scoreQuestion({ correct: true, timeRemainingMs: 0, timeLimitMs: 0 })).toBe(100)
  })
})

describe('xpForLevel', () => {
  it('xpForLevel(1) = 100', () => expect(xpForLevel(1)).toBe(100))
  it('xpForLevel(2) = 300', () => expect(xpForLevel(2)).toBe(300))
  it('xpForLevel(3) = 600', () => expect(xpForLevel(3)).toBe(600))
  it('xpForLevel(10) = 5500', () => expect(xpForLevel(10)).toBe(5500))

  it('is strictly increasing', () => {
    for (let n = 1; n < 20; n++) {
      expect(xpForLevel(n + 1)).toBeGreaterThan(xpForLevel(n))
    }
  })
})

describe('levelForXp', () => {
  it('level 1 for 0 xp', () => expect(levelForXp(0)).toBe(1))
  it('level 1 for 99 xp', () => expect(levelForXp(99)).toBe(1))
  it('level 2 for exactly xpForLevel(2)', () => expect(levelForXp(300)).toBe(2))
  it('level 3 for exactly xpForLevel(3)', () => expect(levelForXp(600)).toBe(3))

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
