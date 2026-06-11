import { describe, it, expect } from 'vitest'
import { categories, badges, users, quizDefs, questionsByQuiz } from '../../prisma/seed-data'

describe('seed-data shapes', () => {
  describe('categories', () => {
    it('has at least 10 categories', () => {
      expect(categories.length).toBeGreaterThanOrEqual(10)
    })

    it('every category has required fields', () => {
      for (const cat of categories) {
        expect(cat.slug, `${cat.name} missing slug`).toBeTruthy()
        expect(cat.name, `${cat.slug} missing name`).toBeTruthy()
        expect(cat.description, `${cat.slug} missing description`).toBeTruthy()
        expect(cat.icon, `${cat.slug} missing icon`).toBeTruthy()
        expect(cat.color, `${cat.slug} missing color`).toBeTruthy()
      }
    })

    it('category slugs are unique', () => {
      const slugs = categories.map((c) => c.slug)
      const unique = new Set(slugs)
      expect(unique.size).toBe(slugs.length)
    })
  })

  describe('badges', () => {
    it('has at least 9 badges', () => {
      expect(badges.length).toBeGreaterThanOrEqual(9)
    })

    it('every badge has required fields', () => {
      for (const badge of badges) {
        expect(badge.slug, `badge missing slug`).toBeTruthy()
        expect(badge.name, `${badge.slug} missing name`).toBeTruthy()
        expect(badge.description, `${badge.slug} missing description`).toBeTruthy()
        expect(badge.icon, `${badge.slug} missing icon`).toBeTruthy()
        expect(badge.criteria, `${badge.slug} missing criteria`).toBeTruthy()
        expect(typeof badge.criteria, `${badge.slug} criteria should be object`).toBe('object')
      }
    })

    it('badge slugs are unique', () => {
      const slugs = badges.map((b) => b.slug)
      const unique = new Set(slugs)
      expect(unique.size).toBe(slugs.length)
    })
  })

  describe('users', () => {
    it('has at least 3 demo users', () => {
      expect(users.length).toBeGreaterThanOrEqual(3)
    })

    it('has at least one admin user', () => {
      const admins = users.filter((u) => u.role === 'ADMIN')
      expect(admins.length).toBeGreaterThanOrEqual(1)
    })

    it('every user has required fields', () => {
      for (const user of users) {
        expect(user.id, `user missing id`).toBeTruthy()
        expect(user.name, `${user.id} missing name`).toBeTruthy()
        expect(user.email, `${user.id} missing email`).toBeTruthy()
        expect(['USER', 'ADMIN']).toContain(user.role)
        expect(user.xp).toBeGreaterThanOrEqual(0)
        expect(user.level).toBeGreaterThanOrEqual(1)
      }
    })
  })

  describe('quizzes', () => {
    it('has at least 30 quiz definitions', () => {
      expect(quizDefs.length).toBeGreaterThanOrEqual(30)
    })

    it('every quiz references a valid category', () => {
      const categorySlugs = new Set(categories.map((c) => c.slug))
      for (const quiz of quizDefs) {
        expect(
          categorySlugs.has(quiz.categorySlug),
          `Quiz "${quiz.title}" has unknown category "${quiz.categorySlug}"`
        ).toBe(true)
      }
    })

    it('every quiz has valid difficulty', () => {
      const validDifficulties = ['EASY', 'MEDIUM', 'HARD']
      for (const quiz of quizDefs) {
        expect(
          validDifficulties,
          `Quiz "${quiz.title}" has invalid difficulty "${quiz.difficulty}"`
        ).toContain(quiz.difficulty)
      }
    })
  })

  describe('questions', () => {
    it('has questions for at least 10 quizzes', () => {
      const quizTitlesWithQuestions = Object.keys(questionsByQuiz)
      expect(quizTitlesWithQuestions.length).toBeGreaterThanOrEqual(10)
    })

    it('every question has at least 2 choices', () => {
      for (const [quizTitle, questions] of Object.entries(questionsByQuiz)) {
        for (const q of questions) {
          expect(
            q.choices.length,
            `Question "${q.prompt}" in quiz "${quizTitle}" has fewer than 2 choices`
          ).toBeGreaterThanOrEqual(2)
        }
      }
    })

    it('every question has at least one correct choice', () => {
      for (const [quizTitle, questions] of Object.entries(questionsByQuiz)) {
        for (const q of questions) {
          const correctChoices = q.choices.filter((c) => c.isCorrect)
          expect(
            correctChoices.length,
            `Question "${q.prompt}" in quiz "${quizTitle}" has no correct choice`
          ).toBeGreaterThanOrEqual(1)
        }
      }
    })

    it('every question has a valid type', () => {
      const validTypes = ['SINGLE']
      for (const [, questions] of Object.entries(questionsByQuiz)) {
        for (const q of questions) {
          expect(validTypes).toContain(q.type)
        }
      }
    })

    it('total question count is at least 80 (across seeded quizzes)', () => {
      const total = Object.values(questionsByQuiz).reduce((sum, qs) => sum + qs.length, 0)
      expect(total).toBeGreaterThanOrEqual(80)
    })
  })
})
