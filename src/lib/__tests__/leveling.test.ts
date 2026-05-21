import { describe, expect, it } from 'vitest'
import { levelForXp, xpForLevel, xpProgress } from '@/lib/leveling'

describe('leveling', () => {
  it('xpForLevel uses cumulative formula with level 1 at 0 XP', () => {
    expect(xpForLevel(1)).toBe(0)
    expect(xpForLevel(2)).toBe(100)
    expect(xpForLevel(3)).toBe(300)
    expect(xpForLevel(10)).toBe(4500)
  })

  it('levelForXp round-trips on exact level thresholds', () => {
    for (let level = 1; level <= 25; level++) {
      expect(levelForXp(xpForLevel(level))).toBe(level)
    }
  })

  it('is monotonic and handles edges', () => {
    expect(levelForXp(0)).toBe(1)
    expect(levelForXp(99)).toBe(1)
    expect(levelForXp(100)).toBe(2)

    for (let xp = 0; xp <= 5000; xp += 25) {
      expect(levelForXp(xp + 25)).toBeGreaterThanOrEqual(levelForXp(xp))
    }
  })

  it('xpProgress returns in-level breakdown and percent', () => {
    const progress = xpProgress(250)
    expect(progress.level).toBe(2)
    expect(progress.intoLevel).toBe(150)
    expect(progress.levelSpan).toBe(200)
    expect(progress.pct).toBe(75)
  })
})
