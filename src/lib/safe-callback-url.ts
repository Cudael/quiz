/**
 * Returns `callbackUrl` only if it is a safe same-origin redirect target.
 *
 * A URL is considered safe when:
 * - It is a relative path starting with `/` but NOT `//` (protocol-relative), OR
 * - It matches the same origin as `NEXTAUTH_URL`.
 *
 * Everything else falls back to `defaultUrl`.
 */
export function safeCallbackUrl(callbackUrl: string | undefined, defaultUrl: string): string {
  if (!callbackUrl) return defaultUrl

  // Allow relative paths (e.g. "/me", "/quiz/123") but not protocol-relative
  // URLs like "//evil.com" which browsers resolve as "https://evil.com".
  if (callbackUrl.startsWith('/') && !callbackUrl.startsWith('//')) {
    return callbackUrl
  }

  // Allow same-origin absolute URLs when NEXTAUTH_URL is configured.
  const base = process.env.NEXTAUTH_URL
  if (base) {
    try {
      const target = new URL(callbackUrl)
      const origin = new URL(base)
      if (target.origin === origin.origin) {
        return callbackUrl
      }
    } catch {
      // Not a valid absolute URL — fall through to default.
    }
  }

  return defaultUrl
}
