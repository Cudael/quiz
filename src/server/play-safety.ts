import 'server-only'

/**
 * Play-payload sanitization + post-answer reveal building.
 *
 * Questions served to the browser during play must never contain the answer
 * key. This module strips `isCorrect` and every answer-bearing meta field
 * from the play payload, and builds the "reveal" object that the
 * per-question check endpoint returns AFTER an answer is locked in, so the
 * client can render correct/incorrect feedback.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RawChoice {
  id: string
  text: string
  imageUrl?: string | null
  isCorrect: boolean
  meta: unknown
}

interface RawQuestion {
  id: string
  type: string
  prompt: string
  imageUrl?: string | null
  timeLimitSec?: number
  order?: number
  meta: unknown
  choices: RawChoice[]
}

export interface SanitizedChoice {
  id: string
  text: string
  imageUrl?: string | null
  meta: Record<string, unknown> | null
}

export interface AnswerReveal {
  correctChoiceIds: string[]
  /** VERSUS — display value per choice, revealed after answering. */
  choiceValues: Record<string, string>
  /** ORDER — correct 1-based position per choice id. */
  positions: Record<string, number>
  /** MATCH — the correct left/right pairings. */
  correctPairs: Array<{ leftId: string; rightId: string }>
  /** GROUPS — the correct grouping with labels. */
  groups: Array<{ label: string; choiceIds: string[] }>
  /** FILL_BLANK — accepted answers (first entry shown as "the" answer). */
  acceptedAnswers: string[]
  /** NUMBER_GUESS — the target number. */
  numberAnswer: number | null
  /** HOTSPOT — the correct zone id. */
  correctZoneId: string | null
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {}
}

/** Choice-meta keys the client legitimately needs BEFORE answering. */
const SAFE_CHOICE_META_KEYS = new Set([
  'side', // MATCH — renders left/right columns
  'zoneId', // HOTSPOT — maps zone clicks to choices
])

/** Question-meta keys that carry the answer and must never reach the client. */
const ANSWER_BEARING_QUESTION_META_KEYS = new Set([
  'acceptedAnswers', // FILL_BLANK / TYPE_ANSWER / ANAGRAM
  'answers', // FILL_BLANK list mode
  'fuzzy',
  'answer', // NUMBER_GUESS target
  'tolerance', // NUMBER_GUESS — with min/max, brackets the target
])

