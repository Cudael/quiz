import Link from 'next/link'
import { Play, Swords, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { HomeStats } from '../home-page-client.types'

export function DuelBannerSection({
  isGuest = false,
  className,
}: {
  isGuest?: boolean
  className?: string
}) {
  return (
    <section className={className}>
      <div className="relative h-full overflow-hidden rounded-3xl border border-quiz-purple/30 bg-gradient-to-br from-quiz-purple/12 via-quiz-pink/8 to-quiz-blue/5 p-6 shadow-lg shadow-quiz-purple/15 ring-2 ring-quiz-purple/40">
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-44 w-44 rounded-full bg-quiz-purple/15 blur-2xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-quiz-pink/12 blur-2xl"
          aria-hidden="true"
        />
        <div className="relative flex h-full flex-col justify-between gap-5 md:flex-row md:items-center">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-quiz-purple to-quiz-pink shadow-lg shadow-quiz-purple/30">
            <Swords className="h-7 w-7 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-black tracking-tight">
              <span>⚔️ </span>
              <span>Duel Mode</span>
            </h2>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              Challenge a friend — real-time head-to-head on any quiz.
            </p>
          </div>
          <Button
            asChild
            variant="gradient"
            className="shrink-0 rounded-xl font-bold shadow shadow-quiz-purple/20"
          >
            <Link href={isGuest ? '/sign-up' : '/duel'}>
              <Swords className="h-4 w-4" />
              <span>Start a Duel</span>
              <span aria-hidden="true">→</span>
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

export function DuelInviteCard() {
  return <DuelBannerSection isGuest />
}

export function JoinCTABanner({ stats }: { stats: HomeStats }) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-quiz-purple/8 via-quiz-pink/5 to-quiz-blue/5 border border-primary/10 p-8 md:p-12 shadow-lg">
      <div
        className="pointer-events-none absolute right-0 top-0 h-64 w-64 -translate-y-1/4 translate-x-1/4 rounded-full bg-quiz-purple/8 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1">
          <h2 className="text-3xl font-black tracking-tight md:text-4xl">
            Join{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-quiz-purple to-quiz-pink">
              {stats.totalPlayers.toLocaleString()}+ players
            </span>{' '}
            already competing
          </h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Create a free account to track your progress, earn badges, maintain streaks, and build
            your own quizzes.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              variant="gradient"
              className="rounded-2xl font-bold shadow-lg shadow-quiz-purple/25"
            >
              <Link href="/sign-up">
                <Zap className="h-4 w-4" />
                Get Started Free
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-2xl font-semibold">
              <Link href="/random-quiz">
                <Play className="h-4 w-4" />
                Play as Guest
              </Link>
            </Button>
          </div>
        </div>
        <div className="hidden md:flex gap-3 text-5xl" aria-hidden="true">
          <span className="animate-float" style={{ animationDelay: '0s' }}>
            🏆
          </span>
          <span className="animate-float" style={{ animationDelay: '0.4s' }}>
            🔥
          </span>
          <span className="animate-float" style={{ animationDelay: '0.8s' }}>
            ⚡
          </span>
        </div>
      </div>
    </section>
  )
}
