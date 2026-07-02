import { describe, expect, it } from 'vitest'
import { evaluateAnswer, type EvalQuestion } from './evaluate-answer'

function makeChoices(defs: Array<Partial<EvalQuestion['choices'][number]> & { id: string }>) {
  return defs.map((d) => ({ text: '', isCorrect: false, ...d }))
}

describe('evaluateAnswer — choice-based (SINGLE/TRUEFALSE/HOTSPOT/MAP_SELECT)', () => {
  const question: EvalQuestion = {
    id: 'q1',
    type: 'SINGLE',
    choices: makeChoices([{ id: 'a', isCorrect: true }, { id: 'b' }, { id: 'c' }]),
  }

  it('gives full credit for the correct choice', () => {
    expect(evaluateAnswer(question, { choiceIds: ['a'] })).toEqual({
      credit: 1,
      chosenIds: ['a'],
    })
  })

  it('gives zero credit for a wrong choice', () => {
    expect(evaluateAnswer(question, { choiceIds: ['b'] }).credit).toBe(0)
  })

  it('ignores invalid choice ids', () => {
    expect(evaluateAnswer(question, { choiceIds: ['zzz'] })).toEqual({ credit: 0, chosenIds: [] })
  })

  it('dedupes submitted ids', () => {
    expect(evaluateAnswer(question, { choiceIds: ['a', 'a'] }).credit).toBe(1)
  })

  it('gives zero credit when no correct choice is configured', () => {
    const broken: EvalQuestion = { id: 'q', type: 'SINGLE', choices: makeChoices([{ id: 'a' }]) }
    expect(evaluateAnswer(broken, { choiceIds: ['a'] }).credit).toBe(0)
  })
})

describe('evaluateAnswer — ORDER', () => {
  const question: EvalQuestion = {
    id: 'q1',
    type: 'ORDER',
    choices: makeChoices([
      { id: 'a', meta: { position: 1 } },
      { id: 'b', meta: { position: 2 } },
      { id: 'c', meta: { position: 3 } },
      { id: 'd', meta: { position: 4 } },
    ]),
  }

  it('gives full credit for the exact order', () => {
    expect(evaluateAnswer(question, { choiceIds: ['a', 'b', 'c', 'd'] }).credit).toBe(1)
  })

  it('gives partial credit for partially correct positions', () => {
    // a,b correct; c,d swapped
    expect(evaluateAnswer(question, { choiceIds: ['a', 'b', 'd', 'c'] }).credit).toBe(0.5)
  })

  it('rejects incomplete permutations', () => {
    expect(evaluateAnswer(question, { choiceIds: ['a', 'b'] }).credit).toBe(0)
  })

  it('rejects duplicated ids', () => {
    expect(evaluateAnswer(question, { choiceIds: ['a', 'a', 'c', 'd'] }).credit).toBe(0)
  })

  it('preserves submitted order in chosenIds', () => {
    expect(evaluateAnswer(question, { choiceIds: ['d', 'c', 'b', 'a'] }).chosenIds).toEqual([
      'd',
      'c',
      'b',
      'a',
    ])
  })
})

describe('evaluateAnswer — MATCH', () => {
  const question: EvalQuestion = {
    id: 'q1',
    type: 'MATCH',
    choices: makeChoices([
      { id: 'l1', meta: { side: 'L', matchKey: 'p1' } },
      { id: 'l2', meta: { side: 'L', matchKey: 'p2' } },
      { id: 'r1', meta: { side: 'R', matchKey: 'p1' } },
      { id: 'r2', meta: { side: 'R', matchKey: 'p2' } },
    ]),
  }

  it('gives full credit for all correct pairs', () => {
    const result = evaluateAnswer(question, {
      choiceIds: [],
      pairs: [
        { leftId: 'l1', rightId: 'r1' },
        { leftId: 'l2', rightId: 'r2' },
      ],
    })
    expect(result.credit).toBe(1)
    expect(result.chosenIds).toEqual(['l1::r1', 'l2::r2'])
  })

  it('gives partial credit for some correct pairs', () => {
    const result = evaluateAnswer(question, {
      choiceIds: [],
      pairs: [
        { leftId: 'l1', rightId: 'r2' },
        { leftId: 'l2', rightId: 'r1' },
      ],
    })
    expect(result.credit).toBe(0)
  })

  it('ignores duplicate use of an item', () => {
    const result = evaluateAnswer(question, {
      choiceIds: [],
      pairs: [
        { leftId: 'l1', rightId: 'r1' },
        { leftId: 'l1', rightId: 'r2' },
      ],
    })
    expect(result.credit).toBe(0.5)
  })

  it('ignores pairs with swapped sides', () => {
    const result = evaluateAnswer(question, {
      choiceIds: [],
      pairs: [{ leftId: 'r1', rightId: 'l1' }],
    })
    expect(result.credit).toBe(0)
  })
})

