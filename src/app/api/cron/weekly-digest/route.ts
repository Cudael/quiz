import { NextResponse } from 'next/server'
import { prisma } from '@/server/prisma'
import { isAuthorizedCronRequest } from '@/server/cron-auth'
import { sendWeeklyDigestEmail, type WeeklyDigestQuiz } from '@/server/email'
import { parseUserPreferences } from '@/lib/preferences'
import { absoluteUrl } from '@/lib/site'
import { getQuizPath } from '@/lib/quiz-url'

export const dynamic = 'force-dynamic'

const WEEK_MS = 7 * 24 * 60 * 60 * 1000
const MAX_RECIPIENTS_PER_RUN = 500

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cutoff = new Date(Date.now() - WEEK_MS)

  // Trending quizzes this week (shared across all recipients)
  const trendingGroups = await prisma.playSession.groupBy({
    by: ['quizId'],
    where: { createdAt: { gte: cutoff }, mode: { not: 'PRACTICE' } },
    _count: { quizId: true },
    orderBy: { _count: { quizId: 'desc' } },
    take: 5,
  })
  const trendingQuizRecords = await prisma.quiz.findMany({
    where: { id: { in: trendingGroups.map((g) => g.quizId) }, isPublished: true },
    select: {
      id: true,
      title: true,
      slug: true,
      category: { select: { name: true } },
    },
  })
  const playsByQuizId = new Map(trendingGroups.map((g) => [g.quizId, g._count.quizId]))
  const trendingQuizzes: WeeklyDigestQuiz[] = trendingQuizRecords
    .map((quiz) => ({
      title: quiz.title,
      url: absoluteUrl(getQuizPath(quiz)),
      categoryName: quiz.category.name,
      playsThisWeek: playsByQuizId.get(quiz.id) ?? 0,
    }))
    .sort((a, b) => b.playsThisWeek - a.playsThisWeek)

  if (trendingQuizzes.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, skipped: 0, reason: 'no trending quizzes' })
  }

  // Recipients: verified accounts that haven't opted out
  const users = await prisma.user.findMany({
    where: { email: { not: null }, emailVerified: { not: null } },
    select: {
      id: true,
      email: true,
      username: true,
      streakDays: true,
      preferences: true,
    },
    orderBy: { createdAt: 'asc' },
    take: MAX_RECIPIENTS_PER_RUN,
  })
  const recipients = users.filter(
    (user) => parseUserPreferences(user.preferences).weeklyDigest !== false
  )

  // Per-user weekly stats in one grouped query
  const statGroups = await prisma.playSession.groupBy({
    by: ['userId'],
    where: {
      userId: { in: recipients.map((user) => user.id) },
      createdAt: { gte: cutoff },
      mode: { not: 'PRACTICE' },
    },
    _count: { userId: true },
    _max: { score: true },
  })
  const statsByUserId = new Map(
    statGroups.map((group) => [
      group.userId,
      { plays: group._count.userId, bestScore: group._max.score },
    ])
  )

  const settingsUrl = absoluteUrl('/profile/settings')
  let sent = 0
  let skipped = 0

  for (const user of recipients) {
    if (!user.email) continue
    const stats = statsByUserId.get(user.id)
    const ok = await sendWeeklyDigestEmail(user.email, {
      name: user.username,
      playsThisWeek: stats?.plays ?? 0,
      bestScoreThisWeek: stats?.bestScore ?? null,
      streakDays: user.streakDays,
      trendingQuizzes,
      settingsUrl,
    })
    if (ok) {
      sent += 1
    } else {
      skipped += 1
    }
  }

  return NextResponse.json({
    ok: true,
    sent,
    skipped,
    optedOut: users.length - recipients.length,
    trending: trendingQuizzes.length,
  })
}
