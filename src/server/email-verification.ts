import 'server-only'
import { randomBytes } from 'node:crypto'
import { prisma } from '@/server/prisma'
import { absoluteUrl } from '@/lib/site'
import { hashToken } from '@/server/token-hash'
import { sendVerificationEmail, type EmailDeliveryResult } from '@/server/email'

const VERIFICATION_TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000

/** Replaces prior tokens and sends one fresh, 24-hour verification link. */
export async function issueEmailVerification(email: string): Promise<EmailDeliveryResult> {
  const rawToken = randomBytes(32).toString('hex')

  await prisma.$transaction([
    prisma.verificationToken.deleteMany({ where: { identifier: email } }),
    prisma.verificationToken.create({
      data: {
        identifier: email,
        token: hashToken(rawToken),
        expires: new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY_MS),
      },
    }),
  ])

  const verifyUrl = new URL(absoluteUrl('/api/auth/verify-email'))
  verifyUrl.searchParams.set('token', rawToken)
  return sendVerificationEmail(email, verifyUrl.toString())
}
