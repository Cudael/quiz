import { describe, expect, it } from 'vitest'
import { WEEK_IN_MS } from '@/lib/time'

describe('time constants', () => {
  it('WEEK_IN_MS equals 7 days in milliseconds', () => {
    expect(WEEK_IN_MS).toBe(7 * 24 * 60 * 60 * 1000)
  })

  it('WEEK_IN_MS equals 604800000', () => {
    expect(WEEK_IN_MS).toBe(604_800_000)
  })
})
