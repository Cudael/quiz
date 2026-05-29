import 'server-only'
import { z } from 'zod'
import { prisma } from '@/server/prisma'
import { verifyPassword } from '@/server/password'
import { checkRateLimit } from '@/server/rate-limit'

const emailPasswordCredentialsSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1),
})

/**
 * Maximum email/password sign-in attempts allowed per email within the window.
 * This throttles online password-guessing (brute-force) attacks targeting a
 * specific account, complementing the IP-based throttle on the sign-in route.
 */
const LOGIN_RATE_LIMIT = { limit: 5, windowMs: 15 * 60 * 1000 } as const

/**
 * Validates email/password credentials for the `email-password` provider.
 *
 * Attempts are rate-limited per submitted email to mitigate brute-force
 * password guessing. Returns the authenticated user on success, or `null`
 * for invalid input, unknown users, wrong passwords, or rate-limited attempts.
 */
export async function authorizeEmailPassword(rawCredentials: unknown) {
  const parsed = emailPasswordCredentialsSchema.safeParse(rawCredentials)
  if (!parsed.success) {
    return null
  }

  // Throttle attempts per account to slow down online password guessing.
  if (!(await checkRateLimit(`login:${parsed.data.email}`, LOGIN_RATE_LIMIT))) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      emailVerified: true,
      passwordHash: true,
    },
  })

  if (!user?.passwordHash) {
    return null
  }

  const isValid = await verifyPassword(parsed.data.password, user.passwordHash)
  if (!isValid) {
    return null
  }

  // Allow sign-in regardless of email verification status.
  // Email verification is only required for creating quizzes (enforced in studio actions).
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    role: user.role,
    emailVerified: user.emailVerified,
  }
}
