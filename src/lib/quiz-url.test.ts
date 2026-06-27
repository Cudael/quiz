import { describe, expect, it } from 'vitest'
import { getQuizIdFromParam, getQuizPath } from './quiz-url'

describe('quiz-url', () => {
  it('builds keyword-friendly quiz paths with a stable id suffix', () => {
    expect(getQuizPath({ id: 'clx123abc', title: 'World Capitals: Beginner!' })).toBe(
      '/quiz/world-capitals-beginner-clx123abc'
    )
  })

  it('falls back to a generic slug when the title has no sluggable text', () => {
    expect(getQuizPath({ id: 'clx123abc', title: '???' })).toBe('/quiz/quiz-clx123abc')
  })

  it('extracts ids from legacy and slugged params', () => {
    expect(getQuizIdFromParam('clx123abc')).toBe('clx123abc')
    expect(getQuizIdFromParam('world-capitals-beginner-clx123abc')).toBe('clx123abc')
  })
})
