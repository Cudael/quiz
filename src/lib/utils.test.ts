import { describe, it, expect } from 'vitest'
import { withAlphaColor } from '@/lib/utils'

describe('utils', () => {
  it('should pass', () => {
    expect(1 + 1).toBe(2)
  })

  it('converts short and full hex colors to rgba with alpha', () => {
    expect(withAlphaColor('#fff', 0.2)).toBe('rgba(255, 255, 255, 0.2)')
    expect(withAlphaColor('#112233', 0.5)).toBe('rgba(17, 34, 51, 0.5)')
  })

  it('returns non-hex values unchanged', () => {
    expect(withAlphaColor('rgb(10, 20, 30)', 0.2)).toBe('rgb(10, 20, 30)')
  })
})
