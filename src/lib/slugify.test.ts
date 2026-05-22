import { describe, expect, it } from 'vitest'
import { slugify } from '@/lib/slugify'

describe('slugify', () => {
  it('normalizes spaces and punctuation', () => {
    expect(slugify('Space Exploration!')).toBe('space-exploration')
  })

  it('collapses repeated separators', () => {
    expect(slugify('A---B   C')).toBe('a-b-c')
  })

  it('handles edge-only separators', () => {
    expect(slugify('***')).toBe('')
  })
})
