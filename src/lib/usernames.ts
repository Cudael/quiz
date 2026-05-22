import type { PrismaClient } from '@prisma/client'
import { prisma } from '@/server/prisma'
import { slugify } from '@/lib/slugify'

type PrismaLike = PrismaClient | typeof prisma

export async function generateUniqueUsername(
  rawName: string,
  client: PrismaLike = prisma
): Promise<string> {
  const base = slugify(rawName) || `player-${crypto.randomUUID().slice(0, 8)}`

  let candidate = base
  let suffix = 1
  const MAX_RETRIES = 100

  while (suffix <= MAX_RETRIES) {
    const existing = await client.user.findUnique({
      where: { username: candidate },
      select: { id: true },
    })

    if (!existing) {
      return candidate
    }

    suffix += 1
    candidate = `${base}-${suffix}`
  }

  throw new Error('Unable to generate a unique username after 100 attempts')
}
