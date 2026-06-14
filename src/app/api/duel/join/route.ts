import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { joinDuelSchema } from '@/schemas'
import { prisma } from '@/server/prisma'
import { checkRateLimit, getClientIp } from '@/server/rate-limit'

const JOIN_RATE_LIMIT = { limit: 20, windowMs: 5 * 60 * 1000 } as const

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!(await checkRateLimit(`duel-join:${ip}`, JOIN_RATE_LIMIT))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const session = await auth()

  let rawBody: unknown
  try {
    rawBody = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = joinDuelSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const duel = await prisma.duel.findUnique({
    where: { code: parsed.data.code },
    select: { id: true, code: true, status: true },
  })
  if (!duel) {
    return NextResponse.json({ error: 'Duel not found' }, { status: 404 })
  }
  if (duel.status !== 'WAITING') {
    return NextResponse.json({ error: 'Duel already started' }, { status: 409 })
  }

  const cookieStore = await cookies()
  let guestKey = cookieStore.get('qa_guest_id')?.value
  if (!guestKey) {
    guestKey = crypto.randomUUID()
  }

  const existing = await prisma.duelParticipant.findFirst({
    where: {
      duelId: duel.id,
      ...(session?.user?.id ? { userId: session.user.id } : { guestKey }),
    },
    select: { id: true },
  })
  if (existing) {
    return NextResponse.json({ error: 'Already joined' }, { status: 400 })
  }

  await prisma.duelParticipant.create({
    data: {
      duelId: duel.id,
      userId: session?.user?.id ?? null,
      guestName: session?.user?.id ? null : 'Guest',
      guestKey: session?.user?.id ? null : guestKey,
    },
  })

  const response = NextResponse.json({ duelId: duel.id, code: duel.code })
  return response
}
