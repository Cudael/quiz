import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ShareProfileButton } from './share-profile-button'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'
import { Avatar } from '@/components/ui/avatar'
import { LevelProgress } from '@/components/ui/level-progress'
import { StreakFlame } from '@/components/ui/streak-flame'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'My Profile',
  robots: { index: false },
}

export default async function MePage() {
  const session = await auth()
  const signInPath = '/sign-in?callbackUrl=/me'

  if (!session?.user?.id) {
    redirect(signInPath)
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      badges: {
        include: { badge: true },
        orderBy: { awardedAt: 'desc' },
        take: 12,
      },
      sessions: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { quiz: { select: { id: true, title: true } } },
      },
    },
  })

  if (!user?.username) {
    redirect(signInPath)
  }

  const stats = await prisma.playSession.aggregate({
    where: { userId: user.id },
    _count: { _all: true },
    _avg: { score: true },
    _sum: { correctCount: true },
  })

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <section className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar src={user.image} fallback={user.name} size="xl" />
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
              <p className="text-xs text-muted-foreground">
                Member since{' '}
                {new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(user.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ShareProfileButton username={user.username} />
            <Button variant="outline" asChild>
              <Link href="/me/settings">Settings</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">XP</p>
          <p className="text-2xl font-bold">{user.xp}</p>
          <div className="mt-2">
            <LevelProgress xp={user.xp} size="sm" />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Current streak</p>
          <StreakFlame value={user.streakDays} best={user.bestStreak} size="sm" />
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Quizzes played</p>
          <p className="text-2xl font-bold">{stats._count._all}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Average score</p>
          <p className="text-2xl font-bold">{Math.round(stats._avg.score ?? 0)}</p>
          <p className="text-xs text-muted-foreground">
            Total correct: {stats._sum.correctCount ?? 0}
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent activity</h2>
        </div>
        <div className="space-y-2">
          {user.sessions.map((sessionRow) => (
            <div key={sessionRow.id} className="rounded-lg border border-border p-3 text-sm">
              <p className="font-medium">{sessionRow.quiz.title}</p>
              <p className="text-xs text-muted-foreground">
                {sessionRow.score} pts •{' '}
                {new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(
                  sessionRow.createdAt
                )}
              </p>
            </div>
          ))}
          {user.sessions.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No sessions yet. Play a quiz to get started.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Earned badges</h2>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/u/${user.username}`}>View public profile</Link>
          </Button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {user.badges.map((userBadge) => (
            <div key={userBadge.badgeId} className="rounded-lg border border-border p-3 text-sm">
              <p className="font-medium">
                <span aria-hidden="true">{userBadge.badge.icon} </span>
                {userBadge.badge.name}
              </p>
              <p className="text-xs text-muted-foreground">{userBadge.badge.description}</p>
            </div>
          ))}
          {user.badges.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No badges yet — keep playing to unlock some.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
