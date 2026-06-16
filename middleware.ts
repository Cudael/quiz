import NextAuth from 'next-auth'
import { authConfig } from '@/server/auth.config'
import { NextResponse } from 'next/server'

const PATHNAME_HEADER = 'x-quiz-pathname'
const NONCE_HEADER = 'x-nonce'

const GUEST_ONLY_ROUTES = ['/sign-in', '/sign-up']

const { auth } = NextAuth(authConfig)

const r2ImageHost = (() => {
  try {
    return process.env.R2_PUBLIC_URL ? new URL(process.env.R2_PUBLIC_URL).hostname : null
  } catch {
    return null
  }
})()

function buildCsp(nonce: string): string {
  const isGaEnabled = !!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  // External script hosts for analytics
  const extraScriptSrc: string[] = []
  if (isGaEnabled) extraScriptSrc.push('https://www.googletagmanager.com')

  const scriptSrc =
    process.env.NODE_ENV === 'production'
      ? `script-src 'self' 'nonce-${nonce}'${extraScriptSrc.length ? ' ' + extraScriptSrc.join(' ') : ''}`
      : `script-src 'self' 'nonce-${nonce}' 'unsafe-eval'${extraScriptSrc.length ? ' ' + extraScriptSrc.join(' ') : ''}`

  // connect-src hosts for analytics data collection
  const analyticsConnectSrc: string[] = []
  if (isGaEnabled) {
    analyticsConnectSrc.push('https://*.google-analytics.com', 'https://*.googletagmanager.com')
  }

  const imgSrcHosts = [
    'https://images.unsplash.com',
    'https://avatars.githubusercontent.com',
    'https://lh3.googleusercontent.com',
    'https://*.public.blob.vercel-storage.com',
    ...(r2ImageHost ? [`https://${r2ImageHost}`] : []),
  ].join(' ')

  // connect-src: allow self + the configured app domain (NEXTAUTH_URL) for API
  // calls. Avoids hardcoding domains that may differ between deployments.
  const connectSrcHosts = process.env.NEXTAUTH_URL
    ? (() => {
        try {
          const origin = new URL(process.env.NEXTAUTH_URL).origin
          return origin !== "'self'" ? ` ${origin}` : ''
        } catch {
          return ''
        }
      })()
    : ''

  return [
    "default-src 'self'",
    scriptSrc,
    // style-src 'unsafe-inline' is required because Tailwind v4 injects styles
    // at runtime via inline <style> tags and class-based utilities that generate
    // inline style attributes. Removing 'unsafe-inline' would break all
    // Tailwind-generated styles. A nonce or hash approach is not viable here
    // because Tailwind does not support CSP nonces for its generated styles.
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: ${imgSrcHosts}`,
    "font-src 'self'",
    `connect-src 'self'${connectSrcHosts}${analyticsConnectSrc.length ? ' ' + analyticsConnectSrc.join(' ') : ''}`,
    // frame-ancestors 'self' supersedes X-Frame-Options in modern browsers;
    // both are kept for backwards compatibility with older clients.
    "frame-ancestors 'self'",
  ].join('; ')
}

export default auth((req) => {
  // Use 128 bits of cryptographic randomness for the nonce.
  const nonce = Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('base64')
  const csp = buildCsp(nonce)

  const { pathname } = req.nextUrl
  const isGuestOnlyAuth = GUEST_ONLY_ROUTES.some((route) => pathname.startsWith(route))
  const isProtected = pathname.startsWith('/studio') || pathname.startsWith('/admin')

  const requestHeaders = new Headers(req.headers)
  requestHeaders.set(PATHNAME_HEADER, pathname)
  requestHeaders.set(NONCE_HEADER, nonce)
  requestHeaders.set('Content-Security-Policy', csp)

  // Redirect logged-in users away from sign-in/sign-up
  if (isGuestOnlyAuth) {
    if (req.auth?.user) {
      return NextResponse.redirect(new URL('/me', req.nextUrl.origin))
    }
    const response = NextResponse.next({ request: { headers: requestHeaders } })
    response.headers.set('Content-Security-Policy', csp)
    return response
  }

  if (!isProtected) {
    const response = NextResponse.next({ request: { headers: requestHeaders } })
    response.headers.set('Content-Security-Policy', csp)
    return response
  }

  if (pathname === '/admin/forbidden') {
    const response = NextResponse.next({ request: { headers: requestHeaders } })
    response.headers.set('Content-Security-Policy', csp)
    return response
  }

  if (!req.auth?.user) {
    const signInUrl = new URL('/api/auth/signin', req.nextUrl.origin)
    signInUrl.searchParams.set('callbackUrl', req.nextUrl.href)
    return NextResponse.redirect(signInUrl)
  }

  if (pathname.startsWith('/admin') && req.auth.user.role !== 'ADMIN') {
    requestHeaders.set(PATHNAME_HEADER, '/admin/forbidden')
    const response = NextResponse.rewrite(new URL('/admin/forbidden', req.nextUrl.origin), {
      request: { headers: requestHeaders },
    })
    response.headers.set('Content-Security-Policy', csp)
    return response
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set('Content-Security-Policy', csp)
  return response
})

export const config = {
  matcher: [
    {
      // Run on all page routes; skip Next.js internals, static files, and API
      // routes.  API handlers (including /api/auth/[...nextauth]) return JSON
      // and do not need nonce injection or static-asset CSP headers.
      // Rate limiting for API endpoints is handled inside each route handler.
      source:
        '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
      missing: [{ type: 'header', key: 'next-fetch-dest', value: 'image' }],
    },
  ],
}
