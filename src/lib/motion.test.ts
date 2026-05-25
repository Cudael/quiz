import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  transitions,
  fadeUp,
  fadeIn,
  scaleIn,
  none,
  staggerContainer,
  withReducedMotion,
  shouldUseReducedMotion,
} from '@/lib/motion'

describe('transitions', () => {
  it('spring has type spring', () => {
    expect(transitions.spring.type).toBe('spring')
  })

  it('ease has a duration', () => {
    expect(transitions.ease.duration).toBe(0.2)
  })

  it('easeMd has a longer duration', () => {
    expect(transitions.easeMd.duration).toBe(0.4)
  })
})

describe('variant presets', () => {
  it('fadeUp has hidden and show states', () => {
    expect(fadeUp.hidden).toMatchObject({ opacity: 0, y: 20 })
    expect(fadeUp.show).toMatchObject({ opacity: 1, y: 0 })
  })

  it('fadeIn has hidden and show states', () => {
    expect(fadeIn.hidden).toMatchObject({ opacity: 0 })
    expect(fadeIn.show).toMatchObject({ opacity: 1 })
  })

  it('scaleIn has hidden and show states', () => {
    expect(scaleIn.hidden).toMatchObject({ opacity: 0, scale: 0.95 })
    expect(scaleIn.show).toMatchObject({ opacity: 1, scale: 1 })
  })

  it('none has empty hidden and show states', () => {
    expect(none.hidden).toEqual({})
    expect(none.show).toEqual({})
  })
})

describe('staggerContainer', () => {
  it('uses 0.08 as default stagger', () => {
    const variants = staggerContainer()
    expect(
      (variants.show as { transition: { staggerChildren: number } }).transition.staggerChildren
    ).toBe(0.08)
  })

  it('uses provided stagger value', () => {
    const variants = staggerContainer(0.15)
    expect(
      (variants.show as { transition: { staggerChildren: number } }).transition.staggerChildren
    ).toBe(0.15)
  })

  it('hidden starts with opacity 0', () => {
    const variants = staggerContainer()
    expect(variants.hidden).toMatchObject({ opacity: 0 })
  })
})

describe('shouldUseReducedMotion', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('returns true when localStorage has reducedMotion=true', () => {
    localStorage.setItem('reducedMotion', 'true')
    expect(shouldUseReducedMotion(false)).toBe(true)
  })

  it('returns false when localStorage has reducedMotion=false', () => {
    localStorage.setItem('reducedMotion', 'false')
    expect(shouldUseReducedMotion(true)).toBe(false)
  })

  it('falls back to shouldReduce arg when localStorage has no override', () => {
    expect(shouldUseReducedMotion(true)).toBe(true)
    expect(shouldUseReducedMotion(false)).toBe(false)
    expect(shouldUseReducedMotion(null)).toBe(false)
  })
})

describe('withReducedMotion', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('returns none variant when reduced motion is active', () => {
    localStorage.setItem('reducedMotion', 'true')
    expect(withReducedMotion(fadeUp, false)).toEqual(none)
  })

  it('returns given variant when reduced motion is inactive', () => {
    localStorage.setItem('reducedMotion', 'false')
    expect(withReducedMotion(fadeUp, false)).toBe(fadeUp)
  })

  it('returns none when shouldReduce arg is true and no localStorage override', () => {
    expect(withReducedMotion(fadeIn, true)).toEqual(none)
  })
})
