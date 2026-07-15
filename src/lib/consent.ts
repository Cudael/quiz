export const CONSENT_STORAGE_KEY = 'busquiz-consent-v1'
export const CONSENT_VERSION = 1
export const CONSENT_CHANGE_EVENT = 'busquiz:consent-change'
export const OPEN_CONSENT_SETTINGS_EVENT = 'busquiz:open-consent-settings'
export const ANALYTICS_READY_EVENT = 'busquiz:analytics-ready'

export interface ConsentPreferences {
  version: typeof CONSENT_VERSION
  necessary: true
  analytics: boolean
  updatedAt: string
}

function isConsentPreferences(value: unknown): value is ConsentPreferences {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<ConsentPreferences>
  return (
    candidate.version === CONSENT_VERSION &&
    candidate.necessary === true &&
    typeof candidate.analytics === 'boolean' &&
    typeof candidate.updatedAt === 'string'
  )
}

export function parseConsentPreferences(stored: string | null): ConsentPreferences | null {
  if (!stored) return null
  try {
    const parsed: unknown = JSON.parse(stored)
    return isConsentPreferences(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function readConsentPreferences(): ConsentPreferences | null {
  if (typeof window === 'undefined') return null
  return parseConsentPreferences(localStorage.getItem(CONSENT_STORAGE_KEY))
}

export function saveConsentPreferences(analytics: boolean): ConsentPreferences {
  const preferences: ConsentPreferences = {
    version: CONSENT_VERSION,
    necessary: true,
    analytics,
    updatedAt: new Date().toISOString(),
  }
  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(preferences))
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: preferences }))
  return preferences
}

export function openConsentSettings(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(OPEN_CONSENT_SETTINGS_EVENT))
  }
}
