'use client'

import * as React from 'react'
import Script from 'next/script'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, LockKeyhole } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import {
  ANALYTICS_READY_EVENT,
  CONSENT_CHANGE_EVENT,
  CONSENT_STORAGE_KEY,
  OPEN_CONSENT_SETTINGS_EVENT,
  parseConsentPreferences,
  readConsentPreferences,
  saveConsentPreferences,
} from '@/lib/consent'

interface ConsentManagerProps {
  measurementId?: string
  nonce?: string
}

declare global {
  interface Window {
    dataLayer?: unknown[][]
    gtag?: (...args: unknown[]) => void
  }
}

function disableAnalytics(measurementId?: string) {
  if (measurementId) {
    ;(window as unknown as Record<string, unknown>)[`ga-disable-${measurementId}`] = true
  }
  window.gtag = undefined

  const hostnameParts = window.location.hostname.split('.')
  const cookieDomains = hostnameParts.flatMap((_, index) => {
    const domain = hostnameParts.slice(index).join('.')
    return domain.includes('.') ? [domain] : []
  })

  for (const cookie of document.cookie.split(';')) {
    const name = cookie.split('=')[0]?.trim()
    if (!name || (name !== '_ga' && !name.startsWith('_ga_'))) continue
    document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`
    for (const domain of cookieDomains) {
      document.cookie = `${name}=; Max-Age=0; path=/; domain=.${domain}; SameSite=Lax`
    }
  }
}

function initializeAnalytics(measurementId: string) {
  ;(window as unknown as Record<string, unknown>)[`ga-disable-${measurementId}`] = false
  window.dataLayer = window.dataLayer ?? []
  window.gtag = (...args: unknown[]) => {
    window.dataLayer?.push(args)
  }
  window.gtag('js', new Date())
  window.gtag('config', measurementId, { send_page_view: false })
  window.dispatchEvent(new Event(ANALYTICS_READY_EVENT))
}

function subscribeToConsent(onStoreChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === CONSENT_STORAGE_KEY) onStoreChange()
  }
  window.addEventListener(CONSENT_CHANGE_EVENT, onStoreChange)
  window.addEventListener('storage', handleStorage)
  return () => {
    window.removeEventListener(CONSENT_CHANGE_EVENT, onStoreChange)
    window.removeEventListener('storage', handleStorage)
  }
}

function getConsentSnapshot() {
  return localStorage.getItem(CONSENT_STORAGE_KEY)
}

function subscribeToHydration() {
  return () => undefined
}

export function ConsentManager({ measurementId, nonce }: ConsentManagerProps) {
  const pathname = usePathname()
  const isEmbed = pathname?.startsWith('/embed') ?? false
  const storedConsent = React.useSyncExternalStore(
    subscribeToConsent,
    getConsentSnapshot,
    () => null
  )
  const hydrated = React.useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false
  )
  const preferences = React.useMemo(() => parseConsentPreferences(storedConsent), [storedConsent])
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const [analyticsDraft, setAnalyticsDraft] = React.useState(false)

  React.useEffect(() => {
    const openSettings = () => {
      const current = readConsentPreferences()
      setAnalyticsDraft(current?.analytics ?? false)
      setSettingsOpen(true)
    }
    window.addEventListener(OPEN_CONSENT_SETTINGS_EVENT, openSettings)
    return () => {
      window.removeEventListener(OPEN_CONSENT_SETTINGS_EVENT, openSettings)
    }
  }, [])

  React.useEffect(() => {
    if (hydrated && (isEmbed || !preferences?.analytics)) {
      disableAnalytics(measurementId)
    }
  }, [hydrated, isEmbed, measurementId, preferences?.analytics])

  const choose = (analytics: boolean) => {
    const next = saveConsentPreferences(analytics)
    setAnalyticsDraft(next.analytics)
    setSettingsOpen(false)
  }

  const analyticsAllowed = Boolean(!isEmbed && measurementId && preferences?.analytics)
  const analyticsAvailable = Boolean(!isEmbed && measurementId)

  return (
    <>
      {analyticsAllowed && (
        <Script
          id="google-analytics"
          src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
          strategy="afterInteractive"
          nonce={nonce}
          onReady={() => initializeAnalytics(measurementId!)}
        />
      )}

      {hydrated && analyticsAvailable && !preferences && (
        <section
          aria-label="Cookie consent"
          className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-5xl rounded-md border border-border bg-card p-4 shadow-2xl sm:p-5"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="font-bold">Your privacy choices</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                BusQuiz uses necessary storage to operate the site. With your permission, we also
                use Google Analytics to understand visits and improve quizzes. Analytics stays off
                unless you accept it. Learn more in our{' '}
                <Link className="font-medium text-foreground underline" href="/cookies">
                  Cookie Policy
                </Link>
                .
              </p>
            </div>
            <div className="grid shrink-0 gap-2 sm:grid-cols-3">
              <Button onClick={() => choose(false)}>Reject optional</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setAnalyticsDraft(false)
                  setSettingsOpen(true)
                }}
              >
                Manage preferences
              </Button>
              <Button onClick={() => choose(true)}>Accept analytics</Button>
            </div>
          </div>
        </section>
      )}

      <Modal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="Cookie preferences"
        description="Choose which optional technologies BusQuiz may use. You can change this at any time from the footer."
        size="lg"
      >
        <div className="space-y-3">
          <div className="flex gap-3 rounded-md border border-border bg-muted/40 p-4">
            <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold">Necessary</h3>
                <span className="text-xs font-semibold text-muted-foreground">Always active</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Required for sign-in, security, preferences, and core quiz features. These cannot be
                disabled through this panel.
              </p>
            </div>
          </div>

          <label className="flex cursor-pointer gap-3 rounded-md border border-border p-4">
            <BarChart3 className="mt-0.5 h-5 w-5 shrink-0" />
            <span className="flex-1">
              <span className="font-semibold">Analytics</span>
              <span className="mt-1 block text-sm text-muted-foreground">
                {analyticsAvailable
                  ? 'Allows Google Analytics to measure page visits and site usage. Disabled by default.'
                  : 'Analytics is not currently configured on BusQuiz.'}
              </span>
            </span>
            <input
              type="checkbox"
              className="mt-1 h-5 w-5 accent-primary"
              checked={analyticsDraft}
              disabled={!analyticsAvailable}
              onChange={(event) => setAnalyticsDraft(event.target.checked)}
            />
          </label>

          <div className="rounded-md border border-border p-4 text-sm text-muted-foreground">
            BusQuiz does not currently use advertising cookies. If advertising is introduced, we
            will ask separately through an advertising-compatible consent platform.
          </div>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => choose(false)}>
              Reject optional
            </Button>
            <Button onClick={() => choose(analyticsDraft)}>Save preferences</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
