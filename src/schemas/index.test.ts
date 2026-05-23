import { describe, expect, it } from 'vitest'
import {
  categorySuggestionSchema,
  meProfileSchema,
  questionSchema,
  quizSchema,
  reportSchema,
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
      }).success
    ).toBe(true)
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
