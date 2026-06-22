import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Lock, CheckCircle2 } from 'lucide-react'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'
import { getBadgeEmoji } from '@/lib/badge-display'
import type { BadgeCriterion } from '@/domain/badges'

interface BadgeProgressStats {
  wins: number
  hasPerfectScore: boolean
  streakDays: number
  quizzesAuthored: number
  playsCount: number
  avgAnswerMs: number
  playedHours: number[]
  categoryCompletions: Record<string, number>
}

function parseCriterion(criteria: unknown): BadgeCriterion | null {
  if (typeof criteria === 'string') {
    try {
      criteria = JSON.parse(criteria)
    } catch {
      return null
    }
  }

  if (!criteria || typeof criteria !== 'object' || Array.isArray(criteria)) return null
  return criteria as BadgeCriterion
}

function clampProgress(value: number, max: number) {
  return Math.min(100, Math.round((Math.min(value, max) / Math.max(1, max)) * 100))
}

function getBadgeProgress(criteria: unknown, stats: BadgeProgressStats) {
  const criterion = parseCriterion(criteria)
  if (!criterion) return null

  switch (criterion.type) {
    case 'wins':
      return {
        label: `${Math.min(stats.wins, criterion.count)} / ${criterion.count} wins`,
        percent: clampProgress(stats.wins, criterion.count),
      }
    case 'perfectScore':
      return {
        label: stats.hasPerfectScore ? 'Perfect score completed' : 'Get 1 perfect score',
        percent: stats.hasPerfectScore ? 100 : 0,
      }
    case 'streak':
      return {
        label: `${Math.min(stats.streakDays, criterion.days)} / ${criterion.days} streak days`,
        percent: clampProgress(stats.streakDays, criterion.days),
      }
    case 'quizzesAuthored':
      return {
        label: `${Math.min(stats.quizzesAuthored, criterion.count)} / ${criterion.count} published quizzes`,
        percent: clampProgress(stats.quizzesAuthored, criterion.count),
      }
    case 'categoryMaster': {
      const completed = stats.categoryCompletions[criterion.categorySlug] ?? 0
      return {
        label: `${Math.min(completed, criterion.minQuizzes)} / ${criterion.minQuizzes} ${criterion.categorySlug} quizzes`,
        percent: clampProgress(completed, criterion.minQuizzes),
      }
    }
    case 'avgAnswerMs':
      return {
        label:
          stats.playsCount > 0
            ? `Average ${Math.round(stats.avgAnswerMs / 100) / 10}s · target under ${criterion.lt / 1000}s`
            : `Average under ${criterion.lt / 1000}s per answer`,
        percent:
          stats.playsCount > 0 && stats.avgAnswerMs < criterion.lt
            ? 100
            : stats.playsCount > 0
              ? clampProgress(criterion.lt, stats.avgAnswerMs)
              : 0,
      }
    case 'playedBetween':
      return {
        label: `Play between ${String(criterion.fromHour).padStart(2, '0')}:00 and ${String(criterion.toHour).padStart(2, '0')}:00 UTC`,
        percent: stats.playedHours.some((hour) =>
          criterion.fromHour < criterion.toHour
            ? hour >= criterion.fromHour && hour < criterion.toHour
            : hour >= criterion.fromHour || hour < criterion.toHour
        )
          ? 100
          : 0,
      }
    case 'playsCount':
      return {
        label: `${Math.min(stats.playsCount, criterion.count)} / ${criterion.count} quizzes played`,
        percent: clampProgress(stats.playsCount, criterion.count),
      }
    default:
      return null
  }
}

