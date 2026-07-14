import { getToken } from 'next-auth/jwt'
import { NextResponse, type NextRequest } from 'next/server'

const PATHNAME_HEADER = 'x-quiz-pathname'
const NONCE_HEADER = 'x-nonce'

const GUEST_ONLY_ROUTES = ['/sign-in', '/sign-up']
const USERNAME_ONBOARDING_ROUTE = '/choose-username'

const r2ImageHost = (() => {
  try {
    return process.env.R2_PUBLIC_URL ? new URL(process.env.R2_PUBLIC_URL).hostname : null
  } catch {
    return null
  }
})()

function buildCsp(nonce: string, allowFraming = false): string {
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
    // Embed routes allow any ancestor so third-party sites can iframe them.
    allowFraming ? 'frame-ancestors *' : "frame-ancestors 'self'",
  ].join('; ')
}

export default async function middleware(req: NextRequest) {
  // Use 128 bits of cryptographic randomness for the nonce.
  const nonce = Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('base64')

  const { pathname } = req.nextUrl
  const csp = buildCsp(nonce, pathname.startsWith('/embed'))
  const isGuestOnlyAuth = GUEST_ONLY_ROUTES.some((route) => pathname.startsWith(route))
  const isProtected = pathname.startsWith('/studio') || pathname.startsWith('/admin')

  // Read-only session check. Deliberately NOT the NextAuth `auth()` wrapper:
  // the wrapper re-signs the session JWT and appends a fresh Set-Cookie to
  // every matched response, which races with (and can undo) the cookie
  // deletion performed by sign-out. `getToken` only decodes — middleware
  // responses never carry session cookies. Sliding session expiry still
  // happens via /api/auth/session reads.
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
    secureCookie:
      req.nextUrl.protocol === 'https:' ||
      req.headers.get('x-forwarded-proto')?.startsWith('https') === true,
  })

  const requestHeaders = new Headers(req.headers)
  requestHeaders.set(PATHNAME_HEADER, pathname)
  requestHeaders.set(NONCE_HEADER, nonce)
  requestHeaders.set('Content-Security-Policy', csp)

  // OAuth accounts intentionally start without a username. Keep onboarding
  // mandatory across the entire page app, not only on profile routes, so an
  // account cannot play, publish, or appear on leaderboards as an anonymous
  // "Player". Preserve the requested relative URL for after the claim.
  if (token && !token.username && pathname !== USERNAME_ONBOARDING_ROUTE) {
    const onboardingUrl = new URL(USERNAME_ONBOARDING_ROUTE, req.nextUrl.origin)
    const requestedUrl = new URL(req.nextUrl.href)
    onboardingUrl.searchParams.set('callbackUrl', `${requestedUrl.pathname}${requestedUrl.search}`)
    return NextResponse.redirect(onboardingUrl)
  }

  // Redirect logged-in users away from sign-in/sign-up
  if (isGuestOnlyAuth) {
    if (token) {
      return NextResponse.redirect(new URL('/profile', req.nextUrl.origin))
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

  if (!token) {
    const signInUrl = new URL('/api/auth/signin', req.nextUrl.origin)
    signInUrl.searchParams.set('callbackUrl', req.nextUrl.href)
    return NextResponse.redirect(signInUrl)
  }

  if (pathname.startsWith('/admin') && token.role !== 'ADMIN') {
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
}

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
