import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { DEFAULT_GUEST_NAME } from '@/domain/quiz-constants'
import { joinDuelSchema } from '@/schemas'
import { prisma } from '@/server/prisma'

export async function POST(req: NextRequest) {
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
      guestName: session?.user?.id ? null : DEFAULT_GUEST_NAME,
      guestKey: session?.user?.id ? null : guestKey,
    },
  })

  const response = NextResponse.json({ duelId: duel.id, code: duel.code })
  if (!cookieStore.get('qa_guest_id')?.value) {
    response.cookies.set('qa_guest_id', guestKey, {
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    })
  }
  return response
}
