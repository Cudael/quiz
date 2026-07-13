import 'server-only'
// Imported from @auth/core (which next-auth re-exports) so this module stays
// importable outside a Next.js runtime, e.g. in unit tests.
import { CredentialsSignin } from '@auth/core/errors'
import { z } from 'zod'
import { prisma } from '@/server/prisma'
import { verifyPassword } from '@/server/password'
import { checkRateLimit } from '@/server/rate-limit'

const emailPasswordCredentialsSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1),
})

/**
 * Sign-in failures the client is allowed to distinguish. Wrong passwords and
 * unknown emails stay a plain `null` (generic CredentialsSignin) so accounts
 * cannot be enumerated. `email-not-verified` is only thrown AFTER the password
 * matched — the caller has already proven they own the credentials, so telling
 * them to verify leaks nothing and spares them retrying a correct password.
 */
class SignInRateLimited extends CredentialsSignin {
  code = 'rate-limited'
}

class EmailNotVerified extends CredentialsSignin {
  code = 'email-not-verified'
}

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
 * password guessing. Returns the authenticated user on success, `null` for
 * invalid input, unknown users, or wrong passwords, and throws a coded
 * `CredentialsSignin` for rate-limited attempts and unverified accounts.
 */
export async function authorizeEmailPassword(rawCredentials: unknown) {
  const parsed = emailPasswordCredentialsSchema.safeParse(rawCredentials)
  if (!parsed.success) {
    return null
  }

  // Throttle attempts per account to slow down online password guessing.
  if (!(await checkRateLimit(`login:${parsed.data.email}`, LOGIN_RATE_LIMIT))) {
    throw new SignInRateLimited()
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

  // Email/password accounts must prove ownership before receiving a session.
  // OAuth users are marked verified by the provider sign-in callback instead.
  if (!user.emailVerified) {
    throw new EmailNotVerified()
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    role: user.role,
    emailVerified: user.emailVerified,
  }
}
