import { matchesAcceptedAnswer } from './text-answer'

/**
 * Server-authoritative answer evaluation for all question types.
 * Pure, framework-free — used by the play submit route (authoritative)
 * and by clients for instant feedback.
 *
 * Returns a credit between 0 and 1. A question counts as "correct"
 * (for correctCount / QuestionAnswer.isCorrect) only when credit === 1.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EvalChoice {
  id: string
  text: string
  isCorrect: boolean
  meta?: unknown
}

export interface EvalQuestion {
  id: string
  type: string
  meta?: unknown
  choices: EvalChoice[]
}

export interface MatchPair {
  leftId: string
  rightId: string
}

export interface SubmittedAnswer {
  choiceIds: string[]
  textAnswer?: string
  textAnswers?: string[]
  numberAnswer?: number
  pairs?: MatchPair[]
  groups?: string[][]
}

export interface EvaluationResult {
  /** 0..1 — fraction of the question solved. 1 = fully correct. */
  credit: number
  /** Sanitized identifiers/values to persist as QuestionAnswer.chosenIds. */
  chosenIds: string[]
}

// ---------------------------------------------------------------------------
// Meta helpers
// ---------------------------------------------------------------------------

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {}
}

function asFiniteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function choiceMeta(choice: EvalChoice): Record<string, unknown> {
  return asRecord(choice.meta)
}

// ---------------------------------------------------------------------------
// Per-type evaluators
// ---------------------------------------------------------------------------

/** Classic single/multi choice: exact set equality of correct choice IDs. */
function evaluateChoiceBased(question: EvalQuestion, answer: SubmittedAnswer): EvaluationResult {
  const validIds = new Set(question.choices.map((c) => c.id))
  const givenIds = Array.from(new Set(answer.choiceIds.filter((id) => validIds.has(id)))).sort()
  const correctIds = question.choices
    .filter((c) => c.isCorrect)
    .map((c) => c.id)
    .sort()

  if (correctIds.length === 0) {
    return { credit: 0, chosenIds: givenIds }
  }

  const correct =
    correctIds.length === givenIds.length && correctIds.every((id, i) => id === givenIds[i])
  return { credit: correct ? 1 : 0, chosenIds: givenIds }
}

/**
 * ORDER — submitted choiceIds must be a full permutation of the question's
 * choices. Correct position comes from choice.meta.position (1-based).
 * Credit = fraction of items placed at their exact correct position.
 */
function evaluateOrder(question: EvalQuestion, answer: SubmittedAnswer): EvaluationResult {
  const validIds = new Set(question.choices.map((c) => c.id))
  const givenIds = answer.choiceIds.filter((id) => validIds.has(id))
  const uniqueGiven = new Set(givenIds)

  // Must be a complete permutation of the question's choices
  if (uniqueGiven.size !== givenIds.length || givenIds.length !== question.choices.length) {
    return { credit: 0, chosenIds: givenIds }
  }

  const positionByChoiceId = new Map<string, number>()
  for (const choice of question.choices) {
    const position = asFiniteNumber(choiceMeta(choice).position)
    if (position === null) return { credit: 0, chosenIds: givenIds }
    positionByChoiceId.set(choice.id, position)
  }

  let exactMatches = 0
  for (let index = 0; index < givenIds.length; index++) {
    if (positionByChoiceId.get(givenIds[index]) === index + 1) exactMatches++
  }

  return { credit: exactMatches / question.choices.length, chosenIds: givenIds }
}

/**
 * MATCH — pairs of {leftId, rightId}. Choices carry meta.side ('L' | 'R')
 * and meta.matchKey. Credit = correctly matched pairs / total pairs.
 * chosenIds encodes each submitted pair as "leftId::rightId".
 */
function evaluateMatch(question: EvalQuestion, answer: SubmittedAnswer): EvaluationResult {
  const leftChoices = new Map<string, string>() // id -> matchKey
  const rightChoices = new Map<string, string>()
  for (const choice of question.choices) {
    const meta = choiceMeta(choice)
    const side = meta.side
    const matchKey = typeof meta.matchKey === 'string' ? meta.matchKey : null
    if (!matchKey) continue
    if (side === 'L') leftChoices.set(choice.id, matchKey)
    else if (side === 'R') rightChoices.set(choice.id, matchKey)
  }

  const totalPairs = leftChoices.size
  if (totalPairs === 0) return { credit: 0, chosenIds: [] }

  const usedLeft = new Set<string>()
  const usedRight = new Set<string>()
  const chosenIds: string[] = []
  let correctPairs = 0

  for (const pair of answer.pairs ?? []) {
    const leftKey = leftChoices.get(pair.leftId)
    const rightKey = rightChoices.get(pair.rightId)
    if (leftKey === undefined || rightKey === undefined) continue
    if (usedLeft.has(pair.leftId) || usedRight.has(pair.rightId)) continue
    usedLeft.add(pair.leftId)
    usedRight.add(pair.rightId)
    chosenIds.push(`${pair.leftId}::${pair.rightId}`)
    if (leftKey === rightKey) correctPairs++
  }

  return { credit: correctPairs / totalPairs, chosenIds }
}

/**
 * NUMBER_GUESS — question.meta holds { answer, min, max, tolerance }.
 * Full credit within ±tolerance; linear decay to 0 at half the slider range.
 */
