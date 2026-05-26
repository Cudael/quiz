'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Flame, Play, Trophy, Users, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { QuizCard, QuizCardFeatured, type QuizCardData } from '@/components/ui/quiz-card'
import { fadeUp, staggerContainer, withReducedMotion } from '@/lib/motion'
import { xpProgress } from '@/domain/leveling'
import { cn } from '@/lib/utils'

// ... (keep the interfaces HomeFeaturedCategory, HomeTopPlayer, HomeStats, HomeCurrentUser intact) ...
export interface HomeFeaturedCategory {
  slug: string
  name: string
  icon: string
  color: string
  imageUrl?: string
  description: string
  quizCount: number
}

export interface HomeTopPlayer {
  userId: string
  name: string
  image: string | null
  totalScore: number
}

export interface HomeStats {
  totalPlayers: number
  totalQuizzes: number
  totalQuestions: number
  totalCategories: number
}

export interface HomeCurrentUser {
  name: string | null
  xp: number
  level: number
  streakDays: number
}

interface HomePageClientProps {
  featuredCategories: HomeFeaturedCategory[]
  topPlayers: HomeTopPlayer[]
  stats: HomeStats
  popularQuizzes: QuizCardData[]
  trendingQuizzes: QuizCardData[]
  newestQuizzes: QuizCardData[]
  personalizedQuizzes: QuizCardData[]
  recentlyPlayed: QuizCardData[]
  currentUser: HomeCurrentUser | null
}

const leaderboardRanks = ['🥇', '🥈', '🥉', '4.', '5.'] as const
const teaserPositions = [
  'top-0 right-0 rotate-2 z-30 shadow-xl',
  'top-8 right-6 -rotate-1 z-20 shadow-lg',
  'top-16 right-12 rotate-1 z-10 shadow-md',
]

function AnimatedCounter({ value, duration = 1.5 }: { value: number; duration?: number }) {
  const shouldReduce = useReducedMotion()
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (shouldReduce) return
    const startTime = performance.now()
    let rafId: number
    function update() {
      const elapsed = performance.now() - startTime
      const progress = Math.min(elapsed / (duration * 1000), 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(value * eased))
      if (progress < 1) {
        rafId = requestAnimationFrame(update)
      }
    }
    rafId = requestAnimationFrame(update)
    return () => cancelAnimationFrame(rafId)
  }, [value, duration, shouldReduce])

  return <>{(shouldReduce ? value : count).toLocaleString()}</>
}

function Divider() {
  return <div className="border-t border-border/30" />
}

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-5 flex items-end justify-between">
      <h2 className="text-2xl font-black tracking-tight">{title}</h2>
      <Link
        href={href}
        className="flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md px-1 transition-colors"
      >
        See all <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  )
}

function QuizScrollerSection({
  title,
  quizzes,
  subtitle,
}: {
  title: string
  quizzes: QuizCardData[]
  subtitle?: string
}) {
  return (
    <section>
      {subtitle ? (
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight">{title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          </div>
          <Link
            href="/categories"
            className="flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md px-1 transition-colors"
          >
            See all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <SectionHeader title={title} href="/categories" />
      )}
      {quizzes.length > 0 ? (
        <div
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:thin] scrollbar-thumb-muted scrollbar-track-transparent"
          aria-label={`${title} quizzes`}
        >
          {quizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              className="w-64 shrink-0 snap-start focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground bg-accent/20">
          Quizzes will appear here soon.
        </div>
      )}
    </section>
  )
}

