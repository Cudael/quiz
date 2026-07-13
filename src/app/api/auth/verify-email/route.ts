import { NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyEmailCode } from '@/server/email-verification'

const verifySchema = z.object({
  email: z.email().trim().toLowerCase(),
  code: z.string().regex(/^\d{6}$/),
})

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const parsed = verifySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Enter the 6-digit code from your email.' }, { status: 400 })
  }

  const result = await verifyEmailCode(parsed.data.email, parsed.data.code)

  switch (result) {
    case 'verified':
      return NextResponse.json({ ok: true })
    case 'expired':
      return NextResponse.json(
        { error: 'That code has expired. Request a new one below.' },
        { status: 400 }
      )
    case 'rate-limited':
      return NextResponse.json(
        { error: 'Too many attempts. Wait a few minutes, then request a new code.' },
        { status: 429 }
      )
    default:
      return NextResponse.json(
        { error: 'Incorrect code. Check the email and try again.' },
        { status: 400 }
      )
  }
}

/**
 * Verification switched from emailed links to emailed codes. Links from
 * emails sent before the switch land here — send them to the code form.
 */
export function GET(request: Request) {
  return NextResponse.redirect(new URL('/verify-email', request.url))
}