function evaluateNumberGuess(question: EvalQuestion, answer: SubmittedAnswer): EvaluationResult {
  const meta = asRecord(question.meta)
  const target = asFiniteNumber(meta.answer)
  const min = asFiniteNumber(meta.min)
  const max = asFiniteNumber(meta.max)
  const tolerance = Math.max(0, asFiniteNumber(meta.tolerance) ?? 0)
  const guess = asFiniteNumber(answer.numberAnswer)

  if (target === null || guess === null) return { credit: 0, chosenIds: [] }

  const chosenIds = [String(guess)]
  const diff = Math.abs(guess - target)
  if (diff <= tolerance) return { credit: 1, chosenIds }

  const range = min !== null && max !== null && max > min ? max - min : null
  if (range === null) return { credit: 0, chosenIds }

  const decayWindow = range / 2
  const credit = Math.max(0, 1 - (diff - tolerance) / decayWindow)
  return { credit, chosenIds }
}

/**
 * GROUPS (Connections) — choices carry meta.groupKey; question.meta.groups
 * lists the groups. Credit = exactly-solved groups / total groups.
 * chosenIds encodes each submitted group as "id1|id2|...".
 */
function evaluateGroups(question: EvalQuestion, answer: SubmittedAnswer): EvaluationResult {
  const expectedByKey = new Map<string, Set<string>>()
  for (const choice of question.choices) {
    const groupKey = choiceMeta(choice).groupKey
    if (typeof groupKey !== 'string') continue
    if (!expectedByKey.has(groupKey)) expectedByKey.set(groupKey, new Set())
    expectedByKey.get(groupKey)!.add(choice.id)
  }

  const totalGroups = expectedByKey.size
  if (totalGroups === 0) return { credit: 0, chosenIds: [] }

  const validIds = new Set(question.choices.map((c) => c.id))
  const matchedKeys = new Set<string>()
  const chosenIds: string[] = []

  for (const submittedGroup of answer.groups ?? []) {
    const ids = Array.from(new Set(submittedGroup.filter((id) => validIds.has(id))))
    if (ids.length === 0) continue
    chosenIds.push([...ids].sort().join('|'))
    for (const [key, expected] of expectedByKey) {
      if (matchedKeys.has(key)) continue
      if (expected.size === ids.length && ids.every((id) => expected.has(id))) {
        matchedKeys.add(key)
        break
      }
    }
  }

  return { credit: matchedKeys.size / totalGroups, chosenIds }
}

interface ListAnswerEntry {
  label: string
  accepted: string[]
}

function parseListAnswers(meta: Record<string, unknown>): ListAnswerEntry[] | null {
  if (!Array.isArray(meta.answers)) return null
  const entries: ListAnswerEntry[] = []
  for (const raw of meta.answers) {
    const record = asRecord(raw)
    if (typeof record.label !== 'string' || !record.label.trim()) continue
    const accepted = Array.isArray(record.accepted)
      ? record.accepted.filter((a): a is string => typeof a === 'string' && a.trim().length > 0)
      : []
    entries.push({ label: record.label, accepted: accepted.length > 0 ? accepted : [record.label] })
  }
  return entries.length > 0 ? entries : null
}

/**
 * FILL_BLANK — single answer (meta.acceptedAnswers) or list mode
 * (meta.answers: [{ label, accepted }]). Falls back to the texts of
 * correct choices for legacy questions.
 */
function evaluateFillBlank(question: EvalQuestion, answer: SubmittedAnswer): EvaluationResult {
  const meta = asRecord(question.meta)
  const fuzzy = meta.fuzzy === true

  const listEntries = parseListAnswers(meta)
  if (listEntries) {
    const given = (answer.textAnswers ?? (answer.textAnswer ? [answer.textAnswer] : []))
      .filter((t) => typeof t === 'string' && t.trim().length > 0)
      .slice(0, 100)
    const matchedLabels = new Set<string>()
    for (const text of given) {
      for (const entry of listEntries) {
        if (matchedLabels.has(entry.label)) continue
        if (matchesAcceptedAnswer(text, entry.accepted, fuzzy)) {
          matchedLabels.add(entry.label)
          break
        }
      }
    }
    return {
      credit: matchedLabels.size / listEntries.length,
      chosenIds: given.map((t) => t.slice(0, 120)),
    }
  }

  const acceptedAnswers = Array.isArray(meta.acceptedAnswers)
    ? meta.acceptedAnswers.filter((a): a is string => typeof a === 'string' && a.trim().length > 0)
    : question.choices.filter((c) => c.isCorrect).map((c) => c.text)

  const given = answer.textAnswer ?? ''
  const chosenIds = given.trim() ? [given.trim().slice(0, 200)] : []
  if (acceptedAnswers.length === 0) return { credit: 0, chosenIds }

  const correct = matchesAcceptedAnswer(given, acceptedAnswers, fuzzy)
  return { credit: correct ? 1 : 0, chosenIds }
}

// ---------------------------------------------------------------------------
// Dispatcher
// ---------------------------------------------------------------------------

export function evaluateAnswer(question: EvalQuestion, answer: SubmittedAnswer): EvaluationResult {
  switch (question.type) {
    case 'ORDER':
      return evaluateOrder(question, answer)
    case 'MATCH':
      return evaluateMatch(question, answer)
    case 'NUMBER_GUESS':
      return evaluateNumberGuess(question, answer)
    case 'GROUPS':
      return evaluateGroups(question, answer)
    case 'FILL_BLANK':
      return evaluateFillBlank(question, answer)
    default:
      // SINGLE, TRUEFALSE, HOTSPOT and any unknown types
      return evaluateChoiceBased(question, answer)
  }
}

/** Question types whose interaction is not a plain choice grid. */
export const NON_CHOICE_QUESTION_TYPES = [
  'ORDER',
  'MATCH',
  'NUMBER_GUESS',
  'GROUPS',
  'FILL_BLANK',
] as const
