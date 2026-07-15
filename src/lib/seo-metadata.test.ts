import { describe, expect, it } from 'vitest'
import { isQuizIndexable, isQuizListingIndexable, seoDescription, seoTitle } from './seo-metadata'

describe('SEO metadata helpers', () => {
  it('normalizes and truncates long titles at a word boundary', () => {
    const title = seoTitle(
      '  A very long   quiz title about European history and important events  ',
      35
    )
    expect(title.length).toBeLessThanOrEqual(35)
    expect(title).toBe('A very long quiz title about…')
  })

  it('uses a fallback and bounds descriptions', () => {
    expect(seoDescription('   ', 'Fallback description')).toBe('Fallback description')
    expect(seoDescription('x '.repeat(200), 'Fallback').length).toBeLessThanOrEqual(158)
  })

  it('requires substantial, unflagged quiz content for indexing', () => {
    expect(
      isQuizIndexable({
        description: 'A useful description with enough detail for a search visitor.',
        questionCount: 5,
        explainedQuestionCount: 3,
        pendingReportCount: 0,
      })
    ).toBe(true)
    expect(
      isQuizIndexable({
        description: 'Too short',
        questionCount: 4,
        explainedQuestionCount: 2,
        pendingReportCount: 0,
      })
    ).toBe(false)
    expect(
      isQuizIndexable({
        description: 'A useful description with enough detail for a search visitor.',
        questionCount: 10,
        explainedQuestionCount: 10,
        pendingReportCount: 1,
      })
    ).toBe(false)
  })

  it('keeps thin category and collection listings out of search', () => {
    expect(isQuizListingIndexable(2)).toBe(false)
    expect(isQuizListingIndexable(3)).toBe(true)
  })
})
