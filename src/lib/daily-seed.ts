/**
 * Deterministic seeding for Daily mode.
 * Uses a simple mulberry32 PRNG seeded from (date string + quizId).
 */

// ---------------------------------------------------------------------------
// Seed generation
// ---------------------------------------------------------------------------

/**
 * Produce a 32-bit seed from a date and quizId.
 * Two calls with the same arguments always return the same number.
 */
export function dailySeed(date: Date, quizId: string): number {
  const dateStr = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`
  const raw = `${dateStr}:${quizId}`
  // Simple string → uint32 hash (djb2 variant)
  let h = 0x811c9dc5
  for (let i = 0; i < raw.length; i++) {
    h ^= raw.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h >>> 0
}

// ---------------------------------------------------------------------------
// PRNG (mulberry32)
// ---------------------------------------------------------------------------

function mulberry32(seed: number): () => number {
  let s = seed >>> 0
  return function () {
    s = (s + 0x6d2b79f5) >>> 0
    let z = s
    z = Math.imul(z ^ (z >>> 15), z | 1) >>> 0
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61)
    z = (z ^ (z >>> 14)) >>> 0
    return z / 0x100000000
  }
}

// ---------------------------------------------------------------------------
// Seeded shuffle
// ---------------------------------------------------------------------------

/**
 * Return a new array with the same elements in a deterministic shuffled order.
 * The seed is derived from dailySeed(date, quizId).
 */
export function seededShuffle<T>(items: T[], seed: number): T[] {
  const arr = [...items]
  const rand = mulberry32(seed)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
