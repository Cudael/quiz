import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  CONSENT_CHANGE_EVENT,
  CONSENT_STORAGE_KEY,
  OPEN_CONSENT_SETTINGS_EVENT,
  openConsentSettings,
  readConsentPreferences,
  saveConsentPreferences,
} from './consent'

describe('consent preferences', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns null when no valid choice is stored', () => {
    expect(readConsentPreferences()).toBeNull()
    localStorage.setItem(CONSENT_STORAGE_KEY, '{invalid')
    expect(readConsentPreferences()).toBeNull()
  })

  it('stores an explicit analytics choice and announces the change', () => {
    const listener = vi.fn()
    window.addEventListener(CONSENT_CHANGE_EVENT, listener)

    const saved = saveConsentPreferences(true)

    expect(saved).toMatchObject({ version: 1, necessary: true, analytics: true })
    expect(readConsentPreferences()).toEqual(saved)
    expect(listener).toHaveBeenCalledOnce()
    window.removeEventListener(CONSENT_CHANGE_EVENT, listener)
  })

  it('announces a request to reopen cookie settings', () => {
    const listener = vi.fn()
    window.addEventListener(OPEN_CONSENT_SETTINGS_EVENT, listener)

    openConsentSettings()

    expect(listener).toHaveBeenCalledOnce()
    window.removeEventListener(OPEN_CONSENT_SETTINGS_EVENT, listener)
  })
})
