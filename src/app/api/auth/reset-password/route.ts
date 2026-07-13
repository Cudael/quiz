import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/server/prisma'
import { hashPassword } from '@/server/password'
import { checkRateLimit, getClientIp } from '@/server/rate-limit'
import { PASSWORD_REGEX, PASSWORD_REGEX_MESSAGE } from '@/schemas'
import { hashToken } from '@/server/token-hash'

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8).regex(PASSWORD_REGEX, { message: PASSWORD_REGEX_MESSAGE }),
})

export async function POST(request: Request) {
  if (
    !(await checkRateLimit(`reset-password:${getClientIp(request)}`, {
      limit: 5,
      windowMs: 15 * 60 * 1000,
    }))
  ) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }

  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const parsed = resetPasswordSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const { token: rawToken, newPassword } = parsed.data
  const tokenHash = hashToken(rawToken)

  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token: tokenHash },
    select: { identifier: true, expires: true, token: true },
  })

  if (!verificationToken || !verificationToken.identifier.startsWith('reset:')) {
    return NextResponse.json({ error: 'Invalid or expired reset link.' }, { status: 400 })
  }

  if (verificationToken.expires < new Date()) {
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: verificationToken.identifier,
          token: verificationToken.token,
        },
      },
    })
    return NextResponse.json(
      { error: 'Reset link has expired. Please request a new one.' },
      { status: 400 }
    )
  }

  // Extract email from the "reset:<email>" identifier
  const email = verificationToken.identifier.slice('reset:'.length)

  const passwordHash = await hashPassword(newPassword)

  // Update the password and consume the token atomically. If a concurrent
  // request already consumed the token, the delete fails and the password
  // update is rolled back — the token can only be used once.
  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { email },
        data: { passwordHash },
      }),
      // Completing a reset requires clicking a link sent to this mailbox —
      // the same ownership proof email verification asks for. Without this,
      // an unverified user who resets their password still cannot sign in.
      prisma.user.updateMany({
        where: { email, emailVerified: null },
        data: { emailVerified: new Date() },
      }),
      prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: verificationToken.identifier,
            token: verificationToken.token,
          },
        },
      }),
    ])
  } catch {
    return NextResponse.json({ error: 'Invalid or expired reset link.' }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
