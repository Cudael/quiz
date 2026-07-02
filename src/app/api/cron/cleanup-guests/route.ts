import { NextResponse } from 'next/server'
import { prisma } from '@/server/prisma'
import { isAuthorizedCronRequest } from '@/server/cron-auth'

const GUEST_RETENTION_DAYS = 30
const MAX_GUEST_USERS_PER_RUN = 200
const MAX_GUEST_PLAY_SESSIONS_PER_RUN = 2000
const MAX_GUEST_DUEL_PARTICIPANTS_PER_RUN = 2000

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cutoff = new Date(Date.now() - GUEST_RETENTION_DAYS * 24 * 60 * 60 * 1000)

  const guestUsers = await prisma.user.findMany({
    where: {
      email: null,
      role: 'USER',
      createdAt: { lt: cutoff },
      quizzes: { none: {} },
      categories: { none: {} },
    },
    select: { id: true },
    take: MAX_GUEST_USERS_PER_RUN,
    orderBy: { createdAt: 'asc' },
  })

  const guestPlaySessions = await prisma.playSession.findMany({
    where: {
      userId: null,
      createdAt: { lt: cutoff },
    },
    select: { id: true },
    take: MAX_GUEST_PLAY_SESSIONS_PER_RUN,
    orderBy: { createdAt: 'asc' },
  })

  const guestDuelParticipants = await prisma.duelParticipant.findMany({
    where: {
      userId: null,
      joinedAt: { lt: cutoff },
    },
    select: { id: true },
    take: MAX_GUEST_DUEL_PARTICIPANTS_PER_RUN,
    orderBy: { joinedAt: 'asc' },
  })

  const guestUserIds = guestUsers.map((user) => user.id)
  const guestPlaySessionIds = guestPlaySessions.map((session) => session.id)
  const guestDuelParticipantIds = guestDuelParticipants.map((participant) => participant.id)

  const [deletedUsers, deletedPlaySessions, deletedDuelParticipants] = await prisma.$transaction([
    prisma.user.deleteMany({
      where: {
        id: { in: guestUserIds },
        email: null,
      },
    }),
    prisma.playSession.deleteMany({
      where: {
        id: { in: guestPlaySessionIds },
        userId: null,
      },
    }),
    prisma.duelParticipant.deleteMany({
      where: {
        id: { in: guestDuelParticipantIds },
        userId: null,
      },
    }),
  ])

  return NextResponse.json({
    ok: true,
    retentionDays: GUEST_RETENTION_DAYS,
    cutoff: cutoff.toISOString(),
    deleted: {
      users: deletedUsers.count,
      playSessions: deletedPlaySessions.count,
      duelParticipants: deletedDuelParticipants.count,
    },
  })
}
