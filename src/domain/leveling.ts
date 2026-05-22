export function xpForLevel(level: number): number {
  if (level <= 1) return 0
  return (100 * (level - 1) * level) / 2
}

export function xpForNextLevel(currentLevel: number): number {
  return xpForLevel(currentLevel + 1)
}

export function levelForXp(xp: number): number {
  if (xp <= 0) return 1

  let low = 1
  let high = 1
  while (xpForLevel(high + 1) <= xp) {
    high *= 2
  }

  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    const atMid = xpForLevel(mid)
    const atNext = xpForLevel(mid + 1)

    if (atMid <= xp && xp < atNext) {
      return mid
    }

    if (xp < atMid) {
      high = mid - 1
    } else {
      low = mid + 1
    }
  }

  return 1
}

export function xpProgress(xp: number): {
  level: number
  intoLevel: number
  levelSpan: number
  pct: number
} {
  const level = levelForXp(xp)
  const levelStart = xpForLevel(level)
  const levelEnd = xpForLevel(level + 1)
  const levelSpan = Math.max(1, levelEnd - levelStart)
  const intoLevel = Math.max(0, xp - levelStart)
  const pct = Math.min(100, Math.max(0, (intoLevel / levelSpan) * 100))

  return { level, intoLevel, levelSpan, pct }
}
