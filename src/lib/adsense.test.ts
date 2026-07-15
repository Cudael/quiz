import { describe, expect, it } from 'vitest'
import { canRequestAds, getAdsTxtRecord, normalizeAdSensePublisherId } from './adsense'

describe('AdSense helpers', () => {
  it('accepts only complete publisher identifiers', () => {
    expect(normalizeAdSensePublisherId('ca-pub-1234567890123456')).toBe('ca-pub-1234567890123456')
    expect(normalizeAdSensePublisherId('pub-123')).toBeUndefined()
  })

  it('formats the authorized seller record', () => {
    expect(getAdsTxtRecord('ca-pub-1234567890123456')).toBe(
      'google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0'
    )
  })

  it('allows only substantial content pages after certified consent', () => {
    expect(
      canRequestAds({
        pathname: '/quiz/european-capitals',
        hasCertifiedConsent: true,
        hasSubstantialContent: true,
      })
    ).toBe(true)

    for (const pathname of ['/play/quiz-1', '/results/session-1', '/sign-in', '/duel/abc']) {
      expect(
        canRequestAds({ pathname, hasCertifiedConsent: true, hasSubstantialContent: true })
      ).toBe(false)
    }

    expect(
      canRequestAds({
        pathname: '/blog/quiz-learning',
        hasCertifiedConsent: false,
        hasSubstantialContent: true,
      })
    ).toBe(false)
  })
})