/** Deterministic seeded shuffle so a refresh shows the same scramble. */
function seededShuffle<T>(items: T[], seed: string): T[] {
  let hash = 2166136261
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    hash = Math.imul(hash ^ (hash >>> 15), 2246822507)
    hash = Math.imul(hash ^ (hash >>> 13), 3266489909)
    const j = (hash >>> 0) % (i + 1)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/** Scrambled letter tiles for an anagram — derived server-side so the
 *  answer itself never has to be sent. */
function buildAnagramTiles(answer: string, seed: string): string[] {
  const chars = answer
    .toUpperCase()
    .split('')
    .filter((c) => c !== ' ')
  let shuffled = seededShuffle(chars, seed)
  for (let attempt = 0; attempt < 5; attempt++) {
    if (shuffled.join('') !== chars.join('')) break
    shuffled = seededShuffle(chars, `${seed}:${attempt}`)
  }
  return shuffled
}

// ---------------------------------------------------------------------------
// Sanitization
// ---------------------------------------------------------------------------

export function sanitizeChoiceForPlay(choice: RawChoice): SanitizedChoice {
  const meta = asRecord(choice.meta)
  const safeMeta: Record<string, unknown> = {}
  for (const key of Object.keys(meta)) {
    if (SAFE_CHOICE_META_KEYS.has(key)) safeMeta[key] = meta[key]
  }
  return {
    id: choice.id,
    text: choice.text,
    imageUrl: choice.imageUrl,
    meta: Object.keys(safeMeta).length > 0 ? safeMeta : null,
  }
}

export function sanitizeQuestionMetaForPlay(question: RawQuestion): Record<string, unknown> | null {
  const meta = asRecord(question.meta)
  const safeMeta: Record<string, unknown> = {}
  for (const key of Object.keys(meta)) {
    if (!ANSWER_BEARING_QUESTION_META_KEYS.has(key)) safeMeta[key] = meta[key]
  }

  // ANAGRAM needs the letters to render tiles — provide them pre-scrambled
  // instead of shipping the answer.
  if (meta.anagram === true) {
    const accepted = Array.isArray(meta.acceptedAnswers)
      ? meta.acceptedAnswers.filter((a): a is string => typeof a === 'string' && a.length > 0)
      : []
    if (accepted.length > 0) {
      safeMeta.tiles = buildAnagramTiles(accepted[0], question.id)
    }
  }

  // FILL_BLANK list mode: the client renders one input per entry and shows
  // labels only after answering — but it needs to know HOW MANY entries exist.
  const listAnswers = Array.isArray(meta.answers) ? meta.answers : null
  if (listAnswers) {
    safeMeta.answerCount = listAnswers.length
  }

  return Object.keys(safeMeta).length > 0 ? safeMeta : null
}

// ---------------------------------------------------------------------------
// Reveal building (returned only AFTER an answer is locked in)
// ---------------------------------------------------------------------------

export function buildAnswerReveal(question: RawQuestion): AnswerReveal {
  const questionMeta = asRecord(question.meta)

  const correctChoiceIds = question.choices.filter((c) => c.isCorrect).map((c) => c.id)

  const choiceValues: Record<string, string> = {}
  const positions: Record<string, number> = {}
  for (const choice of question.choices) {
    const meta = asRecord(choice.meta)
    if (typeof meta.valueLabel === 'string' && meta.valueLabel) {
      choiceValues[choice.id] = meta.valueLabel
    } else if (typeof meta.value === 'number' && Number.isFinite(meta.value)) {
      choiceValues[choice.id] = meta.value.toLocaleString()
    }
    if (typeof meta.position === 'number' && Number.isFinite(meta.position)) {
      positions[choice.id] = meta.position
    }
  }

  const correctPairs: Array<{ leftId: string; rightId: string }> = []
  const rightByKey = new Map<string, string>()
  for (const choice of question.choices) {
    const meta = asRecord(choice.meta)
    if (meta.side === 'R' && typeof meta.matchKey === 'string') {
      rightByKey.set(meta.matchKey, choice.id)
    }
  }
  for (const choice of question.choices) {
    const meta = asRecord(choice.meta)
    if (meta.side === 'L' && typeof meta.matchKey === 'string') {
      const rightId = rightByKey.get(meta.matchKey)
      if (rightId) correctPairs.push({ leftId: choice.id, rightId })
    }
  }

  const groupIdsByKey = new Map<string, string[]>()
  for (const choice of question.choices) {
    const meta = asRecord(choice.meta)
    if (typeof meta.groupKey === 'string') {
      const list = groupIdsByKey.get(meta.groupKey) ?? []
      list.push(choice.id)
      groupIdsByKey.set(meta.groupKey, list)
    }
  }
  const groupDefs = Array.isArray(questionMeta.groups) ? questionMeta.groups : []
  const groups: Array<{ label: string; choiceIds: string[] }> = []
  for (const [key, choiceIds] of groupIdsByKey) {
    const def = groupDefs
      .map((g) => asRecord(g))
      .find((g) => typeof g.key === 'string' && g.key === key)
    groups.push({
      label: typeof def?.label === 'string' ? def.label : 'Group',
      choiceIds,
    })
  }

  const acceptedAnswers = Array.isArray(questionMeta.acceptedAnswers)
    ? questionMeta.acceptedAnswers.filter((a): a is string => typeof a === 'string' && a.length > 0)
    : question.choices.filter((c) => c.isCorrect).map((c) => c.text)

  const numberAnswer =
    typeof questionMeta.answer === 'number' && Number.isFinite(questionMeta.answer)
      ? questionMeta.answer
      : null

  let correctZoneId: string | null = null
  const correctChoice = question.choices.find((c) => c.isCorrect)
  if (correctChoice) {
    const meta = asRecord(correctChoice.meta)
    if (typeof meta.zoneId === 'string') correctZoneId = meta.zoneId
  }

  return {
    correctChoiceIds,
    choiceValues,
    positions,
    correctPairs,
    groups,
    acceptedAnswers,
    numberAnswer,
    correctZoneId,
  }
}

/** GROUPS mid-question probe: if these choice ids form exactly one complete
 *  group, returns that group's label (revealed on solve); otherwise null. */
export function probeGroupMatch(question: RawQuestion, choiceIds: string[]): string | null {
  const ids = Array.from(new Set(choiceIds))
  if (ids.length === 0) return null
  const keys = ids.map((id) => {
    const choice = question.choices.find((c) => c.id === id)
    const key = asRecord(choice?.meta).groupKey
    return typeof key === 'string' ? key : null
  })
  if (keys.some((k) => k === null) || !keys.every((k) => k === keys[0])) return null
  // Must be the complete group, not a subset
  const groupSize = question.choices.filter((c) => asRecord(c.meta).groupKey === keys[0]).length
  if (ids.length !== groupSize) return null

  const groupDefs = Array.isArray(asRecord(question.meta).groups)
    ? (asRecord(question.meta).groups as unknown[])
    : []
  const def = groupDefs.map((g) => asRecord(g)).find((g) => g.key === keys[0])
  return typeof def?.label === 'string' && def.label ? def.label : 'Group'
}
