'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Flame, Play, Swords, Trophy, Users, Zap } from 'lucide-react'
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
    <div className="mb-3 flex items-end justify-between">
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
        <div className="mb-3 flex items-end justify-between">
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
    ? quizzes.filter((quiz) => quiz.id !== excludeQuizId).slice(0, 9)
    : quizzes.slice(0, 9)

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
                  'group relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-2xl block hover:z-10'
                )}
              >
                <div
                  style={{
                    background: `linear-gradient(135deg, ${category.color}20, ${category.color}85)`,
                  }}
                  className="relative flex h-full min-h-[8rem] cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-border/30 p-5 shadow-sm transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-lg"
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
        <div className="rounded-3xl border border-primary/15 bg-gradient-to-b from-primary/6 via-primary/3 to-transparent p-6 shadow-sm">
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
        <div className="flex flex-col items-center justify-center rounded-3xl border border-primary/15 bg-gradient-to-b from-primary/6 via-primary/3 to-transparent p-7 text-center shadow-sm">
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

function DuelInviteCard() {
  return (
    <section>
      <div className="relative overflow-hidden rounded-2xl border border-quiz-purple/20 bg-gradient-to-br from-quiz-purple/8 via-quiz-pink/5 to-transparent p-6 shadow-sm">
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-quiz-purple/10 blur-2xl"
          aria-hidden="true"
        />
        <div className="relative flex flex-col items-center gap-5 md:flex-row">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-quiz-purple to-quiz-pink shadow-lg shadow-quiz-purple/30">
            <Swords className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-lg font-black tracking-tight">Challenge a friend to a duel</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Go head-to-head on the same quiz. First to finish with the highest score wins.
            </p>
          </div>
          <Button
            asChild
            variant="gradient"
            className="shrink-0 rounded-xl font-bold shadow shadow-quiz-purple/20"
          >
            <Link href="/sign-up">
              <Swords className="h-4 w-4" />
              Start a Duel
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

function JoinCTABanner({ stats }: { stats: HomeStats }) {
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

function WelcomeDailyHero({ currentUser }: { currentUser: HomeCurrentUser }) {
  const displayName = currentUser.name?.trim() || 'Quizzer'
  const firstName = displayName.split(/\s+/)[0] || 'Quizzer'
  const { pct: xpPct } = xpProgress(currentUser.xp)
  const nextLevel = currentUser.level + 1

  return (
    <section>
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-accent/10 shadow-sm">
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative flex flex-wrap items-center justify-between gap-4 px-5 py-3.5 md:px-7">
          {/* Left: greeting + stat pills */}
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-base font-black tracking-tight">Welcome back, {firstName}! 👋</h1>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1">
                <Zap className="h-3 w-3 text-primary" />
                <span className="text-xs font-black text-primary">Lv.{currentUser.level}</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 px-3 py-1">
                <Flame className="h-3 w-3 text-orange-500" />
                <span className="text-xs font-black text-orange-500 dark:text-orange-400">
                  {currentUser.streakDays}d streak
                </span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-muted/80 border border-border px-3 py-1">
                <Trophy className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs font-bold text-muted-foreground">
                  {currentUser.xp.toLocaleString()} XP
                </span>
              </div>
            </div>
          </div>

          {/* Right: XP progress bar */}
          <div className="min-w-[160px] max-w-xs flex-1 space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span>
                Level {currentUser.level} → {nextLevel}
              </span>
              <span>{Math.round(xpPct)}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-quiz-purple to-quiz-pink transition-all duration-700"
                style={{ width: `${xpPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function TodaysPickWithChallenge({
  featuredQuiz,
  currentUser,
}: {
  featuredQuiz: QuizCardData | null
  currentUser: HomeCurrentUser
}) {
  return (
    <section>
      <SectionHeader title="Today's Pick" href="/categories" />
      <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
        {/* Left: featured quiz */}
        <div>
          {featuredQuiz ? (
            <div className="focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 rounded-3xl h-full">
              <QuizCardFeatured quiz={featuredQuiz} />
            </div>
          ) : (
            <div className="flex h-full min-h-[160px] items-center justify-center rounded-2xl border border-dashed bg-accent/20 p-8 text-center text-sm text-muted-foreground">
              Quizzes will appear here soon.
            </div>
          )}
        </div>

        {/* Right: Daily Challenge card */}
        <div className="relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-orange-500/25 bg-gradient-to-br from-orange-500/15 via-amber-500/10 to-orange-500/5 p-4">
          {/* Ambient glow */}
          <div
            className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-orange-500/20 blur-2xl"
            aria-hidden="true"
          />

          <div className="relative flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-md shadow-orange-500/25">
              <Flame className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black">Daily Challenge</span>
                <span className="rounded-full bg-orange-500/15 border border-orange-500/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                  Live
                </span>
              </div>
              <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                {currentUser.streakDays > 0 ? (
                  <>
                    🔥{' '}
                    <span className="font-bold text-orange-500 dark:text-orange-400">
                      {currentUser.streakDays}-day streak
                    </span>{' '}
                    — keep it going!
                  </>
                ) : (
                  'Start your streak today!'
                )}
              </p>
            </div>
          </div>

          {/* Feature pills */}
          <div className="relative flex flex-col gap-2">
            <div className="flex items-center gap-2 rounded-xl border border-orange-500/20 bg-orange-500/10 px-3 py-2">
              <Zap className="h-3.5 w-3.5 shrink-0 text-orange-500" />
              <span className="text-xs font-semibold">Bonus XP for completing</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-orange-500/20 bg-orange-500/10 px-3 py-2">
              <Flame className="h-3.5 w-3.5 shrink-0 text-orange-500" />
              <span className="text-xs font-semibold">New challenge every day</span>
            </div>
          </div>

          <div className="relative mt-auto">
            <Button
              asChild
              className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 font-bold shadow-sm shadow-orange-500/20 hover:opacity-90"
            >
              <Link href="/random-quiz">Play Challenge →</Link>
            </Button>
          </div>
        </div>
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
  const minGeographyQuizzesToShow = 2
  const geographyMatcher = /countr|geograph/i
  const loggedInGeographyQuizzes = [...popularQuizzes, ...trendingQuizzes].filter((quiz) =>
    geographyMatcher.test(quiz.category.name)
  )
  const guestQuizPool = [...popularQuizzes, ...trendingQuizzes, ...newestQuizzes]
  const guestGeographyQuizzes = [
    ...new Map(guestQuizPool.map((quiz) => [quiz.id, quiz])).values(),
  ].filter((quiz) => geographyMatcher.test(quiz.category.name))

  return (
    <motion.div
      className="container mx-auto space-y-8 px-4 md:px-6 py-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {currentUser ? (
        <>
          <motion.div variants={sectionVariants}>
            <WelcomeDailyHero currentUser={currentUser} />
          </motion.div>

          <Divider />

          <motion.div variants={sectionVariants}>
            <TodaysPickWithChallenge featuredQuiz={featuredQuiz} currentUser={currentUser} />
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
              title="Trending Right Now"
              quizzes={trendingQuizzes}
              excludeQuizId={featuredQuiz?.id}
            />
          </motion.div>

          <Divider />

          <motion.div variants={sectionVariants}>
            <QuizScrollerSection title="Most Popular" quizzes={popularQuizzes} />
          </motion.div>

          <Divider />

          <motion.div variants={sectionVariants}>
            {loggedInGeographyQuizzes.length >= minGeographyQuizzesToShow ? (
              <QuizGridSection title="Countries & Geography" quizzes={loggedInGeographyQuizzes} />
            ) : (
              <QuizGridSection title="Freshly Added" quizzes={newestQuizzes} />
            )}
          </motion.div>

          <Divider />

          {recentlyPlayed.length > 0 ? (
            <>
              <motion.div variants={sectionVariants}>
                <QuizScrollerSection title="Recently Played" quizzes={recentlyPlayed} />
              </motion.div>
              <Divider />
            </>
          ) : null}

          <motion.div variants={sectionVariants}>
            <CategoryMosaic featuredCategories={featuredCategories} />
          </motion.div>

          <Divider />

          <motion.div variants={sectionVariants}>
            <QuizScrollerSection title="Freshly Added" quizzes={newestQuizzes} />
          </motion.div>

          <Divider />

          <motion.div variants={sectionVariants}>
            <LeaderboardSection topPlayers={topPlayers} stats={stats} currentUser={currentUser} />
          </motion.div>
        </>
      ) : (
        <>
          <Divider />

          <motion.div variants={sectionVariants}>
            <QuizGridSection
              title="Trending Globally"
              quizzes={trendingQuizzes}
              excludeQuizId={featuredQuiz?.id}
            />
          </motion.div>

          <Divider />

          <motion.div variants={sectionVariants}>
            <QuizScrollerSection title="Most Popular" quizzes={popularQuizzes} />
          </motion.div>

          <Divider />

          <motion.div variants={sectionVariants}>
            <CategoryMosaic featuredCategories={featuredCategories} />
          </motion.div>

          <Divider />

          <motion.div variants={sectionVariants}>
            <DuelInviteCard />
          </motion.div>

          <Divider />

          {guestGeographyQuizzes.length >= minGeographyQuizzesToShow ? (
            <>
              <motion.div variants={sectionVariants}>
                <QuizScrollerSection
                  title="Countries & Geography"
                  quizzes={guestGeographyQuizzes}
                />
              </motion.div>

              <Divider />

              <motion.div variants={sectionVariants}>
                <QuizScrollerSection title="Freshly Added" quizzes={newestQuizzes} />
              </motion.div>
            </>
          ) : (
            <motion.div variants={sectionVariants}>
              <QuizScrollerSection title="Freshly Added" quizzes={newestQuizzes} />
            </motion.div>
          )}

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
