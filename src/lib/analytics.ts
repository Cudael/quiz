const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
  }
}

export function isGaEnabled(): boolean {
  return typeof window !== 'undefined' && !!GA_MEASUREMENT_ID
}

export function pageview(url: string): void {
  if (!isGaEnabled()) return
  window.gtag('config', GA_MEASUREMENT_ID, { page_path: url })
}

export function event(action: string, params?: Record<string, unknown>): void {
  if (!isGaEnabled()) return
  window.gtag('event', action, params)
}
