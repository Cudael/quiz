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
        format: 'CLASSIC',
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
        format: 'CLASSIC',
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
        format: 'CLASSIC',
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

  it('requires the fill blank placeholder for FILL_BLANK prompts', () => {
    const result = questionSchema.safeParse({
      type: 'FILL_BLANK',
      prompt: 'The capital of France is Paris.',
      timeLimitSec: 20,
      choices: [{ text: 'Paris', isCorrect: true }],
    })
    expect(result.success).toBe(false)
  })

  it('allows non-classic types without correct-choice rules', () => {
    const result = questionSchema.safeParse({
      type: 'MATCHING',
      prompt: 'Match each item',
      timeLimitSec: 20,
      choices: [
        { text: 'A', isCorrect: false, meta: { pairKey: 'one', side: 'left' } },
        { text: '1', isCorrect: false, meta: { pairKey: 'one', side: 'right' } },
      ],
    })
    expect(result.success).toBe(true)
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
