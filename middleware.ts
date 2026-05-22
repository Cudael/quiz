import { NextResponse } from 'next/server'
import { auth } from '@/server/auth'

const PATHNAME_HEADER = 'x-quiz-pathname'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isProtected = pathname.startsWith('/studio') || pathname.startsWith('/admin')
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set(PATHNAME_HEADER, pathname)

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
  matcher: ['/studio/:path*', '/admin/:path*'],
}