describe('evaluateAnswer — NUMBER_GUESS', () => {
  const question: EvalQuestion = {
    id: 'q1',
    type: 'NUMBER_GUESS',
    meta: { answer: 100, min: 0, max: 200, tolerance: 10 },
    choices: [],
  }

  it('gives full credit within tolerance', () => {
    expect(evaluateAnswer(question, { choiceIds: [], numberAnswer: 105 }).credit).toBe(1)
    expect(evaluateAnswer(question, { choiceIds: [], numberAnswer: 90 }).credit).toBe(1)
  })

  it('decays linearly outside tolerance', () => {
    // diff 60, tolerance 10 → (60-10)/100 = 0.5 penalty
    expect(evaluateAnswer(question, { choiceIds: [], numberAnswer: 160 }).credit).toBeCloseTo(0.5)
  })

  it('gives zero credit at half the range away', () => {
    expect(evaluateAnswer(question, { choiceIds: [], numberAnswer: 200 }).credit).toBeCloseTo(0.1)
    const far: EvalQuestion = { ...question, meta: { answer: 0, min: 0, max: 200, tolerance: 0 } }
    expect(evaluateAnswer(far, { choiceIds: [], numberAnswer: 150 }).credit).toBe(0)
  })

  it('gives zero credit without a guess', () => {
    expect(evaluateAnswer(question, { choiceIds: [] }).credit).toBe(0)
  })

  it('records the guess in chosenIds', () => {
    expect(evaluateAnswer(question, { choiceIds: [], numberAnswer: 42 }).chosenIds).toEqual(['42'])
  })
})

describe('evaluateAnswer — GROUPS', () => {
  const question: EvalQuestion = {
    id: 'q1',
    type: 'GROUPS',
    meta: { groups: [{ key: 'A' }, { key: 'B' }] },
    choices: makeChoices([
      { id: 'a1', meta: { groupKey: 'A' } },
      { id: 'a2', meta: { groupKey: 'A' } },
      { id: 'b1', meta: { groupKey: 'B' } },
      { id: 'b2', meta: { groupKey: 'B' } },
    ]),
  }

  it('gives full credit when all groups are solved', () => {
    const result = evaluateAnswer(question, {
      choiceIds: [],
      groups: [
        ['a1', 'a2'],
        ['b1', 'b2'],
      ],
    })
    expect(result.credit).toBe(1)
  })

  it('gives partial credit for partially solved boards', () => {
    const result = evaluateAnswer(question, {
      choiceIds: [],
      groups: [
        ['a1', 'a2'],
        ['b1', 'a1'],
      ],
    })
    expect(result.credit).toBe(0.5)
  })

  it('gives zero credit for wrong groupings', () => {
    expect(evaluateAnswer(question, { choiceIds: [], groups: [['a1', 'b1']] }).credit).toBe(0)
  })
})

describe('evaluateAnswer — FILL_BLANK', () => {
  it('matches accepted answers from meta', () => {
    const question: EvalQuestion = {
      id: 'q1',
      type: 'FILL_BLANK',
      meta: { acceptedAnswers: ['Mount Everest', 'Everest'] },
      choices: [],
    }
    expect(evaluateAnswer(question, { choiceIds: [], textAnswer: 'everest' }).credit).toBe(1)
    expect(evaluateAnswer(question, { choiceIds: [], textAnswer: 'K2' }).credit).toBe(0)
  })

  it('supports fuzzy matching when enabled', () => {
    const question: EvalQuestion = {
      id: 'q1',
      type: 'FILL_BLANK',
      meta: { acceptedAnswers: ['Everest'], fuzzy: true },
      choices: [],
    }
    expect(evaluateAnswer(question, { choiceIds: [], textAnswer: 'Everes' }).credit).toBe(1)
  })

  it('falls back to correct choice texts for legacy questions', () => {
    const question: EvalQuestion = {
      id: 'q1',
      type: 'FILL_BLANK',
      choices: makeChoices([{ id: 'a', text: 'Paris', isCorrect: true }]),
    }
    expect(evaluateAnswer(question, { choiceIds: [], textAnswer: 'paris' }).credit).toBe(1)
  })

  it('scores list mode proportionally', () => {
    const question: EvalQuestion = {
      id: 'q1',
      type: 'FILL_BLANK',
      meta: {
        answers: [
          { label: 'France' },
          { label: 'Spain' },
          { label: 'Italy', accepted: ['Italy', 'Italia'] },
        ],
      },
      choices: [],
    }
    const result = evaluateAnswer(question, {
      choiceIds: [],
      textAnswers: ['france', 'italia', 'germany'],
    })
    expect(result.credit).toBeCloseTo(2 / 3)
  })

  it('counts each list answer only once', () => {
    const question: EvalQuestion = {
      id: 'q1',
      type: 'FILL_BLANK',
      meta: { answers: [{ label: 'France' }, { label: 'Spain' }] },
      choices: [],
    }
    expect(
      evaluateAnswer(question, { choiceIds: [], textAnswers: ['france', 'France'] }).credit
    ).toBe(0.5)
  })
})
