'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { Play, Trophy, Zap, ArrowRight, Flame, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CategoryTile } from '@/components/ui/category-tile'
import { Avatar } from '@/components/ui/avatar'
import { ProgressBar } from '@/components/ui/progress-bar'
import { staggerContainer, fadeUp, withReducedMotion } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { GuestUpgradePrompt } from '@/components/auth/guest-upgrade-prompt'

export interface HomeFeaturedCategory {
  slug: string
  name: string
  icon: string
  color: string
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

interface HomePageClientProps {
  featuredCategories: HomeFeaturedCategory[]
  topPlayers: HomeTopPlayer[]
  stats: HomeStats
}

const HOW_IT_WORKS = [
  {
    icon: BookOpen,
    title: 'Browse & Choose',
    description:
      'Explore hundreds of quizzes across 10+ categories. Filter by difficulty and mode.',
    color: 'text-quiz-purple',
    bg: 'bg-quiz-purple/10',
  },
  {
    icon: Zap,
    title: 'Play & Compete',
    description: 'Race the clock with timed questions. Earn more points for faster answers.',
    color: 'text-quiz-green',
    bg: 'bg-quiz-green/10',
  },
  {
    icon: Trophy,
    title: 'Rank & Win',
    description: 'Climb the global leaderboard. Earn XP, level up, and unlock exclusive badges.',
    color: 'text-quiz-orange',
    bg: 'bg-quiz-orange/10',
  },
]

const compactFormatter = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

const standardFormatter = new Intl.NumberFormat('en')

function formatCompact(value: number) {
  return value >= 1000 ? compactFormatter.format(value) : standardFormatter.format(value)
}

export function HomePageClient({ featuredCategories, topPlayers, stats }: HomePageClientProps) {
  const shouldReduce = useReducedMotion()
  const containerVariants = withReducedMotion(staggerContainer(0.1), shouldReduce)
  const itemVariants = withReducedMotion(fadeUp, shouldReduce)

  const statsRows = [
    { label: 'Active Players', value: stats.totalPlayers },
    { label: 'Quizzes', value: stats.totalQuizzes },
    { label: 'Questions', value: stats.totalQuestions },
    { label: 'Categories', value: stats.totalCategories },
  ]

  // Keep max >= 1 so progress bars never divide by zero when score data is sparse.
  const maxScore =
    topPlayers.length === 0 ? 1 : Math.max(...topPlayers.map((player) => player.totalScore))

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-hero-gradient py-24 text-foreground md:py-32">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-15" />
        <div
          className={cn(
            'absolute top-20 left-10 h-64 w-64 rounded-full bg-quiz-purple/15 blur-3xl',
            !shouldReduce && 'animate-pulse-slow'
          )}
          aria-hidden="true"
        />
        <div
          className={cn(
            'absolute bottom-10 right-10 h-96 w-96 rounded-full bg-quiz-pink/15 blur-3xl',
            !shouldReduce && 'animate-pulse-slow'
          )}
          aria-hidden="true"
        />

        <div className="container relative mx-auto px-4 text-center">
          <motion.div
            initial={shouldReduce ? {} : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="purple" className="mb-6 text-sm px-4 py-1.5">
              <Flame className="mr-1 h-3.5 w-3.5" />
              {formatCompact(stats.totalPlayers)} players competing right now
            </Badge>
          </motion.div>

          <motion.h1
            initial={shouldReduce ? {} : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6 text-5xl font-extrabold tracking-tight md:text-7xl lg:text-8xl"
          >
            Test Your{' '}
            <span className="bg-gradient-to-r from-quiz-purple-light via-quiz-pink to-quiz-orange bg-clip-text text-transparent">
              Knowledge
            </span>
            <br />
            <span>Win the Crown</span>
          </motion.h1>

          <motion.p
            initial={shouldReduce ? {} : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl"
          >
            Play thousands of quizzes, create your own, and compete against players worldwide. Earn
            XP, unlock badges, and climb the leaderboard!
          </motion.p>

          <motion.div
            initial={shouldReduce ? {} : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <Button variant="gradient" size="xl" asChild className="gap-2">
              <Link href="/categories">
                <Play className="h-5 w-5" />
                Play Now — It&apos;s Free!
              </Link>
            </Button>
            <Button
              variant="outline"
              size="xl"
              asChild
              className="border-border bg-background/40 text-foreground hover:bg-background/70"
            >
              <Link href="/studio">
                Create a Quiz
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={shouldReduce ? {} : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4"
          >
            {statsRows.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-extrabold md:text-4xl">{stat.value.toLocaleString()}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 pt-6">
        <GuestUpgradePrompt />
      </div>

      {/* Featured Categories */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-extrabold md:text-4xl">
              Browse{' '}
              <span className="bg-gradient-to-r from-quiz-purple-light to-quiz-pink bg-clip-text text-transparent">
                Categories
              </span>
            </h2>
            <p className="mt-3 text-muted-foreground">
              From science to pop culture — we&apos;ve got you covered
            </p>
          </div>

          {featuredCategories.length === 0 ? (
            <Card className="mx-auto max-w-xl border-border/50">
              <CardContent className="p-8 text-center text-muted-foreground">
                No published categories yet. Seed the database or publish quizzes to get started.
              </CardContent>
            </Card>
          ) : (
            <>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-100px' }}
                className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
              >
                {featuredCategories.map((cat) => (
                  <motion.div key={cat.slug} variants={itemVariants}>
                    <CategoryTile {...cat} />
                  </motion.div>
                ))}
              </motion.div>
              <div className="mt-8 text-center">
                <Button variant="outline" size="lg" asChild>
                  <Link href="/categories">
                    View all categories
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-extrabold md:text-4xl">
              How It{' '}
              <span className="bg-gradient-to-r from-quiz-green to-quiz-blue bg-clip-text text-transparent">
                Works
              </span>
            </h2>
            <p className="mt-3 text-muted-foreground">Three simple steps to quiz glory</p>
          </div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            className="grid gap-8 md:grid-cols-3"
          >
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div key={step.title} variants={itemVariants}>
                <Card className="relative overflow-hidden border-border/50 hover:border-border hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-8 text-center">
                    <div
                      className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${step.bg}`}
                    >
                      <step.icon className={`h-8 w-8 ${step.color}`} />
                    </div>
                    <div className="absolute top-4 right-4 text-4xl font-extrabold text-muted/30">
                      {i + 1}
                    </div>
                    <h3 className="mb-3 text-xl font-bold">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Top Players */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-extrabold md:text-4xl">
              Top{' '}
              <span className="bg-gradient-to-r from-quiz-orange to-quiz-yellow bg-clip-text text-transparent">
                Players
              </span>
            </h2>
            <p className="mt-3 text-muted-foreground">Current leaderboard leaders</p>
          </div>

          {topPlayers.length === 0 ? (
            <Card className="mx-auto max-w-xl border-border/50">
              <CardContent className="p-8 text-center text-muted-foreground">
                No player sessions yet. Play a quiz to appear on the leaderboard.
              </CardContent>
            </Card>
          ) : (
            <>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-100px' }}
                className="mx-auto max-w-2xl space-y-3"
              >
                {topPlayers.map((player, i) => (
                  <motion.div key={player.userId} variants={itemVariants}>
                    <Card className="border-border/50 hover:border-border hover:shadow-md transition-all duration-200">
                      <CardContent className="flex items-center gap-4 p-4">
                        <span className="w-8 text-center text-lg font-bold text-muted-foreground">
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                        </span>
                        <Avatar src={player.image} fallback={player.name} size="md" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{player.name}</p>
                          <div className="mt-2">
                            <ProgressBar
                              value={player.totalScore}
                              max={maxScore}
                              size="sm"
                              variant="gradient"
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-quiz-purple-light">
                            {player.totalScore.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">Total Score</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
              <div className="mt-8 text-center">
                <Button variant="outline" size="lg" asChild>
                  <Link href="/leaderboard">
                    <Trophy className="mr-2 h-4 w-4" />
                    View Full Leaderboard
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-15" aria-hidden="true" />
        <div className="container relative mx-auto px-4 text-center">
          <motion.div
            initial={shouldReduce ? {} : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 text-5xl" aria-hidden="true">
              🧠
            </div>
            <h2 className="mb-4 text-3xl font-extrabold md:text-5xl">Ready to prove your worth?</h2>
            <p className="mx-auto mb-8 max-w-xl text-muted-foreground text-lg">
              Join thousands of players competing daily. No account needed to start!
            </p>
            <Button variant="gradient" size="xl" asChild>
              <Link href="/categories">
                <Zap className="mr-2 h-5 w-5" />
                Start Playing Free
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
