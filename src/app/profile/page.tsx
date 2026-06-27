import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Award, BarChart3, Flame, PenLine, Play, Share2, Zap } from 'lucide-react'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'
import { LevelProgress } from '@/components/ui/level-progress'
import { StreakFlame } from '@/components/ui/streak-flame'
import { Button } from '@/components/ui/button'
import { xpProgress, xpForLevel, xpForNextLevel } from '@/domain/leveling'
import { getBadgeEmoji } from '@/lib/badge-display'

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/sign-in?callbackUrl=/profile')
  }

  const [user, authoredCount, totalBadges] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        badges: {
          include: { badge: true },
          orderBy: { awardedAt: 'desc' },
          take: 6,
        },
        sessions: {
          orderBy: { createdAt: 'desc' },
          take: 8,
          include: { quiz: { select: { id: true, title: true } } },
        },
      },
    }),
    prisma.quiz.count({ where: { authorId: session.user.id } }),
    prisma.badge.count(),
  ])

  if (!user?.username) {
    redirect('/sign-in?callbackUrl=/profile')
  }

  const progress = xpProgress(user.xp)
  const nextLevelXp = xpForNextLevel(progress.level)
  const currentLevelXp = xpForLevel(progress.level)
  const xpNeeded = nextLevelXp - currentLevelXp
  const xpInto = user.xp - currentLevelXp

  const [stats, accuracyAgg] = await Promise.all([
    prisma.playSession.aggregate({
      where: { userId: user.id },
      _count: { _all: true },
      _avg: { score: true },
      _sum: { correctCount: true, totalCount: true },
    }),
    prisma.playSession.aggregate({
      where: { userId: user.id },
      _sum: { correctCount: true, totalCount: true },
    }),
  ])

  const accuracy =
    (accuracyAgg._sum.totalCount ?? 0) > 0
      ? Math.round(
          ((accuracyAgg._sum.correctCount ?? 0) / (accuracyAgg._sum.totalCount ?? 1)) * 100
        )
      : null

  return (
    <div className="space-y-6">
      {/* ── Stats Grid ── */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Level {progress.level}
          </p>
          <div className="mt-1 flex items-center justify-center">
            <LevelProgress xp={user.xp} size="sm" />
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            {xpInto.toLocaleString()} / {xpNeeded.toLocaleString()} XP to next level
          </p>
        </div>

        <StatCard
          icon={<Flame className="h-4 w-4 text-quiz-orange" />}
          label="Streak"
          value={<StreakFlame value={user.streakDays} best={user.bestStreak} size="sm" />}
          sub={
            user.bestStreak > 0
              ? `Best: ${user.bestStreak} day${user.bestStreak > 1 ? 's' : ''}`
              : undefined
          }
        />

        <StatCard
          icon={<Play className="h-4 w-4 text-quiz-green" />}
          label="Quizzes Played"
          value={stats._count._all.toLocaleString()}
          sub={accuracy !== null ? `${accuracy}% accuracy` : undefined}
        />

        <StatCard
          icon={<BarChart3 className="h-4 w-4 text-quiz-purple" />}
          label="Avg Score"
          value={`${Math.round(stats._avg.score ?? 0)}%`}
          sub={
            (stats._sum.correctCount ?? 0) > 0
              ? `${stats._sum.correctCount} correct answers`
              : undefined
          }
        />
      </section>

      {/* ── Quick Actions ── */}
      <section className="grid gap-3 sm:grid-cols-3">
        <Button asChild variant="gradient" size="lg" className="rounded-xl">
          <Link href="/random-quiz" className="inline-flex items-center justify-center">
            <Zap className="mr-2 h-5 w-5 shrink-0" />
            Play Random Quiz
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="rounded-xl">
          <Link href="/studio" className="inline-flex items-center justify-center">
            <PenLine className="mr-2 h-5 w-5 shrink-0" />
            Create a Quiz
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="rounded-xl">
          <Link href={`/u/${user.username}`} className="inline-flex items-center justify-center">
            <Share2 className="mr-2 h-5 w-5 shrink-0" />
            Public Profile
          </Link>
        </Button>
      </section>

      {/* ── Recent Activity ── */}
      <section className="rounded-xl border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Recent Activity</h2>
          {authoredCount > 0 && (
            <span className="text-xs text-muted-foreground">
              {authoredCount} quiz{authoredCount > 1 ? 'es' : ''} created
            </span>
          )}
        </div>
        {user.sessions.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-muted/30 p-8 text-center">
            <Play className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              No sessions yet.{' '}
              <Link href="/categories" className="font-semibold text-primary hover:underline">
                Play your first quiz
              </Link>
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {user.sessions.map((s) => (
              <Link
                key={s.id}
                href={`/quiz/${s.quiz.id}`}
                className="flex items-center justify-between rounded-lg border px-4 py-3 text-sm transition-colors hover:bg-accent/50"
              >
                <p className="truncate font-medium">{s.quiz.title}</p>
                <div className="ml-4 flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                  <span>{s.score} pts</span>
                  <span>
                    {new Intl.DateTimeFormat('en', {
                      month: 'short',
                      day: 'numeric',
                    }).format(s.createdAt)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Badges ── */}
      <section className="rounded-xl border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Badges</h2>
            <p className="text-xs text-muted-foreground">
              {user.badges.length} of {totalBadges} earned
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/profile/badges">
              <Award className="mr-1.5 h-4 w-4" />
              View All
            </Link>
          </Button>
        </div>
        {user.badges.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center">
            <Award className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              No badges yet — keep playing to unlock some!
            </p>
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {user.badges.map((ub) => (
              <div
                key={ub.badgeId}
                className="flex items-center gap-3 rounded-lg border border-quiz-green/20 bg-quiz-green/5 px-4 py-3"
              >
                <span className="text-xl" aria-hidden="true">
                  {getBadgeEmoji(ub.badge.slug)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{ub.badge.name}</p>
                  <p className="text-xs text-muted-foreground">{ub.badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  sub?: string
}) {
  return (
    <div className="flex flex-col justify-between rounded-xl border bg-card p-5">
      <div className="mb-2 flex items-center gap-1.5">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}
