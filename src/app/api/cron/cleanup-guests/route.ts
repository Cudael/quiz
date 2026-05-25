import { NextResponse } from 'next/server'
import { prisma } from '@/server/prisma'

const GUEST_MAX_AGE_DAYS = 30

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: 'Cron secret not configured.' }, { status: 500 })
  }

  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const cutoff = new Date(Date.now() - GUEST_MAX_AGE_DAYS * 24 * 60 * 60 * 1000)

  // Guest accounts are identified by a null email — this is the established
  // convention in this codebase (see auth.ts). Persistent accounts always have
  // a non-null email set at registration or via OAuth.
  const { count } = await prisma.user.deleteMany({
    where: {
      email: null,
      createdAt: { lt: cutoff },
    },
  })

  return NextResponse.json({ deleted: count })
}
