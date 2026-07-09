import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'
import { checkRateLimit, getClientIp } from '@/server/rate-limit'

const JOIN_RATE_LIMIT = { limit: 20, windowMs: 5 * 60 * 1000 } as const
const GUEST_COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 365

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ip = getClientIp(req)
  if (!(await checkRateLimit(`duel-join:${ip}`, JOIN_RATE_LIMIT))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const session = await auth()
  const { id } = await params

  const duel = await prisma.duel.findUnique({
    where: { id },
    select: {
      id: true,
      code: true,
      status: true,
      maxPlayers: true,
      _count: { select: { participants: true } },
    },
  })
  if (!duel) {
    return NextResponse.json({ error: 'Duel not found' }, { status: 404 })
  }
  if (duel.status !== 'WAITING') {
    return NextResponse.json({ error: 'Duel already started' }, { status: 409 })
  }
  if (duel._count.participants >= duel.maxPlayers) {
    return NextResponse.json({ error: 'Duel lobby is full' }, { status: 409 })
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

  try {
    await prisma.duelParticipant.create({
      data: {
        duelId: duel.id,
        userId: session?.user?.id ?? null,
        guestName: session?.user?.id ? null : 'Guest',
        guestKey: session?.user?.id ? null : guestKey,
      },
    })
  } catch (error) {
    // Unique constraint on (duelId, userId) / (duelId, guestKey) catches the
    // race where two concurrent requests both pass the findFirst check.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Already joined' }, { status: 400 })
    }
    throw error
  }

  const response = NextResponse.json({ duelId: duel.id, code: duel.code })
  // Persist guest identity so the same browser recognizes itself as the
  // participant it just created on subsequent polls/reloads.
  if (!session?.user?.id) {
    response.cookies.set('qa_guest_id', guestKey, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: GUEST_COOKIE_MAX_AGE_SEC,
      path: '/',
    })
  }
  return response
}
