import type { PrismaClient } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/slugify'

type PrismaLike = PrismaClient | typeof prisma

export async function generateUniqueUsername(
  rawName: string,
  client: PrismaLike = prisma
): Promise<string> {
  const base = slugify(rawName) || `player-${Math.random().toString(36).slice(2, 8)}`

  let candidate = base
  let suffix = 1
  while (true) {
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
}
