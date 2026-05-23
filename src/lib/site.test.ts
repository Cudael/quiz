import { describe, expect, it, vi } from 'vitest'

describe('absoluteUrl', () => {
  it('normalizes leading slashes in paths', async () => {
    vi.resetModules()
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.com/')
    const { absoluteUrl } = await import('./site')

    expect(absoluteUrl()).toBe('https://example.com')
    expect(absoluteUrl('/quiz/123')).toBe('https://example.com/quiz/123')
    expect(absoluteUrl('//quiz/123')).toBe('https://example.com/quiz/123')
    expect(absoluteUrl('/')).toBe('https://example.com/')
  })
})
