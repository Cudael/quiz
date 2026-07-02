import { describe, expect, it } from 'vitest'
import { computeStreak } from '@/domain/streak'

describe('computeStreak', () => {
  const now = new Date('2026-05-21T12:00:00Z')

  it('same-day play keeps streak unchanged', () => {
    const result = computeStreak({
      lastPlayedAt: new Date('2026-05-21T01:00:00Z'),
      currentStreakDays: 5,
      bestStreak: 9,
      now,
    })

    expect(result.newStreakDays).toBe(5)
    expect(result.wasIncremented).toBe(false)
    expect(result.wasReset).toBe(false)
  })

  it('yesterday increments streak', () => {
    const result = computeStreak({
      lastPlayedAt: new Date('2026-05-20T23:00:00Z'),
      currentStreakDays: 5,
      bestStreak: 9,
      now,
    })

    expect(result.newStreakDays).toBe(6)
    expect(result.wasIncremented).toBe(true)
    expect(result.wasReset).toBe(false)
  })

  it('uses 36h grace window', () => {
    const result = computeStreak({
      lastPlayedAt: new Date('2026-05-20T01:00:00Z'),
      currentStreakDays: 8,
      bestStreak: 10,
      now,
    })

    expect(result.newStreakDays).toBe(9)
    expect(result.wasReset).toBe(false)
  })

  it('resets streak outside grace window', () => {
    const result = computeStreak({
      lastPlayedAt: new Date('2026-05-19T00:00:00Z'),
      currentStreakDays: 8,
      bestStreak: 10,
      now,
    })

    expect(result.newStreakDays).toBe(1)
    expect(result.wasReset).toBe(true)
  })

  it('updates best streak when exceeded', () => {
    const result = computeStreak({
      lastPlayedAt: new Date('2026-05-20T09:00:00Z'),
      currentStreakDays: 10,
      bestStreak: 10,
      now,
    })

    expect(result.newBestStreakDays).toBe(11)
  })

  it('consumes a streak freeze instead of resetting outside the grace window', () => {
    const result = computeStreak({
      lastPlayedAt: new Date('2026-05-19T00:00:00Z'),
      currentStreakDays: 8,
      bestStreak: 10,
      now,
      streakFreezes: 2,
    })

    expect(result.newStreakDays).toBe(9)
    expect(result.wasReset).toBe(false)
    expect(result.usedFreeze).toBe(true)
    expect(result.newStreakFreezes).toBe(1)
  })

  it('does not consume a freeze when there is no streak to save', () => {
    const result = computeStreak({
      lastPlayedAt: new Date('2026-05-10T00:00:00Z'),
      currentStreakDays: 0,
      bestStreak: 0,
      now,
      streakFreezes: 2,
    })

    expect(result.newStreakDays).toBe(1)
    expect(result.wasReset).toBe(true)
    expect(result.usedFreeze).toBe(false)
    expect(result.newStreakFreezes).toBe(2)
  })

  it('earns a freeze on every 7th consecutive day, capped at the max', () => {
    const earned = computeStreak({
      lastPlayedAt: new Date('2026-05-20T23:00:00Z'),
      currentStreakDays: 6,
      bestStreak: 10,
      now,
      streakFreezes: 0,
    })
    expect(earned.newStreakDays).toBe(7)
    expect(earned.earnedFreeze).toBe(true)
    expect(earned.newStreakFreezes).toBe(1)

    const capped = computeStreak({
      lastPlayedAt: new Date('2026-05-20T23:00:00Z'),
      currentStreakDays: 6,
      bestStreak: 10,
      now,
      streakFreezes: 3,
    })
    expect(capped.earnedFreeze).toBe(false)
    expect(capped.newStreakFreezes).toBe(3)
  })

  it('does not earn a freeze on non-milestone days', () => {
    const result = computeStreak({
      lastPlayedAt: new Date('2026-05-20T23:00:00Z'),
      currentStreakDays: 5,
      bestStreak: 10,
      now,
      streakFreezes: 1,
    })

    expect(result.newStreakDays).toBe(6)
    expect(result.earnedFreeze).toBe(false)
    expect(result.newStreakFreezes).toBe(1)
  })
})
