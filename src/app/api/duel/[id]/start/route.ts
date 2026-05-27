import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const duel = await prisma.duel.findUnique({
    where: { id },
    include: { participants: { select: { id: true } } },
  })
  if (!duel) {
    return NextResponse.json({ error: 'Duel not found' }, { status: 404 })
  }

  if (duel.hostId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (duel.status !== 'WAITING') {
    return NextResponse.json({ error: 'Duel already started' }, { status: 409 })
  }

  if (duel.participants.length < 2) {
    return NextResponse.json({ error: 'At least 2 participants are required' }, { status: 400 })
  }

  await prisma.$transaction([
    prisma.duel.update({
      where: { id: duel.id },
      data: {
        status: 'IN_PROGRESS',
        finishedAt: null,
      },
    }),
    prisma.duelParticipant.updateMany({
      where: { duelId: duel.id },
      data: { score: 0, correctCount: 0, finished: false, finishedAt: null },
    }),
  ])

  return NextResponse.json({ ok: true })
}
