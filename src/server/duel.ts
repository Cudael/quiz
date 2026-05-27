const DUEL_CODE_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

export function generateDuelCode(randomFn: () => number = Math.random) {
  let result = ''
  for (let i = 0; i < 6; i++) {
    const index = Math.floor(randomFn() * DUEL_CODE_CHARSET.length)
    result += DUEL_CODE_CHARSET[index]
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
