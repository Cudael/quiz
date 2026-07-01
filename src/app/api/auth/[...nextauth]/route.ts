import { NextResponse } from 'next/server'
import { handlers } from '@/server/auth'
import { checkRateLimit, getClientIp } from '@/server/rate-limit'

export const GET = handlers.GET

// Next.js App Router passes a context object as the second argument.
// The exact type varies by Next.js version, so `unknown[]` is used here
// to forward it to the underlying handler without version-specific imports.
export async function POST(request: Request, ...args: unknown[]) {
  // Only rate-limit credential sign-in attempts.
  // Credential auth in NextAuth can hit either signin or callback routes.
  const { pathname } = new URL(request.url)
  const isCredentialsSignIn = /\/(signin|callback)\/email-password$/.test(pathname)
  if (isCredentialsSignIn) {
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
