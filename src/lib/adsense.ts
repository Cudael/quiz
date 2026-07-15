const ADSENSE_PUBLISHER_ID_PATTERN = /^ca-pub-\d{16}$/

export function normalizeAdSensePublisherId(value: string | undefined) {
  const normalized = value?.trim()
  return normalized && ADSENSE_PUBLISHER_ID_PATTERN.test(normalized) ? normalized : undefined
}

export function getAdsTxtRecord(publisherId: string) {
  return `google.com, ${publisherId.replace(/^ca-/, '')}, DIRECT, f08c47fec0942fa0`
}

const CONTENT_ROUTE_PATTERNS = [
  /^\/quiz\/[^/]+$/,
  /^\/blog\/[^/]+$/,
  /^\/categories\/[^/]+$/,
  /^\/collections\/[^/]+$/,
  /^\/trivia-facts$/,
]

interface AdRequestEligibilityInput {
  pathname: string
  hasCertifiedConsent: boolean
  hasSubstantialContent: boolean
}

/** Future ad components must pass consent and page-level content checks as well as this allowlist. */
export function canRequestAds(input: AdRequestEligibilityInput) {
  return (
    input.hasCertifiedConsent &&
    input.hasSubstantialContent &&
    CONTENT_ROUTE_PATTERNS.some((pattern) => pattern.test(input.pathname))
  )
}
