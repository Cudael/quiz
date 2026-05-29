import NextAuth from 'next-auth'
import { authConfig } from '@/server/auth.config'
import { NextResponse } from 'next/server'

const PATHNAME_HEADER = 'x-quiz-pathname'

const GUEST_ONLY_ROUTES = ['/sign-in', '/sign-up']

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isGuestOnlyAuth = GUEST_ONLY_ROUTES.some((route) => pathname.startsWith(route))
  const isProtected = pathname.startsWith('/studio') || pathname.startsWith('/admin')
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set(PATHNAME_HEADER, pathname)

  // Redirect logged-in users away from sign-in/sign-up
  if (isGuestOnlyAuth) {
    if (req.auth?.user) {
      return NextResponse.redirect(new URL('/me', req.nextUrl.origin))
    }
    return NextResponse.next()
  }

  if (!isProtected) {
    return NextResponse.next()
  }

  if (pathname === '/admin/forbidden') {
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  if (!req.auth?.user) {
    const signInUrl = new URL('/api/auth/signin', req.nextUrl.origin)
    signInUrl.searchParams.set('callbackUrl', req.nextUrl.href)
    return NextResponse.redirect(signInUrl)
  }

  if (pathname.startsWith('/admin') && req.auth.user.role !== 'ADMIN') {
    requestHeaders.set(PATHNAME_HEADER, '/admin/forbidden')
    return NextResponse.rewrite(new URL('/admin/forbidden', req.nextUrl.origin), {
      request: { headers: requestHeaders },
    })
  }

  return NextResponse.next({ request: { headers: requestHeaders } })
})

export const config = {
  matcher: ['/sign-in', '/sign-up', '/studio/:path*', '/admin/:path*'],
}
