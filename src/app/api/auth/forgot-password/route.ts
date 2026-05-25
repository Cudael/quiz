import { NextResponse } from 'next/server'
import { randomBytes } from 'node:crypto'
import { z } from 'zod'
import { prisma } from '@/server/prisma'
import { sendPasswordResetEmail } from '@/server/email'
import { checkRateLimit, getClientIp } from '@/server/rate-limit'

const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000 // 1 hour

const forgotPasswordSchema = z.object({
  email: z.email().trim().toLowerCase(),
})

export async function POST(request: Request) {
  if (
    !checkRateLimit(`forgot-password:${getClientIp(request)}`, {
      limit: 5,
      windowMs: 15 * 60 * 1000,
    })
  ) {
    // Still return 200 to avoid leaking rate limit info to attackers
    return NextResponse.json({ ok: true })
  }

  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return NextResponse.json({ ok: true })
  }

  const parsed = forgotPasswordSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json({ ok: true })
  }

  const { email } = parsed.data

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  })

  // Always return 200 regardless of whether the email exists (prevent enumeration)
  if (!user) {
    return NextResponse.json({ ok: true })
  }

  const token = `RESET:${randomBytes(32).toString('hex')}`
  const expires = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS)

  // Delete any existing reset tokens for this email before creating a new one.
  // Filter in application code to avoid relying on database-level string matching.
  const existingTokens = await prisma.verificationToken.findMany({
    where: { identifier: email },
    select: { token: true },
  })
  const resetTokensToDelete = existingTokens
    .filter((t) => t.token.startsWith('RESET:'))
    .map((t) => t.token)
  if (resetTokensToDelete.length > 0) {
    await prisma.verificationToken.deleteMany({
      where: { identifier: email, token: { in: resetTokensToDelete } },
    })
  }

  await prisma.verificationToken.create({
    data: { identifier: email, token, expires },
  })

  const resetUrl = new URL('/reset-password', request.url)
  resetUrl.searchParams.set('token', token)
  await sendPasswordResetEmail(email, resetUrl.toString())

  return NextResponse.json({ ok: true })
}
