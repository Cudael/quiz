import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/server/prisma'
import { issueEmailVerification } from '@/server/email-verification'
import { isEmailDeliveryConfigured } from '@/server/email'
import { checkRateLimit, getClientIp } from '@/server/rate-limit'

const requestSchema = z.object({ email: z.email().trim().toLowerCase() })
const RESEND_LIMIT = { limit: 3, windowMs: 60 * 60 * 1000 } as const
/**
 * Per-recipient cap that ignores the caller's IP. Each resend invalidates the
 * pending code, so without this a third party rotating IPs could both spam a
 * mailbox and keep killing the code its owner is about to enter.
 */
const RECIPIENT_LIMIT = { limit: 5, windowMs: 24 * 60 * 60 * 1000 } as const

export async function POST(request: Request) {
  if (!isEmailDeliveryConfigured()) {
    return NextResponse.json(
      { error: 'Verification email is temporarily unavailable. Please contact support.' },
      { status: 503 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
  }

  const email = parsed.data.email
  const allowed =
    (await checkRateLimit(`verify-resend:${getClientIp(request)}:${email}`, RESEND_LIMIT)) &&
    (await checkRateLimit(`verify-resend-recipient:${email}`, RECIPIENT_LIMIT))
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many verification emails requested. Please try again later.' },
      { status: 429 }
    )
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { emailVerified: true },
  })

  // Keep the response generic so this endpoint cannot enumerate registered users.
  if (user && !user.emailVerified) {
    const delivery = await issueEmailVerification(email)
    if (delivery !== 'sent') {
      return NextResponse.json(
        { error: 'Verification email could not be sent. Please try again later.' },
        { status: 503 }
      )
    }
  }

  return NextResponse.json({ ok: true })
}
