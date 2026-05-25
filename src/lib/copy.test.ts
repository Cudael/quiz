import { describe, expect, it } from 'vitest'
import { copy } from '@/lib/copy'

describe('copy', () => {
  describe('quiz', () => {
    it('wrongAnswer interpolates the correct answer', () => {
      expect(copy.quiz.wrongAnswer('Paris')).toBe(
        'Not quite — the right answer was Paris. Onwards!'
      )
    })

    it('timeout is a non-empty string', () => {
      expect(typeof copy.quiz.timeout).toBe('string')
      expect(copy.quiz.timeout.length).toBeGreaterThan(0)
    })

    it('streakReset is a non-empty string', () => {
      expect(typeof copy.quiz.streakReset).toBe('string')
      expect(copy.quiz.streakReset.length).toBeGreaterThan(0)
    })
  })

  describe('emptyStates', () => {
    it('leaderboard is a non-empty string', () => {
      expect(typeof copy.emptyStates.leaderboard).toBe('string')
      expect(copy.emptyStates.leaderboard.length).toBeGreaterThan(0)
    })

    it('noBadges is a non-empty string', () => {
      expect(typeof copy.emptyStates.noBadges).toBe('string')
      expect(copy.emptyStates.noBadges.length).toBeGreaterThan(0)
    })

    it('noPublishedQuizzes is a non-empty string', () => {
      expect(typeof copy.emptyStates.noPublishedQuizzes).toBe('string')
      expect(copy.emptyStates.noPublishedQuizzes.length).toBeGreaterThan(0)
    })

    it('noSessions is a non-empty string', () => {
      expect(typeof copy.emptyStates.noSessions).toBe('string')
      expect(copy.emptyStates.noSessions.length).toBeGreaterThan(0)
    })

    it('noCategoryResults is a non-empty string', () => {
      expect(typeof copy.emptyStates.noCategoryResults).toBe('string')
      expect(copy.emptyStates.noCategoryResults.length).toBeGreaterThan(0)
    })
  })
})
