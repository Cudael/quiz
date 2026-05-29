import { NextResponse } from 'next/server'
import { handlers } from '@/server/auth'
import { checkRateLimit, getClientIp } from '@/server/rate-limit'

export const GET = handlers.GET

// Next.js App Router passes a context object as the second argument.
// The exact type varies by Next.js version, so `unknown[]` is used here
// to forward it to the underlying handler without version-specific imports.
export async function POST(request: Request, ...args: unknown[]) {
  // Only rate-limit credential sign-in attempts (path contains /signin/).
  // Token refreshes, signout, and OAuth callbacks are not rate-limited.
  const { pathname } = new URL(request.url)
  if (pathname.includes('/signin/')) {
    if (
      !(await checkRateLimit(`nextauth-signin:${getClientIp(request)}`, {
        limit: 10,
        windowMs: 15 * 60 * 1000,
      }))
    ) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }
  }
  return (handlers.POST as (...a: unknown[]) => Promise<Response>)(request, ...args)
}
