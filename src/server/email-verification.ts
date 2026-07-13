import 'server-only'
import { randomInt, timingSafeEqual } from 'node:crypto'
import { prisma } from '@/server/prisma'
import { hashVerificationCode } from '@/server/token-hash'
import { checkRateLimit } from '@/server/rate-limit'
import { sendVerificationEmail, type EmailDeliveryResult } from '@/server/email'

/** Codes are short-lived: 10^6 possibilities must not be guessable at leisure. */
const VERIFICATION_CODE_EXPIRY_MS = 15 * 60 * 1000

/** Wrong-code attempts allowed per email before verification is locked out. */
const CODE_ATTEMPT_LIMIT = { limit: 5, windowMs: 15 * 60 * 1000 } as const

/** Replaces prior codes and emails one fresh 6-digit verification code. */
export async function issueEmailVerification(email: string): Promise<EmailDeliveryResult> {
  const code = randomInt(0, 1_000_000).toString().padStart(6, '0')

  await prisma.$transaction([
    prisma.verificationToken.deleteMany({ where: { identifier: email } }),
    prisma.verificationToken.create({
      data: {
        identifier: email,
        token: hashVerificationCode(email, code),
        expires: new Date(Date.now() + VERIFICATION_CODE_EXPIRY_MS),
      },
    }),
  ])

  return sendVerificationEmail(email, code)
}

export type VerifyEmailCodeResult = 'verified' | 'invalid' | 'expired' | 'rate-limited'

/**
 * Checks a submitted verification code and, when it matches, marks the user's
 * email as verified and consumes the code.
 *
 * Attempts are rate-limited per email so a 6-digit code cannot be enumerated.
 * Expiry is only revealed for a correct code, so probing with arbitrary codes
 * cannot detect whether an address has a pending registration.
 */
export async function verifyEmailCode(email: string, code: string): Promise<VerifyEmailCodeResult> {
  if (!(await checkRateLimit(`verify-code:${email}`, CODE_ATTEMPT_LIMIT))) {
    return 'rate-limited'
  }

  const stored = await prisma.verificationToken.findFirst({
    where: { identifier: email },
    select: { token: true, expires: true },
  })
  if (!stored) {
    return 'invalid'
  }

  const expected = Buffer.from(stored.token, 'hex')
  const given = Buffer.from(hashVerificationCode(email, code), 'hex')
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
    return 'invalid'
  }

  if (stored.expires < new Date()) {
    await prisma.verificationToken.deleteMany({ where: { identifier: email } })
    return 'expired'
  }

  // Consume the code and verify the account atomically. `updateMany` doubles
  // as the existence check: a deleted account (or an already-verified one)
  // updates zero rows and must not report success.
  const [updated] = await prisma.$transaction([
    prisma.user.updateMany({
      where: { email, emailVerified: null },
      data: { emailVerified: new Date() },
    }),
    prisma.verificationToken.deleteMany({ where: { identifier: email } }),
  ])

  return updated.count > 0 ? 'verified' : 'invalid'
}