function QuizGridSection({
  title,
  quizzes,
  excludeQuizId,
}: {
  title: string
  quizzes: QuizCardData[]
  excludeQuizId?: string
}) {
  const visibleQuizzes = excludeQuizId
    ? quizzes.filter((quiz) => quiz.id !== excludeQuizId).slice(0, 6)
    : quizzes.slice(0, 6)

  return (
    <section>
      <SectionHeader title={title} href="/categories" />
      {visibleQuizzes.length > 0 ? (
        <div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          aria-label={`${title} quizzes`}
        >
          {visibleQuizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              className="w-full focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground bg-accent/20">
          Quizzes will appear here soon.
        </div>
      )}
    </section>
  )
}

function FeaturedQuizSection({
  title,
  featuredQuiz,
}: {
  title: string
  featuredQuiz: QuizCardData | null
}) {
  return (
    <section>
      <SectionHeader title={title} href="/categories" />
      {featuredQuiz ? (
        <div className="focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 rounded-3xl">
          <QuizCardFeatured quiz={featuredQuiz} />
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground bg-accent/20">
          Quizzes will appear here soon.
        </div>
      )}
    </section>
  )
}

function CategoryMosaic({ featuredCategories }: { featuredCategories: HomeFeaturedCategory[] }) {
  return (
    <section>
      <SectionHeader title="Explore by topic" href="/categories" />
      {featuredCategories.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {featuredCategories.slice(0, 8).map((category, index) => {
            const isLarge = index === 0
            return (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className={cn(
                  isLarge ? 'col-span-2 row-span-2' : 'col-span-1',
                  'group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-2xl block'
                )}
              >
                <div
                  style={{
                    background: `linear-gradient(135deg, ${category.color}20, ${category.color}85)`,
                  }}
                  className="relative flex h-full min-h-[8rem] cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-border/30 p-5 shadow-sm transition-all duration-200 group-hover:scale-[1.02] group-hover:shadow-lg"
                >
                  {/* Subtle glow on hover */}
                  <div
                    className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                    style={{
                      background: `radial-gradient(circle at 50% 0%, ${category.color}15, transparent 70%)`,
                    }}
                  />
                  <div
                    className={cn(
                      'relative leading-none drop-shadow-sm',
                      isLarge ? 'text-5xl' : 'text-3xl'
                    )}
                    aria-hidden="true"
                  >
                    {category.icon}
                  </div>
                  <div className="relative mt-4">
                    <div
                      className={cn(
                        'font-black tracking-tight',
                        isLarge ? 'text-2xl md:text-3xl' : 'text-base'
                      )}
                    >
                      {category.name}
                    </div>
                    {isLarge && category.description ? (
                      <div className="mt-1.5 line-clamp-2 text-sm opacity-85 font-medium">
                        {category.description}
                      </div>
                    ) : null}
                    <div className="mt-1.5 text-xs opacity-70 font-semibold">
                      {category.quizCount} {category.quizCount === 1 ? 'quiz' : 'quizzes'}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground bg-accent/20">
          Categories will appear here soon.
        </div>
      )}
    </section>
  )
}

function LeaderboardSection({
  topPlayers,
  stats,
  currentUser,
}: {
  topPlayers: HomeTopPlayer[]
  stats: HomeStats
  currentUser: HomeCurrentUser | null
}) {
  return (
    <section className="grid gap-5 md:grid-cols-[1fr_300px]">
      {/* Top Players */}
      <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-quiz-yellow" />
          <h3 className="text-xl font-black tracking-tight">Top Players</h3>
        </div>
        <div className="space-y-2">
          {topPlayers.slice(0, 5).map((player, index) => (
            <div
              key={player.userId}
              className={cn(
                'flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors',
                index === 0
                  ? 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/15'
                  : index === 1
                    ? 'bg-surface-1/60 hover:bg-surface-2/60'
                    : 'hover:bg-accent/30'
              )}
            >
              <span className="w-6 text-center text-base font-black">
                {leaderboardRanks[index] ?? `${index + 1}.`}
              </span>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-primary text-sm font-black shadow-inner border border-primary/10">
                {(player.name || '?').charAt(0).toUpperCase()}
              </div>
              <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                <span className="truncate text-sm font-bold">{player.name}</span>
                <span className="shrink-0 rounded-xl bg-background px-2.5 py-1 text-xs font-bold text-muted-foreground shadow-sm border border-border/40">
                  {player.totalScore.toLocaleString()} pts
                </span>
              </div>
            </div>
          ))}
          {topPlayers.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">
              No players on the board yet. Be the first!
            </p>
          ) : null}
        </div>
        <div className="mt-4 pt-4 border-t border-border/30">
          <Link
            href="/leaderboard"
            className="flex items-center justify-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            View full leaderboard <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* CTA card */}
      {currentUser ? (
        <div className="rounded-3xl border border-primary/20 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="font-black text-lg">Your Stats</h3>
          </div>
          <div className="space-y-3 text-sm">
            {[
              { label: 'Level', value: `⚡ ${currentUser.level}`, accent: 'text-primary' },
              {
                label: 'Streak',
                value: `🔥 ${currentUser.streakDays} days`,
                accent: 'text-orange-500',
              },
              {
                label: 'Total XP',
                value: currentUser.xp.toLocaleString(),
                accent: 'text-foreground',
              },
            ].map(({ label, value, accent }) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-xl bg-background/50 px-4 py-2.5 border border-border/30"
              >
                <span className="font-semibold text-muted-foreground">{label}</span>
                <span className={cn('font-black', accent)}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-primary/20 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent p-7 text-center shadow-sm">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-quiz-purple to-quiz-pink shadow-lg shadow-quiz-purple/30 mb-4"
            aria-hidden="true"
          >
            <Zap className="h-7 w-7 text-primary-foreground" />
          </div>
          <h3 className="text-xl font-black tracking-tight">Think you can top this?</h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Join <span className="font-black text-foreground">{stats.totalPlayers}</span> players
            competing globally.
          </p>
          <Button
            asChild
            variant="gradient"
            className="mt-6 w-full rounded-2xl font-bold shadow-md shadow-quiz-purple/25"
          >
            <Link href="/sign-up">
              <Zap className="h-4 w-4" />
              Create Free Account
            </Link>
          </Button>
        </div>
      )}
    </section>
  )
}

function GuestHero({
  popularQuizzes,
  stats,
}: {
  popularQuizzes: QuizCardData[]
  stats: HomeStats
}) {
  const shouldReduce = useReducedMotion()

  return (
    <section>
      <div className="relative overflow-hidden rounded-[2.5rem] bg-[image:var(--background-image-hero-gradient)] px-6 py-14 md:px-12 md:py-20 shadow-2xl border border-border/20">
        {/* Ambient decorative blobs */}
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-quiz-purple/20 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-20 left-10 h-72 w-72 rounded-full bg-quiz-pink/15 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative grid gap-12 md:grid-cols-2 md:items-center">
          <div className="max-w-xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-quiz-purple/25 bg-quiz-purple/10 px-4 py-1.5">
              <Zap className="h-3.5 w-3.5 text-quiz-purple" />
              <span className="text-xs font-bold tracking-wide text-quiz-purple">
                Free to play — no signup required
              </span>
            </div>
            <h1 className="text-4xl font-black tracking-tight md:text-5xl lg:text-6xl leading-[1.1]">
              Play great quizzes{' '}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-quiz-purple to-quiz-pink">
                right now.
              </span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
              Hundreds of quizzes across every topic. Compete on the leaderboard or build your own
              in minutes.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 items-center">
              <Button
                asChild
                size="lg"
                variant="gradient"
                className="rounded-2xl h-12 px-7 text-base font-bold shadow-lg shadow-quiz-purple/30"
              >
                <Link href="/sign-up">
                  <Zap className="h-4 w-4" />
                  Get Started Free
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="rounded-2xl h-12 px-7 text-base font-semibold bg-background/50 backdrop-blur-sm border-border/60 hover:bg-background/80"
              >
                <Link href="/random-quiz">
                  <Play className="h-4 w-4" />
                  Instant Play
                </Link>
              </Button>
            </div>

            {/* Animated stats */}
            <div className="mt-10 grid grid-cols-3 gap-3">
              {[
                { value: stats.totalQuizzes, label: 'Quizzes', icon: '🎯' },
                { value: stats.totalPlayers, label: 'Players', icon: '👥' },
                { value: stats.totalCategories, label: 'Topics', icon: '📚' },
              ].map(({ value, label, icon }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-border/40 bg-background/50 px-3 py-3 text-center backdrop-blur-sm"
                >
                  <div className="text-lg mb-0.5" aria-hidden="true">
                    {icon}
                  </div>
                  <div className="text-xl font-black tabular-nums">
                    <AnimatedCounter value={value} />
                  </div>
                  <div className="text-xs font-semibold text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quiz card teasers */}
          <div className="relative hidden h-72 md:block perspective-1000">
            {popularQuizzes.slice(0, 3).map((quiz, index) => (
              <motion.div
                key={quiz.id}
                initial={shouldReduce ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.12, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  'absolute w-56 rounded-2xl border bg-card/80 backdrop-blur-sm p-4 shadow-xl transition-transform hover:-translate-y-2 hover:scale-105 duration-300',
                  teaserPositions[index]
                )}
                style={{ borderColor: quiz.category.color, borderTopWidth: 4 }}
              >
                <p className="line-clamp-2 text-sm font-bold leading-tight">{quiz.title}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: quiz.category.color }}
                  />
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
                    {quiz.category.name}
                  </p>
                </div>
                {quiz.playCount ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    🎮 {quiz.playCount.toLocaleString()} plays
                  </p>
                ) : null}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    {
      num: '01',
      emoji: '🎯',
      title: 'Pick a quiz',
      desc: 'Browse hundreds of quizzes across science, history, pop culture, and more.',
      color: 'quiz-purple',
    },
    {
      num: '02',
      emoji: '⚡',
      title: 'Compete and score',
      desc: 'Race against the clock, earn XP, and climb the global leaderboard.',
      color: 'quiz-pink',
    },
    {
      num: '03',
      emoji: '✏️',
      title: 'Create your own',
      desc: 'Build and publish quizzes in the Studio — share them with the world.',
      color: 'quiz-blue',
    },
  ]
  return (
    <section>
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-black tracking-tight">How it works</h2>
        <p className="mt-2 text-muted-foreground">Start competing in under 30 seconds</p>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {steps.map((step) => (
          <div
            key={step.title}
            className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-7 shadow-sm transition-shadow duration-200 hover:shadow-md"
          >
            {/* Step number watermark */}
            <span
              className={cn(
                'pointer-events-none absolute -right-2 -top-4 font-black text-[5rem] leading-none opacity-5 select-none',
                `text-${step.color}`
              )}
              aria-hidden="true"
            >
              {step.num}
            </span>
            <div className="text-4xl mb-4">{step.emoji}</div>
            <h3 className="font-black text-lg tracking-tight">{step.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function JoinCTABanner({ stats }: { stats: HomeStats }) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-quiz-purple/15 via-quiz-pink/10 to-quiz-blue/10 border border-primary/15 p-8 md:p-12 shadow-lg">
      <div
        className="pointer-events-none absolute right-0 top-0 h-64 w-64 -translate-y-1/4 translate-x-1/4 rounded-full bg-quiz-purple/15 blur-3xl"
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

function DailyChallengeBanner({ currentUser }: { currentUser: HomeCurrentUser }) {
  return (
    <section>
      <div className="relative overflow-hidden flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-orange-500/5 border border-orange-500/25 rounded-2xl px-6 py-5 shadow-sm">
        {/* Glow accent */}
        <div
          className="pointer-events-none absolute -left-4 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-orange-500/30 blur-2xl"
          aria-hidden="true"
        />
        <div className="relative flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-500/30">
            <Flame className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-base">Daily Challenge</span>
              <span className="rounded-full bg-orange-500/15 border border-orange-500/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                Live
              </span>
            </div>
            {currentUser.streakDays > 0 ? (
              <span className="text-sm text-muted-foreground font-medium">
                🔥{' '}
                <span className="font-bold text-orange-500 dark:text-orange-400">
                  {currentUser.streakDays}-day streak
                </span>{' '}
                — keep it going!
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">Start your streak today!</span>
            )}
          </div>
        </div>
        <Button
          asChild
          size="sm"
          className="relative rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 font-bold shadow-md shadow-orange-500/25 hover:opacity-90"
        >
          <Link href="/random-quiz">Play Challenge →</Link>
        </Button>
      </div>
    </section>
  )
}

function WelcomeBar({ currentUser }: { currentUser: HomeCurrentUser }) {
  const displayName = currentUser.name?.trim() || 'Quizzer'
  const firstName = displayName.split(/\s+/)[0] || 'Quizzer'
  const { pct: xpPct } = xpProgress(currentUser.xp)
  const nextLevel = currentUser.level + 1

  return (
    <section>
      <div className="relative overflow-hidden rounded-[2rem] border border-border/50 bg-gradient-to-br from-card via-card to-accent/10 px-6 py-7 md:px-8 shadow-md">
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-primary/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-black tracking-tight md:text-3xl">
              Welcome back, {firstName}! 👋
            </h1>

            {/* Stat pills */}
            <div className="mt-4 flex flex-wrap gap-2.5">
              <div className="flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3.5 py-1.5">
                <Zap className="h-3.5 w-3.5 text-primary" />
                <span className="text-sm font-black text-primary">Lv.{currentUser.level}</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 px-3.5 py-1.5">
                <Flame className="h-3.5 w-3.5 text-orange-500" />
                <span className="text-sm font-black text-orange-500 dark:text-orange-400">
                  {currentUser.streakDays}d streak
                </span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-muted/80 border border-border px-3.5 py-1.5">
                <Trophy className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm font-bold text-muted-foreground">
                  {currentUser.xp.toLocaleString()} XP
                </span>
              </div>
            </div>

            {/* XP progress bar */}
            <div className="mt-4 max-w-sm space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                <span>
                  Level {currentUser.level} → {nextLevel}
                </span>
                <span>{Math.round(xpPct)}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-quiz-purple to-quiz-pink transition-all duration-700"
                  style={{ width: `${xpPct}%` }}
                />
              </div>
            </div>
          </div>

          <Button
            asChild
            size="lg"
            variant="gradient"
            className="rounded-2xl font-bold shadow-lg shadow-quiz-purple/20 shrink-0"
          >
            <Link href="/random-quiz">
              <Play className="h-4 w-4" />
              Continue Playing
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

function QuickActions() {
  const actions = [
    { label: '🎲 Random Quiz', href: '/random-quiz' },
    { label: '🔥 Daily Challenge', href: '/random-quiz' },
    { label: '🏆 Leaderboard', href: '/leaderboard' },
    { label: '✏️ Create Quiz', href: '/studio/quiz/new' },
  ]
  return (
    <section>
      <div className="flex flex-wrap gap-2.5">
        {actions.map((action) => (
          <Button
            key={action.href + action.label}
            asChild
            variant="outline"
            className="rounded-xl font-semibold hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-colors"
          >
            <Link href={action.href}>{action.label}</Link>
          </Button>
        ))}
      </div>
    </section>
  )
}

export function HomePageClient({
  featuredCategories,
  topPlayers,
  stats,
  popularQuizzes,
  trendingQuizzes,
  newestQuizzes,
  personalizedQuizzes,
  recentlyPlayed,
  currentUser,
}: HomePageClientProps) {
  const shouldReduce = useReducedMotion()
  const containerVariants = withReducedMotion(staggerContainer(0.06), shouldReduce)
  const sectionVariants = withReducedMotion(fadeUp, shouldReduce)
  const featuredQuiz = popularQuizzes[0] ?? trendingQuizzes[0] ?? null

  return (
    <motion.div
      className="mx-auto max-w-7xl space-y-16 px-4 py-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {currentUser ? (
        <>
          <motion.div variants={sectionVariants}>
            <DailyChallengeBanner currentUser={currentUser} />
          </motion.div>

          <Divider />

          <motion.div variants={sectionVariants}>
            <WelcomeBar currentUser={currentUser} />
          </motion.div>

          <Divider />

          <motion.div variants={sectionVariants}>
            <QuickActions />
          </motion.div>

          <Divider />

          <motion.div variants={sectionVariants}>
            <FeaturedQuizSection title="⭐ Today's Pick" featuredQuiz={featuredQuiz} />
          </motion.div>

          {personalizedQuizzes.length > 0 ? (
            <>
              <Divider />
              <motion.div variants={sectionVariants}>
                <QuizScrollerSection
                  title="For You"
                  quizzes={personalizedQuizzes}
                  subtitle="Based on your activity"
                />
              </motion.div>
            </>
          ) : null}

          <Divider />

          <motion.div variants={sectionVariants}>
            <QuizGridSection
              title="🔥 Trending Right Now"
              quizzes={trendingQuizzes}
              excludeQuizId={featuredQuiz?.id}
            />
          </motion.div>

          {recentlyPlayed.length > 0 ? (
            <>
              <Divider />
              <motion.div variants={sectionVariants}>
                <QuizScrollerSection title="🕹️ Recently Played" quizzes={recentlyPlayed} />
              </motion.div>
            </>
          ) : null}

          <Divider />

          <motion.div variants={sectionVariants}>
            <CategoryMosaic featuredCategories={featuredCategories} />
          </motion.div>
        </>
      ) : (
        <>
          <motion.div variants={sectionVariants}>
            <GuestHero popularQuizzes={popularQuizzes} stats={stats} />
          </motion.div>

          <Divider />

          <motion.div variants={sectionVariants}>
            <HowItWorks />
          </motion.div>

          <Divider />

          <motion.div variants={sectionVariants}>
            <CategoryMosaic featuredCategories={featuredCategories} />
          </motion.div>

          <Divider />

          <motion.div variants={sectionVariants}>
            <FeaturedQuizSection title="⭐ Editor's Pick" featuredQuiz={featuredQuiz} />
          </motion.div>

          <Divider />

          <motion.div variants={sectionVariants}>
            <QuizGridSection
              title="🔥 Trending Globally"
              quizzes={trendingQuizzes}
              excludeQuizId={featuredQuiz?.id}
            />
          </motion.div>

          <Divider />

          <motion.div variants={sectionVariants}>
            <QuizScrollerSection title="✨ Freshly Added" quizzes={newestQuizzes} />
          </motion.div>

          <Divider />

          <motion.div variants={sectionVariants}>
            <LeaderboardSection topPlayers={topPlayers} stats={stats} currentUser={null} />
          </motion.div>

          <Divider />

          <motion.div variants={sectionVariants}>
            <JoinCTABanner stats={stats} />
          </motion.div>
        </>
      )}
    </motion.div>
  )
}
