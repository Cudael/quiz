import { describe, expect, it } from 'vitest'
import {
  BULK_QUIZ_IMPORT_MAX_QUIZZES,
  validateBulkQuizImportJson,
  type BulkImportQuiz,
} from '@/domain/quiz-bulk-import'

const categorySlugs = ['geography', 'science']

function buildQuiz(overrides: Partial<BulkImportQuiz> = {}): BulkImportQuiz {
  return {
    title: 'Beginner World Capitals',
    description: 'A quick quiz about famous national capitals.',
    categorySlug: 'geography',
    difficulty: 'EASY',
    tags: ['geography', 'capitals'],
    questions: Array.from({ length: 5 }, (_, index) => ({
      prompt: `Question ${index + 1}?`,
      explanation: 'A concise explanation.',
      timeLimitSec: 20,
      choices: [
        { text: 'Choice A', isCorrect: index === 0 },
        { text: 'Choice B', isCorrect: index !== 0 },
        { text: 'Choice C', isCorrect: false },
        { text: 'Choice D', isCorrect: false },
      ],
    })),
    ...overrides,
  }
}

describe('validateBulkQuizImportJson', () => {
  it('accepts a valid quiz payload', () => {
    const result = validateBulkQuizImportJson(JSON.stringify([buildQuiz()]), categorySlugs)

    expect(result.errors).toEqual([])
    expect(result.quizzes).toHaveLength(1)
    expect(result.previews[0]).toMatchObject({
      title: 'Beginner World Capitals',
      categorySlug: 'geography',
      questionCount: 5,
    })
  })

  it('rejects invalid JSON', () => {
    const result = validateBulkQuizImportJson('{bad json', categorySlugs)

    expect(result.errors[0]?.message).toBe('Invalid JSON.')
    expect(result.quizzes).toEqual([])
  })

  it('rejects non-array JSON', () => {
    const result = validateBulkQuizImportJson(JSON.stringify({ title: 'Nope' }), categorySlugs)

    expect(result.errors[0]?.message).toContain('array')
    expect(result.quizzes).toEqual([])
  })

  it('reports unknown category slugs', () => {
    const result = validateBulkQuizImportJson(
      JSON.stringify([buildQuiz({ categorySlug: 'missing-category' })]),
      categorySlugs
    )

    expect(result.errors[0]).toMatchObject({ quizIndex: 1, path: 'categorySlug' })
    expect(result.quizzes).toEqual([])
  })

  it('rejects quizzes with fewer than 5 questions', () => {
    const result = validateBulkQuizImportJson(
      JSON.stringify([buildQuiz({ questions: buildQuiz().questions.slice(0, 4) })]),
      categorySlugs
    )

    expect(result.errors[0]?.message).toContain('at least 5 questions')
    expect(result.quizzes).toEqual([])
  })

  it('rejects questions with no correct answer', () => {
    const quiz = buildQuiz()
    quiz.questions[0] = {
      ...quiz.questions[0],
      choices: quiz.questions[0].choices.map((choice) => ({ ...choice, isCorrect: false })),
    }

    const result = validateBulkQuizImportJson(JSON.stringify([quiz]), categorySlugs)

    expect(result.errors[0]).toMatchObject({ quizIndex: 1, path: 'questions[0].choices' })
    expect(result.errors[0]?.message).toContain('exactly one correct choice')
  })

  it('rejects questions with multiple correct answers', () => {
    const quiz = buildQuiz()
    quiz.questions[0] = {
      ...quiz.questions[0],
      choices: quiz.questions[0].choices.map((choice) => ({ ...choice, isCorrect: true })),
    }

    const result = validateBulkQuizImportJson(JSON.stringify([quiz]), categorySlugs)

    expect(result.errors[0]?.message).toContain('exactly one correct choice')
    expect(result.quizzes).toEqual([])
  })

  it('rejects duplicate quiz titles', () => {
    const result = validateBulkQuizImportJson(
      JSON.stringify([buildQuiz(), buildQuiz({ title: ' beginner   world capitals ' })]),
      categorySlugs
    )

    expect(result.errors).toHaveLength(2)
    expect(result.errors.every((error) => error.path === 'title')).toBe(true)
    expect(result.quizzes).toEqual([])
  })

  it('rejects batches over the import limit', () => {
    const payload = Array.from({ length: BULK_QUIZ_IMPORT_MAX_QUIZZES + 1 }, (_, index) =>
      buildQuiz({ title: `Quiz ${index + 1}` })
    )

    const result = validateBulkQuizImportJson(JSON.stringify(payload), categorySlugs)

    expect(result.errors[0]?.message).toContain('at most 100 quizzes')
    expect(result.quizzes).toEqual([])
  })
})
