import { describe, expect, it } from 'vitest'
import { getQuizPublicationQualityIssues } from './quiz-publication-quality'

const explanation = 'This explains why the correct answer is right.'

describe('quiz publication quality', () => {
  it('accepts a substantial quiz ready for editorial review', () => {
    expect(
      getQuizPublicationQualityIssues({
        description: 'A focused quiz about European capitals and their countries.',
        questions: [
          { explanation },
          { explanation },
          { explanation },
          { explanation: null },
          { explanation: null },
        ],
      })
    ).toEqual([])
  })

  it('reports thin descriptions, too few questions, and missing explanations', () => {
    const issues = getQuizPublicationQualityIssues({
      description: 'Too short',
      questions: [{ explanation: 'Brief' }],
    })

    expect(issues).toHaveLength(3)
    expect(issues.join(' ')).toContain('at least 5 questions')
    expect(issues.join(' ')).toContain('at least 30 characters')
    expect(issues.join(' ')).toContain('at least 3 questions')
  })
})
