import { describe, expect, it } from 'vitest'
import { serializeJsonLd } from './seo'

describe('serializeJsonLd', () => {
  it('escapes less-than characters to avoid script injection', () => {
    const json = serializeJsonLd({
      '@context': 'https://schema.org',
      '@type': 'Quiz',
      name: '</script><script>alert(1)</script>',
    })

    expect(json).toContain('\\u003c/script>')
    expect(json).not.toContain('</script>')
  })

  it('returns valid JSON text', () => {
    const json = serializeJsonLd({ name: 'Quiz Arena', count: 10 })
    expect(JSON.parse(json)).toEqual({ name: 'Quiz Arena', count: 10 })
  })
})
