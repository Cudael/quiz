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
})
