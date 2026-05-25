import { NextResponse } from 'next/server'
import { handlers } from '@/server/auth'
import { checkRateLimit, getClientIp } from '@/server/rate-limit'

export const GET = handlers.GET

export async function POST(request: Request, ...args: unknown[]) {
  // Only rate-limit credential sign-in attempts (path contains /signin/).
  // Token refreshes, signout, and OAuth callbacks are not rate-limited.
  const { pathname } = new URL(request.url)
  if (pathname.includes('/signin/')) {
    if (
      !checkRateLimit(`nextauth-signin:${getClientIp(request)}`, {
        limit: 10,
        windowMs: 15 * 60 * 1000,
      })
    ) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }
  }
  return (handlers.POST as (...a: unknown[]) => Promise<Response>)(request, ...args)
}
