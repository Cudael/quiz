import { describe, expect, it } from 'vitest'
import {
  createDuelSchema,
  categorySuggestionSchema,
  joinDuelSchema,
  meProfileSchema,
  questionSchema,
  questionAnswerSchema,
  quizSchema,
  reportSchema,
  submitAnswersSchema,
  userPreferencesSchema,
} from '@/schemas'

describe('quizSchema', () => {
  it('accepts valid quiz input', () => {
    expect(
      quizSchema.safeParse({
        title: 'Sample Quiz',
        description: 'A valid description',
        coverImage: 'https://example.com/cover.png',
        categoryId: 'ckq6xdr2w0000u3z5f6l6x4t5',
        difficulty: 'MEDIUM',
        format: 'TEXT_CHOICE',
        defaultTimeLimitSec: 60,
        isPublished: true,
      }).success
    ).toBe(true)
  })

  it('rejects invalid cover image URL', () => {
    expect(
      quizSchema.safeParse({
        title: 'Sample Quiz',
        description: 'A valid description',
        coverImage: 'not-a-url',
        categoryId: 'ckq6xdr2w0000u3z5f6l6x4t5',
        difficulty: 'MEDIUM',
        format: 'TEXT_CHOICE',
        isPublished: true,
      }).success
    ).toBe(false)
  })

  it('rejects out-of-range default time limit overrides', () => {
    expect(
      quizSchema.safeParse({
        title: 'Sample Quiz',
        description: 'A valid description',
        categoryId: 'ckq6xdr2w0000u3z5f6l6x4t5',
        difficulty: 'MEDIUM',
        format: 'TEXT_CHOICE',
        defaultTimeLimitSec: 4,
        isPublished: true,
      }).success
    ).toBe(false)
  })
})

describe('questionSchema', () => {
  it('requires one correct SINGLE answer', () => {
    const result = questionSchema.safeParse({
      type: 'SINGLE',
      prompt: '2+2?',
      timeLimitSec: 20,
      choices: [
        { text: '3', isCorrect: false },
        { text: '4', isCorrect: false },
      ],
    })
    expect(result.success).toBe(false)
  })

  it('accepts a valid ORDER question with a complete position sequence', () => {
    const result = questionSchema.safeParse({
      type: 'ORDER',
      prompt: 'Order the planets by size',
      timeLimitSec: 30,
      choices: [
        { text: 'Mercury', isCorrect: false, meta: { position: 1 } },
        { text: 'Mars', isCorrect: false, meta: { position: 2 } },
        { text: 'Earth', isCorrect: false, meta: { position: 3 } },
      ],
    })
    expect(result.success).toBe(true)
  })

  it('rejects ORDER questions with gaps in positions', () => {
    const result = questionSchema.safeParse({
      type: 'ORDER',
      prompt: 'Order these',
      timeLimitSec: 30,
      choices: [
        { text: 'A', isCorrect: false, meta: { position: 1 } },
        { text: 'B', isCorrect: false, meta: { position: 3 } },
        { text: 'C', isCorrect: false, meta: { position: 4 } },
      ],
    })
    expect(result.success).toBe(false)
  })

  it('accepts a valid MATCH question with one-to-one pairs', () => {
    const result = questionSchema.safeParse({
      type: 'MATCH',
      prompt: 'Match country to capital',
      timeLimitSec: 40,
      choices: [
        { text: 'France', isCorrect: false, meta: { side: 'L', matchKey: 'p1' } },
        { text: 'Paris', isCorrect: false, meta: { side: 'R', matchKey: 'p1' } },
        { text: 'Spain', isCorrect: false, meta: { side: 'L', matchKey: 'p2' } },
        { text: 'Madrid', isCorrect: false, meta: { side: 'R', matchKey: 'p2' } },
        { text: 'Italy', isCorrect: false, meta: { side: 'L', matchKey: 'p3' } },
        { text: 'Rome', isCorrect: false, meta: { side: 'R', matchKey: 'p3' } },
      ],
    })
    expect(result.success).toBe(true)
  })

  it('rejects MATCH questions with unbalanced sides', () => {
    const result = questionSchema.safeParse({
      type: 'MATCH',
      prompt: 'Match these',
      timeLimitSec: 40,
      choices: [
        { text: 'France', isCorrect: false, meta: { side: 'L', matchKey: 'p1' } },
        { text: 'Paris', isCorrect: false, meta: { side: 'R', matchKey: 'p1' } },
        { text: 'Spain', isCorrect: false, meta: { side: 'L', matchKey: 'p2' } },
      ],
    })
    expect(result.success).toBe(false)
  })

  it('validates NUMBER_GUESS meta bounds', () => {
    const valid = questionSchema.safeParse({
      type: 'NUMBER_GUESS',
      prompt: 'How tall is Everest (m)?',
      timeLimitSec: 20,
      meta: { answer: 8849, min: 0, max: 10000, tolerance: 100 },
      choices: [],
    })
    expect(valid.success).toBe(true)

    const answerOutOfRange = questionSchema.safeParse({
      type: 'NUMBER_GUESS',
      prompt: 'How tall?',
      timeLimitSec: 20,
      meta: { answer: 20000, min: 0, max: 10000, tolerance: 100 },
      choices: [],
    })
    expect(answerOutOfRange.success).toBe(false)
  })

  it('validates GROUPS boards with equal group sizes', () => {
    const makeTiles = (key: string, texts: string[]) =>
      texts.map((text) => ({ text, isCorrect: false, meta: { groupKey: key } }))
    const valid = questionSchema.safeParse({
      type: 'GROUPS',
      prompt: 'Find the groups',
      timeLimitSec: 120,
      meta: { groups: [{ key: 'A' }, { key: 'B' }] },
      choices: [...makeTiles('A', ['a1', 'a2', 'a3']), ...makeTiles('B', ['b1', 'b2', 'b3'])],
    })
    expect(valid.success).toBe(true)

    const unevenSizes = questionSchema.safeParse({
      type: 'GROUPS',
      prompt: 'Find the groups',
      timeLimitSec: 120,
      meta: { groups: [{ key: 'A' }, { key: 'B' }] },
      choices: [...makeTiles('A', ['a1', 'a2', 'a3']), ...makeTiles('B', ['b1', 'b2'])],
    })
    expect(unevenSizes.success).toBe(false)
  })

  it('requires accepted answers for FILL_BLANK', () => {
    const valid = questionSchema.safeParse({
      type: 'FILL_BLANK',
      prompt: 'Highest mountain?',
      timeLimitSec: 25,
      meta: { acceptedAnswers: ['Everest'] },
      choices: [],
    })
    expect(valid.success).toBe(true)

    const missing = questionSchema.safeParse({
      type: 'FILL_BLANK',
      prompt: 'Highest mountain?',
      timeLimitSec: 25,
      meta: { acceptedAnswers: [] },
      choices: [],
    })
    expect(missing.success).toBe(false)
  })
})

