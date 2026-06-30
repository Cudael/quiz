import { describe, expect, it } from 'vitest'
import { getQuizPath } from './quiz-url'

describe('quiz-url', () => {
  it('builds quiz paths from slug', () => {
    expect(getQuizPath({ slug: 'world-capitals-beginner' })).toBe('/quiz/world-capitals-beginner')
  })

  it('handles simple slugs', () => {
    expect(getQuizPath({ slug: 'science-trivia' })).toBe('/quiz/science-trivia')
  })
})