export default async function ProfileBadgesPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/sign-in?callbackUrl=/profile/badges')
  }

  const [user, allBadges, quizzesAuthored] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        streakDays: true,
        badges: {
          include: { badge: true },
          orderBy: { awardedAt: 'desc' },
        },
        sessions: {
          select: {
            correctCount: true,
            totalCount: true,
            timeTakenMs: true,
            createdAt: true,
            quiz: { select: { category: { select: { slug: true } } } },
          },
        },
        _count: { select: { badges: true } },
      },
    }),
    prisma.badge.findMany({
      orderBy: { name: 'asc' },
    }),
    prisma.quiz.count({ where: { authorId: session.user.id, isPublished: true } }),
  ])

  if (!user) {
    redirect('/sign-in')
  }

  const earnedSlugs = new Set(user.badges.map((ub) => ub.badge.slug))
  const earnedBadges = allBadges.filter((b) => earnedSlugs.has(b.slug))
  const lockedBadges = allBadges.filter((b) => !earnedSlugs.has(b.slug))
  const earnedCount = earnedBadges.length
  const totalCount = allBadges.length
  const playsCount = user.sessions.length
  const badgeStats: BadgeProgressStats = {
    wins: user.sessions.filter(
      (playSession) =>
        playSession.totalCount > 0 && playSession.correctCount / playSession.totalCount >= 0.7
    ).length,
    hasPerfectScore: user.sessions.some(
      (playSession) =>
        playSession.totalCount > 0 && playSession.correctCount === playSession.totalCount
    ),
    streakDays: user.streakDays,
    quizzesAuthored,
    playsCount,
    avgAnswerMs:
      playsCount > 0
        ? user.sessions.reduce((sum, playSession) => {
            if (playSession.totalCount <= 0) return sum
            return sum + playSession.timeTakenMs / playSession.totalCount
          }, 0) / playsCount
        : Number.POSITIVE_INFINITY,
    playedHours: user.sessions.map((playSession) => playSession.createdAt.getUTCHours()),
    categoryCompletions: user.sessions.reduce<Record<string, number>>((acc, playSession) => {
      const slug = playSession.quiz.category.slug
      acc[slug] = (acc[slug] ?? 0) + 1
      return acc
    }, {}),
  }

  return (
    <div className="max-w-4xl py-10 md:py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">My Badges</h1>
        <p className="mt-2 text-muted-foreground">
          You&apos;ve earned{' '}
          <span className="font-semibold text-foreground">
            {earnedCount} of {totalCount}
          </span>{' '}
          badges.
          {lockedBadges.length > 0 && ` ${lockedBadges.length} more to go — keep playing!`}
        </p>
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="mb-8">
          <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-quiz-purple to-quiz-purple/70 transition-all"
              style={{ width: `${(earnedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Earned badges */}
      {earnedBadges.length > 0 && (
        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-quiz-green" />
            <h2 className="text-xl font-bold">Earned</h2>
            <span className="text-sm text-muted-foreground">({earnedBadges.length})</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {earnedBadges.map((badge) => {
              const userBadge = user.badges.find((ub) => ub.badge.slug === badge.slug)
              return (
                <div
                  key={badge.id}
                  className="group flex items-start gap-4 rounded-xl border border-quiz-green/30 bg-quiz-green/5 p-4 transition-shadow hover:shadow-md"
                >
                  <span className="text-3xl shrink-0" aria-hidden="true">
                    {getBadgeEmoji(badge.slug)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold">{badge.name}</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground leading-relaxed">
                      {badge.description}
                    </p>
                    {userBadge && (
                      <p className="mt-2 text-xs text-quiz-green font-medium">
                        Earned{' '}
                        {new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(
                          userBadge.awardedAt
                        )}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Locked badges */}
      {lockedBadges.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Lock className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-bold">Still to Earn</h2>
            <span className="text-sm text-muted-foreground">({lockedBadges.length})</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lockedBadges.map((badge) => {
              const progress = getBadgeProgress(badge.criteria, badgeStats)
              return (
                <div
                  key={badge.id}
                  className="flex items-start gap-4 rounded-xl border border-border/40 bg-muted/20 p-4 opacity-70 transition-opacity hover:opacity-100"
                >
                  <span className="text-3xl shrink-0 grayscale" aria-hidden="true">
                    {getBadgeEmoji(badge.slug)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold">{badge.name}</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground leading-relaxed">
                      {badge.description}
                    </p>
                    {progress && (
                      <div className="mt-3 space-y-1.5">
                        <div className="h-1.5 overflow-hidden rounded-full bg-background">
                          <div
                            className="h-full rounded-full bg-quiz-orange"
                            style={{ width: `${progress.percent}%` }}
                          />
                        </div>
                        <p className="text-xs font-medium text-muted-foreground">
                          {progress.label}
                        </p>
                      </div>
                    )}
                    <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                      <Lock className="h-3 w-3" />
                      Locked
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      <div className="mt-12 rounded-xl border bg-muted/30 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Play more quizzes to unlock the rest.{' '}
          <Link href="/categories" className="font-semibold text-primary hover:underline">
            Browse quizzes
          </Link>{' '}
          and keep your streak alive!
        </p>
      </div>
    </div>
  )
}
