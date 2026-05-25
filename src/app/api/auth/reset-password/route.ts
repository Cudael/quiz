import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/server/prisma'
import { hashPassword } from '@/server/password'
import { checkRateLimit, getClientIp } from '@/server/rate-limit'

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z
    .string()
    .min(8)
    .regex(/^(?=.*[A-Z])(?=.*[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~])/, {
      message:
        'Password must contain at least one uppercase letter and one number or special character.',
    }),
})

export async function POST(request: Request) {
  if (
    !checkRateLimit(`reset-password:${getClientIp(request)}`, {
      limit: 5,
      windowMs: 15 * 60 * 1000,
    })
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

  const { token, newPassword } = parsed.data

  if (!token.startsWith('RESET:')) {
    return NextResponse.json({ error: 'Invalid or expired reset link.' }, { status: 400 })
  }

  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
    select: { identifier: true, expires: true, token: true },
  })

  if (!verificationToken) {
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

  const passwordHash = await hashPassword(newPassword)
  await prisma.user.update({
    where: { email: verificationToken.identifier },
    data: { passwordHash },
  })

  await prisma.verificationToken.delete({
    where: {
      identifier_token: {
        identifier: verificationToken.identifier,
        token: verificationToken.token,
      },
    },
  })

  return NextResponse.json({ ok: true })
}
