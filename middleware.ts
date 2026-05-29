import NextAuth from 'next-auth'
import { authConfig } from '@/server/auth.config'
import { NextResponse } from 'next/server'

const PATHNAME_HEADER = 'x-quiz-pathname'
const NONCE_HEADER = 'x-nonce'

const GUEST_ONLY_ROUTES = ['/sign-in', '/sign-up']

const { auth } = NextAuth(authConfig)

function buildCsp(nonce: string): string {
  const scriptSrc =
    process.env.NODE_ENV === 'production'
      ? `script-src 'self' 'nonce-${nonce}'`
      : `script-src 'self' 'nonce-${nonce}' 'unsafe-eval'`

  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://images.unsplash.com https://avatars.githubusercontent.com https://lh3.googleusercontent.com https://*.public.blob.vercel-storage.com",
    "font-src 'self'",
    "connect-src 'self' https://busquiz.com https://www.busquiz.com",
    "frame-ancestors 'self'",
  ].join('; ')
}

export default auth((req) => {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
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
      // Run on all routes except Next.js internals and static files.
      source: '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
      missing: [
        { type: 'header', key: 'next-fetch-dest', value: 'image' },
      ],
    },
  ],
}
