import { describe, expect, it } from 'vitest'
import { parseUserPreferences, REDUCED_MOTION_STORAGE_KEY } from '@/lib/preferences'

describe('REDUCED_MOTION_STORAGE_KEY', () => {
  it('is a non-empty string', () => {
    expect(typeof REDUCED_MOTION_STORAGE_KEY).toBe('string')
    expect(REDUCED_MOTION_STORAGE_KEY.length).toBeGreaterThan(0)
  })
})

describe('parseUserPreferences', () => {
  it('returns empty object for null', () => {
    expect(parseUserPreferences(null)).toEqual({})
  })

  it('returns empty object for undefined', () => {
    expect(parseUserPreferences(undefined)).toEqual({})
  })

  it('returns empty object for a non-object JsonValue (string)', () => {
    expect(parseUserPreferences('not-an-object')).toEqual({})
  })

  it('returns empty object for an object that fails schema validation', () => {
    expect(parseUserPreferences({ unknownKey: true })).toEqual({})
  })

  it('parses valid preferences with reducedMotion', () => {
    const result = parseUserPreferences({ reducedMotion: true })
    expect(result).toEqual({ reducedMotion: true })
  })

  it('parses valid preferences with defaultDifficulty', () => {
    const result = parseUserPreferences({ defaultDifficulty: 'HARD' })
    expect(result).toEqual({ defaultDifficulty: 'HARD' })
  })

  it('parses multiple valid fields at once', () => {
    const result = parseUserPreferences({ defaultDifficulty: 'EASY', reducedMotion: false })
    expect(result).toEqual({ defaultDifficulty: 'EASY', reducedMotion: false })
  })
})
