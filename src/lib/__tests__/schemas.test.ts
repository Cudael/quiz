import { describe, expect, it } from 'vitest'
import { categorySuggestionSchema, questionSchema, quizSchema, reportSchema } from '@/lib/schemas'

describe('quizSchema', () => {
  it('accepts valid quiz input', () => {
    expect(
      quizSchema.safeParse({
        title: 'Sample Quiz',
        description: 'A valid description',
        categoryId: 'ckq6xdr2w0000u3z5f6l6x4t5',
        difficulty: 'MEDIUM',
        isPublished: true,
      }).success
    ).toBe(true)
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
