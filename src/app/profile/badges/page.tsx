import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, Lock, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'

export const metadata: Metadata = {
  title: 'My Badges',
  robots: { index: false },
}

export default async function ProfileBadgesPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/sign-in?callbackUrl=/profile/badges')
  }

  const [user, allBadges] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        badges: {
          include: { badge: true },
          orderBy: { awardedAt: 'desc' },
        },
        _count: { select: { badges: true } },
      },
    }),
    prisma.badge.findMany({
      orderBy: { name: 'asc' },
    }),
  ])

  if (!user) {
    redirect('/sign-in')
  }

  const earnedSlugs = new Set(user.badges.map((ub) => ub.badge.slug))
  const earnedBadges = allBadges.filter((b) => earnedSlugs.has(b.slug))
  const lockedBadges = allBadges.filter((b) => !earnedSlugs.has(b.slug))
  const earnedCount = earnedBadges.length
  const totalCount = allBadges.length

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10 md:py-16">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4 -ml-2">
          <Link href="/profile">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profile
          </Link>
        </Button>
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
                    {badge.icon}
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
            {lockedBadges.map((badge) => (
              <div
                key={badge.id}
                className="flex items-start gap-4 rounded-xl border border-border/40 bg-muted/20 p-4 opacity-70 transition-opacity hover:opacity-100"
              >
                <span className="text-3xl shrink-0 grayscale" aria-hidden="true">
                  {badge.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold">{badge.name}</h3>
                  <p className="mt-0.5 text-sm text-muted-foreground leading-relaxed">
                    {badge.description}
                  </p>
                  <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    Locked
                  </p>
                </div>
              </div>
            ))}
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
