import { Prisma } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { generateDuelCode } from '@/server/duel'
import { prisma } from '@/server/prisma'
import { checkRateLimit, getClientIp } from '@/server/rate-limit'

const MAX_CODE_GENERATION_ATTEMPTS = 12
const REMATCH_RATE_LIMIT = { limit: 10, windowMs: 5 * 60 * 1000 } as const

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ip = getClientIp(req)
  if (!(await checkRateLimit(`duel-rematch:${ip}`, REMATCH_RATE_LIMIT))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const duel = await prisma.duel.findUnique({
    where: { id },
    include: {
      participants: { select: { userId: true } },
    },
  })
  if (!duel) {
    return NextResponse.json({ error: 'Duel not found' }, { status: 404 })
  }
  if (duel.status !== 'FINISHED') {
    return NextResponse.json({ error: 'Duel is not finished yet' }, { status: 409 })
  }

  const isParticipant = duel.participants.some((entry) => entry.userId === session.user.id)
  if (!isParticipant) {
    return NextResponse.json({ error: 'Only participants can request a rematch' }, { status: 403 })
  }

  const requesterName = session.user.username ?? 'A player'
  const opponentIds = duel.participants
    .map((entry) => entry.userId)
    .filter((userId): userId is string => Boolean(userId) && userId !== session.user.id)

  for (let attempt = 0; attempt < MAX_CODE_GENERATION_ATTEMPTS; attempt++) {
    const code = generateDuelCode()
    try {
      const rematch = await prisma.duel.create({
        data: {
          code,
          hostId: session.user.id,
          categoryId: duel.categoryId,
          questionCount: duel.questionCount,
          timeLimitSec: duel.timeLimitSec,
          maxPlayers: duel.maxPlayers,
          rematchOfId: duel.id,
          participants: {
            create: {
              userId: session.user.id,
              guestName: null,
              guestKey: null,
            },
          },
        },
        select: { id: true, code: true },
      })

      if (opponentIds.length > 0) {
        await prisma.notification.createMany({
          data: opponentIds.map((userId) => ({
            userId,
            type: 'DUEL_REMATCH' as const,
            title: 'Rematch challenge!',
            message: `${requesterName} wants a rematch. Jump back in!`,
            meta: { duelId: rematch.id, code: rematch.code },
          })),
        })
      }

      return NextResponse.json({ duelId: rematch.id, code: rematch.code }, { status: 201 })
    } catch (error) {
      const isCodeCollision =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002' &&
        ((Array.isArray(error.meta?.target) && error.meta.target.includes('code')) ||
          error.meta?.target === 'code')

      if (!isCodeCollision) {
        throw error
      }
    }
  }

  return NextResponse.json({ error: 'Could not generate duel code' }, { status: 503 })
}
