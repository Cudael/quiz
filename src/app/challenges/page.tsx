import type { Metadata } from 'next'
import Link from 'next/link'
import { Flame, Calendar, Trophy, Swords, Star, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { prisma } from '@/server/prisma'
import { absoluteUrl } from '@/lib/site'
import { auth } from '@/server/auth'

export const metadata: Metadata = {
  title: 'Quiz Challenges | BusQuiz',
  description:
    'Daily, weekly, and monthly quiz challenges. Keep your streak alive and climb the leaderboard.',
  alternates: { canonical: '/challenges' },
  openGraph: {
    title: 'Quiz Challenges | BusQuiz',
    description: 'Take on daily, weekly, and monthly quiz challenges.',
    url: absoluteUrl('/challenges'),
  },
}

export default async function ChallengesPage() {
  const session = await auth()
  const userId = session?.user?.id ?? null

  // Get high-difficulty quizzes for weekly challenge
  const hardQuizzes = await prisma.quiz.findMany({
    where: { isPublished: true, difficulty: 'HARD' },
    orderBy: [{ playCount: 'desc' }],
    take: 3,
    select: {
      id: true,
      title: true,
      coverImage: true,
      difficulty: true,
      playCount: true,
      avgScore: true,
      author: { select: { name: true, role: true } },
      category: { select: { slug: true, name: true, icon: true, color: true } },
      _count: { select: { ratings: true } },
    },
  })

  // Get newest quizzes for monthly challenge
  const newestQuizzes = await prisma.quiz.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
    take: 3,
    select: {
      id: true,
      title: true,
      coverImage: true,
      difficulty: true,
      playCount: true,
      avgScore: true,
      author: { select: { name: true, role: true } },
      category: { select: { slug: true, name: true, icon: true, color: true } },
      _count: { select: { ratings: true } },
    },
  })

  // Get user's play counts in each challenge window
  let dailyPlayCount = 0
  let weeklyPlayCount = 0
  let monthlyPlayCount = 0
  if (userId) {
    const now = new Date()
    const startOfDay = new Date(now)
    startOfDay.setHours(0, 0, 0, 0)

    const startOfWeek = new Date(now)
    const dayOfWeek = startOfWeek.getDay()
    const daysSinceMonday = (dayOfWeek + 6) % 7
    startOfWeek.setDate(startOfWeek.getDate() - daysSinceMonday)
    startOfWeek.setHours(0, 0, 0, 0)

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    ;[dailyPlayCount, weeklyPlayCount, monthlyPlayCount] = await Promise.all([
      prisma.playSession.count({
        where: { userId, createdAt: { gte: startOfDay } },
      }),
      prisma.playSession.count({
        where: { userId, createdAt: { gte: startOfWeek } },
      }),
      prisma.playSession.count({
        where: { userId, createdAt: { gte: startOfMonth } },
      }),
    ])
  }

  const dailyTarget = 3
  const weeklyTarget = 15
  const monthlyTarget = 50

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10 md:py-16">
      {/* Hero */}
      <div className="mb-10 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-bold text-muted-foreground">
          <Trophy className="h-3.5 w-3.5" />
          Challenges await
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Quiz Challenges</h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Push your limits with daily, weekly, and monthly challenges. Build streaks, earn badges,
          and prove you&apos;re the ultimate quiz champion.
        </p>
      </div>

      {/* Challenge cards */}
      <div className="grid gap-6 lg:grid-cols-3 mb-12">
        {/* Daily Challenge */}
        <div className="group relative flex flex-col overflow-hidden rounded-md border-2 border-quiz-orange/30 bg-gradient-to-b from-quiz-orange/5 to-transparent p-6 transition-all hover:-translate-y-1 hover:border-quiz-orange/50 hover:shadow-lg">
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-quiz-orange/10 blur-2xl transition-transform group-hover:scale-150" />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-quiz-orange/15 px-2.5 py-1 text-xs font-bold text-quiz-orange">
              <Flame className="h-3 w-3" />
              Daily
            </span>
            <h2 className="mt-4 text-xl font-extrabold">Quick Play</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Play {dailyTarget} quizzes today to keep your streak alive. Fast, fun, and perfect for
              your morning routine.
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Today&apos;s progress</span>
                <span>
                  {userId
                    ? `${Math.min(dailyPlayCount, dailyTarget)} / ${dailyTarget}`
                    : `0 / ${dailyTarget}`}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-quiz-orange transition-all"
                  style={{
                    width: `${Math.min(100, (Math.min(dailyPlayCount, dailyTarget) / dailyTarget) * 100)}%`,
                  }}
                />
              </div>
            </div>
            <Button asChild className="mt-5 w-full rounded-md font-bold" variant="gradient">
              <Link href="/random-quiz">
                <Zap className="mr-2 h-4 w-4" />
                Start Playing
              </Link>
            </Button>
          </div>
        </div>

        {/* Weekly Challenge */}
        <div className="group relative flex flex-col overflow-hidden rounded-md border-2 border-quiz-purple/30 bg-gradient-to-b from-quiz-purple/5 to-transparent p-6 transition-all hover:-translate-y-1 hover:border-quiz-purple/50 hover:shadow-lg">
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-quiz-purple/10 blur-2xl transition-transform group-hover:scale-150" />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-quiz-purple/15 px-2.5 py-1 text-xs font-bold text-quiz-purple">
              <Calendar className="h-3 w-3" />
              Weekly
            </span>
            <h2 className="mt-4 text-xl font-extrabold">Hard Mode</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Conquer {weeklyTarget} hard-difficulty quizzes this week. Only the brave need apply.
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-muted-foreground">This week</span>
                <span>
                  {Math.min(weeklyPlayCount, weeklyTarget)} / {weeklyTarget}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-quiz-purple transition-all"
                  style={{
                    width: `${Math.min(100, (Math.min(weeklyPlayCount, weeklyTarget) / weeklyTarget) * 100)}%`,
                  }}
                />
              </div>
            </div>
            {hardQuizzes.length > 0 && (
              <div className="mt-4 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Suggested
                </p>
                {hardQuizzes.slice(0, 2).map((q) => (
                  <Link
                    key={q.id}
                    href={`/play/${q.id}`}
                    className="flex items-center gap-3 rounded-md border border-border/50 bg-card/50 p-2.5 text-sm font-medium transition-colors hover:bg-accent"
                  >
                    <Trophy className="h-4 w-4 shrink-0 text-quiz-purple" />
                    <span className="truncate">{q.title}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Monthly Challenge */}
        <div className="group relative flex flex-col overflow-hidden rounded-md border-2 border-quiz-green/30 bg-gradient-to-b from-quiz-green/5 to-transparent p-6 transition-all hover:-translate-y-1 hover:border-quiz-green/50 hover:shadow-lg">
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-quiz-green/10 blur-2xl transition-transform group-hover:scale-150" />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-quiz-green/15 px-2.5 py-1 text-xs font-bold text-quiz-green">
              <Star className="h-3 w-3" />
              Monthly
            </span>
            <h2 className="mt-4 text-xl font-extrabold">Explorer</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Play {monthlyTarget} quizzes across different categories this month. Become a true
              trivia explorer.
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-muted-foreground">This month</span>
                <span>
                  {Math.min(monthlyPlayCount, monthlyTarget)} / {monthlyTarget}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-quiz-green transition-all"
                  style={{
                    width: `${Math.min(100, (Math.min(monthlyPlayCount, monthlyTarget) / monthlyTarget) * 100)}%`,
                  }}
                />
              </div>
            </div>
            {newestQuizzes.length > 0 && (
              <div className="mt-4 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Try something new
                </p>
                {newestQuizzes.slice(0, 2).map((q) => (
                  <Link
                    key={q.id}
                    href={`/play/${q.id}`}
                    className="flex items-center gap-3 rounded-md border border-border/50 bg-card/50 p-2.5 text-sm font-medium transition-colors hover:bg-accent"
                  >
                    <Star className="h-4 w-4 shrink-0 text-quiz-green" />
                    <span className="truncate">{q.title}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Leaderboard teaser */}
      <div className="rounded-md border border-border/40 bg-card p-6 text-center md:p-8">
        <h2 className="text-xl font-extrabold">Ready to compete?</h2>
        <p className="mt-2 text-muted-foreground">
          Duel other players in real-time, climb the global leaderboard, and earn exclusive badges.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <Button asChild className="rounded-md font-bold" variant="gradient-green">
            <Link href="/duel">
              <Swords className="mr-2 h-4 w-4" />
              Start a Duel
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-md">
            <Link href="/leaderboard">
              <Trophy className="mr-2 h-4 w-4" />
              View Leaderboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
