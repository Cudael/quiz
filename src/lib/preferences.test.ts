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

  it('returns empty object for empty string', () => {
    expect(parseUserPreferences('')).toEqual({})
  })

  it('returns empty object for invalid JSON', () => {
    expect(parseUserPreferences('not-json')).toEqual({})
  })

  it('returns empty object for JSON that fails schema validation', () => {
    expect(parseUserPreferences('{"unknownKey": true}')).toEqual({})
  })

  it('parses valid preferences with reducedMotion', () => {
    const result = parseUserPreferences(JSON.stringify({ reducedMotion: true }))
    expect(result).toEqual({ reducedMotion: true })
  })

  it('parses valid preferences with defaultMode', () => {
    const result = parseUserPreferences(JSON.stringify({ defaultMode: 'CLASSIC' }))
    expect(result).toEqual({ defaultMode: 'CLASSIC' })
  })

  it('parses valid preferences with defaultDifficulty', () => {
    const result = parseUserPreferences(JSON.stringify({ defaultDifficulty: 'HARD' }))
    expect(result).toEqual({ defaultDifficulty: 'HARD' })
  })

  it('parses multiple valid fields at once', () => {
    const result = parseUserPreferences(
      JSON.stringify({ defaultMode: 'TIMED', reducedMotion: false })
    )
    expect(result).toEqual({ defaultMode: 'TIMED', reducedMotion: false })
  })
})
