const DUEL_CODE_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const DUEL_CODE_LENGTH = 6
// Largest multiple of the charset length that fits in a byte (36 * 7 = 252).
// Bytes at or above this value are rejected to avoid modulo bias.
const DUEL_CODE_BYTE_LIMIT = Math.floor(256 / DUEL_CODE_CHARSET.length) * DUEL_CODE_CHARSET.length

export function generateDuelCode() {
  let result = ''
  while (result.length < DUEL_CODE_LENGTH) {
    const bytes = crypto.getRandomValues(new Uint8Array(DUEL_CODE_LENGTH * 2))
    for (const byte of bytes) {
      if (result.length === DUEL_CODE_LENGTH) break
      if (byte < DUEL_CODE_BYTE_LIMIT) {
        result += DUEL_CODE_CHARSET[byte % DUEL_CODE_CHARSET.length]
      }
    }
  }
  return result
}

function stringToSeed(input: string) {
  let hash = 2166136261
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function nextSeed(seed: number) {
  let value = seed + 0x6d2b79f5
  value = Math.imul(value ^ (value >>> 15), value | 1)
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
  return (value ^ (value >>> 14)) >>> 0
}

export function seededShuffle<T>(values: T[], seedInput: string) {
  const shuffled = [...values]
  let seed = stringToSeed(seedInput)
  for (let i = shuffled.length - 1; i > 0; i--) {
    seed = nextSeed(seed)
    const j = seed % (i + 1)
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function pickDuelQuestionIds(questionIds: string[], duelId: string, questionCount: number) {
  return seededShuffle(questionIds, duelId).slice(0, questionCount)
}
