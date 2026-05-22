'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Flame } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { CategoryTile } from '@/components/ui/category-tile'
import { ProgressBar } from '@/components/ui/progress-bar'
import { fadeUp, staggerContainer, withReducedMotion } from '@/lib/motion'
import { cn } from '@/lib/utils'

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

export interface HomeQuizCard {
  id: string
  title: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  playCount: number
  avgScore: number
  category: { slug: string; name: string; icon: string; color: string }
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
  popularQuizzes: HomeQuizCard[]
  newestQuizzes: HomeQuizCard[]
  personalizedQuizzes: HomeQuizCard[]
  currentUser: HomeCurrentUser | null
}

const compactFormatter = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

const standardFormatter = new Intl.NumberFormat('en')

const difficultyVariant: Record<HomeQuizCard['difficulty'], 'success' | 'warning' | 'destructive'> =
  {
    EASY: 'success',
    MEDIUM: 'warning',
    HARD: 'destructive',
  }

function formatCompact(value: number) {
  return value >= 1000 ? compactFormatter.format(value) : standardFormatter.format(value)
}

function SectionHeader({
  title,
  subtitle,
  href,
  linkLabel,
}: {
  title: string
  subtitle?: string
  href?: string
  linkLabel?: string
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {href && linkLabel ? (
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm font-medium text-quiz-purple-light transition-colors hover:text-quiz-pink"
        >
          {linkLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  )
}

function QuizCard({ quiz }: { quiz: HomeQuizCard }) {
  return (
    <Link href={`/quiz/${quiz.id}`} className="block h-full">
      <Card
        className="h-full border-border/60 border-l-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
        style={{ borderLeftColor: quiz.category.color }}
      >
        <CardContent className="flex h-full flex-col gap-4 p-5">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <p className="line-clamp-2 text-base font-bold leading-snug">{quiz.title}</p>
              <Badge variant={difficultyVariant[quiz.difficulty]} className="shrink-0">
                {quiz.difficulty}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: quiz.category.color }}
                aria-hidden="true"
              />
              <span aria-hidden="true">{quiz.category.icon}</span>
              <span className="truncate">{quiz.category.name}</span>
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between gap-3 text-sm text-muted-foreground">
            <span>{formatCompact(quiz.playCount)} plays</span>
            <span>{Math.round(quiz.avgScore)}% avg</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function EmptyQuizState({ message }: { message: string }) {
  return (
    <Card className="border-dashed border-border/70">
      <CardContent className="p-8 text-center text-sm text-muted-foreground">{message}</CardContent>
    </Card>
  )
}

function QuizGrid({
  quizzes,
  emptyMessage,
  containerVariants,
  itemVariants,
}: {
  quizzes: HomeQuizCard[]
  emptyMessage: string
  containerVariants: ReturnType<typeof staggerContainer>
  itemVariants: typeof fadeUp
}) {
  if (quizzes.length === 0) {
    return <EmptyQuizState message={emptyMessage} />
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-100px' }}
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {quizzes.map((quiz) => (
        <motion.div key={quiz.id} variants={itemVariants}>
          <QuizCard quiz={quiz} />
        </motion.div>
      ))}
    </motion.div>
  )
}

function CategorySection({
  featuredCategories,
  containerVariants,
  itemVariants,
}: {
  featuredCategories: HomeFeaturedCategory[]
  containerVariants: ReturnType<typeof staggerContainer>
  itemVariants: typeof fadeUp
}) {
  return (
    <section className="py-12 md:py-14">
      <div className="container mx-auto px-4">
        <SectionHeader
          title="Browse Categories"
          subtitle="Jump into the topics people keep coming back to."
          href="/categories"
          linkLabel="View all"
        />

        {featuredCategories.length === 0 ? (
          <Card className="mx-auto max-w-xl border-border/50">
            <CardContent className="p-8 text-center text-muted-foreground">
              No published categories yet. Seed the database or publish quizzes to get started.
            </CardContent>
          </Card>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
          >
            {featuredCategories.map((category) => (
              <motion.div key={category.slug} variants={itemVariants}>
                <CategoryTile {...category} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}

function TopPlayersSection({
  topPlayers,
  maxScore,
  containerVariants,
  itemVariants,
}: {
  topPlayers: HomeTopPlayer[]
  maxScore: number
  containerVariants: ReturnType<typeof staggerContainer>
  itemVariants: typeof fadeUp
}) {
  return (
    <section className="py-12 md:py-14">
      <div className="container mx-auto px-4">
        <SectionHeader
          title="Top Players"
          subtitle="Current leaderboard leaders."
          href="/leaderboard"
          linkLabel="View all"
        />

        {topPlayers.length === 0 ? (
          <Card className="mx-auto max-w-xl border-border/50">
            <CardContent className="p-8 text-center text-muted-foreground">
              No player sessions yet. Play a quiz to appear on the leaderboard.
            </CardContent>
          </Card>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            className="mx-auto max-w-3xl space-y-3"
          >
            {topPlayers.map((player, index) => (
              <motion.div key={player.userId} variants={itemVariants}>
                <Card className="border-border/50 hover:border-border hover:shadow-md">
                  <CardContent className="flex items-center gap-4 p-4">
                    <span className="w-8 text-center text-lg font-bold text-muted-foreground">
                      {index === 0
                        ? '🥇'
                        : index === 1
                          ? '🥈'
                          : index === 2
                            ? '🥉'
                            : `#${index + 1}`}
                    </span>
                    <Avatar src={player.image} fallback={player.name} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{player.name}</p>
                      <div className="mt-2">
                        <ProgressBar
                          value={player.totalScore}
                          max={maxScore}
                          size="sm"
                          variant="gradient"
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
        )}
      </div>
    </section>
  )
}

function GuestHomeView({
  featuredCategories,
  topPlayers,
  stats,
  popularQuizzes,
  newestQuizzes,
  containerVariants,
  itemVariants,
  shouldReduce,
}: {
  featuredCategories: HomeFeaturedCategory[]
  topPlayers: HomeTopPlayer[]
  stats: HomeStats
  popularQuizzes: HomeQuizCard[]
  newestQuizzes: HomeQuizCard[]
  containerVariants: ReturnType<typeof staggerContainer>
  itemVariants: typeof fadeUp
  shouldReduce: boolean | null
}) {
  const statsRows = [
    { label: 'Players', value: stats.totalPlayers },
    { label: 'Quizzes', value: stats.totalQuizzes },
    { label: 'Questions', value: stats.totalQuestions },
    { label: 'Categories', value: stats.totalCategories },
  ]
  const maxScore =
    topPlayers.length === 0 ? 1 : Math.max(...topPlayers.map((player) => player.totalScore))

  return (
    <>
      <section className="relative overflow-hidden bg-hero-gradient py-14 md:py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-15" aria-hidden="true" />
        <div
          className={cn(
            'absolute left-8 top-10 h-48 w-48 rounded-full bg-quiz-purple/15 blur-3xl',
            !shouldReduce && 'animate-pulse-slow'
          )}
          aria-hidden="true"
        />
        <div
          className={cn(
            'absolute bottom-0 right-0 h-64 w-64 rounded-full bg-quiz-pink/15 blur-3xl',
            !shouldReduce && 'animate-pulse-slow'
          )}
          aria-hidden="true"
        />

        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <motion.h1
              initial={shouldReduce ? {} : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-extrabold tracking-tight md:text-6xl"
            >
              Play great quizzes <span className="text-quiz-purple-light">right now</span>
            </motion.h1>
            <motion.p
              initial={shouldReduce ? {} : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground md:text-base"
            >
              Trending rounds, fresh uploads, and popular topics — no fluff, just quizzes worth
              opening.
            </motion.p>
            <motion.div
              initial={shouldReduce ? {} : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <Button variant="gradient" size="lg" asChild>
                <Link href="/random-quiz">
                  <Flame className="h-4 w-4" />
                  Play Now
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="bg-background/50">
                <Link href="/categories">
                  Browse Categories
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
            <motion.div
              initial={shouldReduce ? {} : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-3"
            >
              {statsRows.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-full border border-border/60 bg-background/60 px-4 py-2 text-left shadow-sm backdrop-blur"
                >
                  <p className="text-sm font-bold">{formatCompact(stat.value)}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-14">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="🔥 Trending"
            subtitle="The most-played quizzes on the site right now."
            href="/categories"
            linkLabel="Explore all"
          />
          <QuizGrid
            quizzes={popularQuizzes}
            emptyMessage="Popular quizzes will show up here once people start playing."
            containerVariants={containerVariants}
            itemVariants={itemVariants}
          />
        </div>
      </section>

      <section className="py-12 md:py-14">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="✨ Just Added"
            subtitle="Freshly published quizzes ready for a first run."
            href="/categories"
            linkLabel="Browse more"
          />
          <QuizGrid
            quizzes={newestQuizzes}
            emptyMessage="New quizzes will appear here as soon as they are published."
            containerVariants={containerVariants}
            itemVariants={itemVariants}
          />
        </div>
      </section>

      <CategorySection
        featuredCategories={featuredCategories}
        containerVariants={containerVariants}
        itemVariants={itemVariants}
      />

      <TopPlayersSection
        topPlayers={topPlayers}
        maxScore={maxScore}
        containerVariants={containerVariants}
        itemVariants={itemVariants}
      />
    </>
  )
}

function AuthenticatedHomeView({
  currentUser,
  featuredCategories,
  popularQuizzes,
  newestQuizzes,
  personalizedQuizzes,
  containerVariants,
  itemVariants,
}: {
  currentUser: HomeCurrentUser
  featuredCategories: HomeFeaturedCategory[]
  popularQuizzes: HomeQuizCard[]
  newestQuizzes: HomeQuizCard[]
  personalizedQuizzes: HomeQuizCard[]
  containerVariants: ReturnType<typeof staggerContainer>
  itemVariants: typeof fadeUp
}) {
  const displayName = currentUser.name?.trim() || 'quizzer'

  return (
    <>
      <section className="py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-4 rounded-3xl border border-border/60 bg-card/80 p-5 shadow-sm md:flex-row md:items-center md:justify-between md:p-6">
            <div>
              <p className="text-sm font-medium text-quiz-purple-light">Dashboard</p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight md:text-3xl">
                Welcome back, {displayName}! 👋
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="purple" className="px-3 py-1 text-sm">
                🔥 {currentUser.streakDays} day streak
              </Badge>
              <div className="rounded-full border border-quiz-green/30 bg-quiz-green/10 px-3 py-1 text-sm font-medium text-quiz-green">
                ⚡ Level {currentUser.level} · {formatCompact(currentUser.xp)} XP
              </div>
            </div>
          </div>
        </div>
      </section>

      {personalizedQuizzes.length > 0 ? (
        <section className="py-10 md:py-12">
          <div className="container mx-auto px-4">
            <SectionHeader title="For You" subtitle="Based on your activity." />
            <QuizGrid
              quizzes={personalizedQuizzes}
              emptyMessage=""
              containerVariants={containerVariants}
              itemVariants={itemVariants}
            />
          </div>
        </section>
      ) : null}

      <section className="py-10 md:py-12">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="🔥 Trending"
            subtitle="What everyone is playing the most right now."
            href="/categories"
            linkLabel="Explore all"
          />
          <QuizGrid
            quizzes={popularQuizzes}
            emptyMessage="Popular quizzes will show up here once people start playing."
            containerVariants={containerVariants}
            itemVariants={itemVariants}
          />
        </div>
      </section>

      <section className="py-10 md:py-12">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="✨ Just Added"
            subtitle="Recently published quizzes you can jump into next."
            href="/categories"
            linkLabel="Browse more"
          />
          <QuizGrid
            quizzes={newestQuizzes}
            emptyMessage="New quizzes will appear here as soon as they are published."
            containerVariants={containerVariants}
            itemVariants={itemVariants}
          />
        </div>
      </section>

      <CategorySection
        featuredCategories={featuredCategories}
        containerVariants={containerVariants}
        itemVariants={itemVariants}
      />
    </>
  )
}

export function HomePageClient({
  featuredCategories,
  topPlayers,
  stats,
  popularQuizzes,
  newestQuizzes,
  personalizedQuizzes,
  currentUser,
}: HomePageClientProps) {
  const shouldReduce = useReducedMotion()
  const containerVariants = withReducedMotion(staggerContainer(0.08), shouldReduce)
  const itemVariants = withReducedMotion(fadeUp, shouldReduce)

  return (
    <div className="min-h-screen pb-12">
      {currentUser ? (
        <AuthenticatedHomeView
          currentUser={currentUser}
          featuredCategories={featuredCategories}
          popularQuizzes={popularQuizzes}
          newestQuizzes={newestQuizzes}
          personalizedQuizzes={personalizedQuizzes}
          containerVariants={containerVariants}
          itemVariants={itemVariants}
        />
      ) : (
        <GuestHomeView
          featuredCategories={featuredCategories}
          topPlayers={topPlayers}
          stats={stats}
          popularQuizzes={popularQuizzes}
          newestQuizzes={newestQuizzes}
          containerVariants={containerVariants}
          itemVariants={itemVariants}
          shouldReduce={shouldReduce}
        />
      )}
    </div>
  )
}
