import { describe, expect, it } from 'vitest'
import { isWithinOneEdit, matchesAcceptedAnswer, normalizeTextAnswer } from './text-answer'

describe('normalizeTextAnswer', () => {
  it('lowercases, trims and collapses whitespace', () => {
    expect(normalizeTextAnswer('  Mount   Everest  ')).toBe('mount everest')
  })

  it('strips diacritics', () => {
    expect(normalizeTextAnswer('Café au Lait')).toBe('cafe au lait')
  })

  it('strips punctuation', () => {
    expect(normalizeTextAnswer('U.S.A.!')).toBe('u s a')
  })

  it('removes a leading "the"', () => {
    expect(normalizeTextAnswer('The Netherlands')).toBe('netherlands')
  })

  it('normalizes curly apostrophes', () => {
    expect(normalizeTextAnswer("O'Brien")).toBe(normalizeTextAnswer('O\u2019Brien'))
  })
})

describe('isWithinOneEdit', () => {
  it('accepts identical strings', () => {
    expect(isWithinOneEdit('paris', 'paris')).toBe(true)
  })

  it('accepts one substitution', () => {
    expect(isWithinOneEdit('parys', 'paris')).toBe(true)
  })

  it('accepts one insertion/deletion', () => {
    expect(isWithinOneEdit('pari', 'paris')).toBe(true)
    expect(isWithinOneEdit('pariss', 'paris')).toBe(true)
  })

  it('rejects two edits', () => {
    expect(isWithinOneEdit('pyrus', 'paris')).toBe(false)
    expect(isWithinOneEdit('par', 'paris')).toBe(false)
  })
})

describe('matchesAcceptedAnswer', () => {
  it('matches any accepted spelling', () => {
    expect(matchesAcceptedAnswer('everest', ['Mount Everest', 'Everest'])).toBe(true)
  })

  it('rejects non-matching answers', () => {
    expect(matchesAcceptedAnswer('K2', ['Mount Everest', 'Everest'])).toBe(false)
  })

  it('allows one typo in fuzzy mode for answers of 6+ chars', () => {
    expect(matchesAcceptedAnswer('everset', ['Everest'], true)).toBe(false) // 2 edits
    expect(matchesAcceptedAnswer('everes', ['Everest'], true)).toBe(true)
    expect(matchesAcceptedAnswer('everes', ['Everest'], false)).toBe(false)
  })

  it('does not fuzzy-match short answers', () => {
    expect(matchesAcceptedAnswer('cat', ['car'], true)).toBe(false)
  })

  it('rejects empty input', () => {
    expect(matchesAcceptedAnswer('   ', ['Everest'])).toBe(false)
  })
})
