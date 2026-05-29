import 'server-only'
import { z } from 'zod'
import { prisma } from '@/server/prisma'
import { generateUniqueUsername } from '@/lib/usernames'
import { checkRateLimit, getClientIp } from '@/server/rate-limit'

const credentialsSchema = z.object({
  name: z.string().trim().min(1).max(80),
})

/**
 * Maximum guest accounts that may be created per IP (or per name when the IP
 * is unavailable) within the rate-limit window.
 */
const GUEST_RATE_LIMIT = { limit: 5, windowMs: 60 * 60 * 1000 } as const

/**
 * Validates guest credentials and creates a new guest user.
 *
 * Account creation is rate-limited per client IP (falling back to the
 * submitted name when no IP header is present) to prevent bulk account
 * creation. Returns `null` when the credentials are invalid or the limit
 * is exceeded.
 */
export async function authorizeGuest(rawCredentials: unknown, request?: Request) {
  const parsed = credentialsSchema.safeParse(rawCredentials)
  if (!parsed.success) {
    return null
  }

  const name = parsed.data.name
  const ip = request ? getClientIp(request) : null
  const rateLimitKey = `guest:${ip && ip !== 'unknown' ? ip : `name:${name}`}`

  if (!(await checkRateLimit(rateLimitKey, GUEST_RATE_LIMIT))) {
    return null
  }

  return prisma.user.create({
    data: {
      name,
      username: await generateUniqueUsername(name),
      email: null,
      role: 'USER',
    },
  })
}