describe('reportSchema', () => {
  it('enforces details max length', () => {
    const result = reportSchema.safeParse({
      quizId: 'ckq6xdr2w0000u3z5f6l6x4t5',
      reason: 'SPAM',
      details: 'x'.repeat(501),
    })
    expect(result.success).toBe(false)
  })
})

describe('categorySuggestionSchema', () => {
  it('enforces hex colors', () => {
    const result = categorySuggestionSchema.safeParse({
      name: 'New Category',
      description: 'Category description',
      icon: 'BookOpen',
      color: 'purple',
    })
    expect(result.success).toBe(false)
  })
})

describe('meProfileSchema', () => {
  it('accepts valid profile values', () => {
    expect(
      meProfileSchema.safeParse({
        name: 'Player One',
        username: 'player-one',
        bio: 'Ready to play.',
        image: 'https://example.com/avatar.png',
        bannerImage: 'https://example.com/banner.png',
      }).success
    ).toBe(true)
  })
})

describe('questionAnswerSchema', () => {
  it('accepts valid answer payload', () => {
    expect(
      questionAnswerSchema.safeParse({
        questionId: 'ckq6xdr2w0000u3z5f6l6x4t5',
        chosenIds: ['ckq6xdr2w0000u3z5f6l6x4t6'],
        timeTakenMs: 3200,
      }).success
    ).toBe(true)
  })
})

describe('submitAnswersSchema', () => {
  it('allows an empty answers list', () => {
    expect(
      submitAnswersSchema.safeParse({
        sessionId: 'ckq6xdr2w0000u3z5f6l6x4t5',
        answers: [],
      }).success
    ).toBe(true)
  })

  it('accepts a valid session id and answer list', () => {
    expect(
      submitAnswersSchema.safeParse({
        sessionId: 'ckq6xdr2w0000u3z5f6l6x4t5',
        answers: [
          {
            questionId: 'ckq6xdr2w0000u3z5f6l6x4t6',
            chosenIds: ['ckq6xdr2w0000u3z5f6l6x4t7'],
            timeTakenMs: 1800,
          },
        ],
      }).success
    ).toBe(true)
  })

  it('requires a valid session id and answer list', () => {
    expect(
      submitAnswersSchema.safeParse({
        sessionId: 'not-a-cuid',
        answers: [],
      }).success
    ).toBe(false)
  })
})

describe('userPreferencesSchema', () => {
  it('rejects unknown preference keys', () => {
    expect(
      userPreferencesSchema.safeParse({
        unknownPreference: true,
      }).success
    ).toBe(false)
  })
})

describe('createDuelSchema', () => {
  it('accepts valid duel configuration values', () => {
    expect(
      createDuelSchema.safeParse({
        categoryId: 'ckq6xdr2w0000u3z5f6l6x4t5',
        questionCount: 10,
        timeLimitSec: 20,
      }).success
    ).toBe(true)
  })

  it('rejects unsupported duel timer values', () => {
    expect(
      createDuelSchema.safeParse({
        questionCount: 10,
        timeLimitSec: 25,
      }).success
    ).toBe(false)
  })
})

describe('joinDuelSchema', () => {
  it('normalizes the invite code to uppercase', () => {
    const parsed = joinDuelSchema.parse({ code: 'ab12cd' })
    expect(parsed.code).toBe('AB12CD')
  })
})
