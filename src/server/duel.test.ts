import { describe, expect, it } from 'vitest'
import { generateDuelCode, pickDuelQuestionIds } from '@/server/duel'

describe('generateDuelCode', () => {
  it('generates a 6-character uppercase alphanumeric code', () => {
    const code = generateDuelCode(() => 0.5)
    expect(code).toMatch(/^[A-Z0-9]{6}$/)
  })
})

describe('pickDuelQuestionIds', () => {
  it('returns a stable seeded order for a duel id', () => {
    const questionIds = ['q1', 'q2', 'q3', 'q4', 'q5']
    const first = pickDuelQuestionIds(questionIds, 'duel-a', 3)
    const second = pickDuelQuestionIds(questionIds, 'duel-a', 3)
    expect(first).toEqual(second)
  })

  it('returns different order for a different duel id', () => {
    const questionIds = ['q1', 'q2', 'q3', 'q4', 'q5']
    const first = pickDuelQuestionIds(questionIds, 'duel-a', 5)
    const second = pickDuelQuestionIds(questionIds, 'duel-b', 5)
    expect(first).not.toEqual(second)
  })
})
