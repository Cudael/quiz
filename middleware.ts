import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isProtected = pathname.startsWith('/studio') || pathname.startsWith('/admin')

  if (!isProtected) {
    return NextResponse.next()
  }

  if (pathname === '/admin/forbidden') {
    return NextResponse.next()
  }

  if (!req.auth?.user) {
    const signInUrl = new URL('/api/auth/signin', req.nextUrl.origin)
    signInUrl.searchParams.set('callbackUrl', req.nextUrl.href)
    return NextResponse.redirect(signInUrl)
  }

  if (pathname.startsWith('/admin') && req.auth.user.role !== 'ADMIN') {
    return NextResponse.rewrite(new URL('/admin/forbidden', req.nextUrl.origin))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/studio/:path*', '/admin/:path*'],
}
