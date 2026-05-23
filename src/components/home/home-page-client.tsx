'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { QuizCard, QuizCardFeatured, type QuizCardData } from '@/components/ui/quiz-card'
import { fadeUp, staggerContainer, withReducedMotion } from '@/lib/motion'
import { cn } from '@/lib/utils'

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
  currentUser: HomeCurrentUser | null
}

const leaderboardRanks = ['🥇', '🥈', '🥉', '4.', '5.'] as const
const teaserPositions = [
  'top-0 right-0 rotate-2 z-30',
  'top-8 right-6 -rotate-1 z-20',
  'top-16 right-12 rotate-1 z-10',
]

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-xl font-bold">{title}</h2>
      <Link href={href} className="text-sm text-primary">
        See all →
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
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <Link href="/categories" className="text-sm text-primary">
            See all →
          </Link>
        </div>
      ) : (
        <SectionHeader title={title} href="/categories" />
      )}
      {quizzes.length > 0 ? (
        <div
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3"
          aria-label={`${title} quizzes`}
          style={{ scrollbarWidth: 'none' }}
        >
          {quizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} className="w-64 shrink-0 snap-start" />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
          Quizzes will appear here soon.
        </div>
      )}
    </section>
  )
}

function QuizGridSection({ title, quizzes }: { title: string; quizzes: QuizCardData[] }) {
  return (
    <section>
      <SectionHeader title={title} href="/categories" />
      {quizzes.length > 0 ? (
        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          aria-label={`${title} quizzes`}
        >
          {quizzes.slice(0, 6).map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} className="w-full" />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
          Quizzes will appear here soon.
        </div>
      )}
    </section>
  )
}

function FeaturedQuizSection({
  title,
  popularQuizzes,
  trendingQuizzes,
}: {
  title: string
  popularQuizzes: QuizCardData[]
  trendingQuizzes: QuizCardData[]
}) {
  const featuredQuiz = popularQuizzes[0] ?? trendingQuizzes[0]

  return (
    <section>
      <SectionHeader title={title} href="/categories" />
      {featuredQuiz ? (
        <QuizCardFeatured quiz={featuredQuiz} />
      ) : (
        <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
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
                className={cn(isLarge ? 'col-span-2 row-span-2' : 'col-span-1')}
              >
                <div
                  style={{
                    background: `linear-gradient(135deg, ${category.color}22, ${category.color}88)`,
                  }}
                  className="relative flex min-h-28 cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-white/10 p-4 transition-all hover:scale-[1.02]"
                >
                  <div className={cn('leading-none', isLarge ? 'text-4xl' : 'text-2xl')}>
                    {category.icon}
                  </div>
                  <div>
                    <div
                      className={cn(
                        isLarge ? 'text-xl font-black md:text-2xl' : 'text-sm font-bold'
                      )}
                    >
                      {category.name}
                    </div>
                    <div className="mt-1 line-clamp-2 text-xs opacity-80">
                      {isLarge ? category.description : `${category.quizCount} quizzes`}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
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
    <section className="grid gap-4 md:grid-cols-[1fr_280px]">
      <div className="rounded-2xl border bg-card p-5">
        <h3 className="mb-4 text-lg font-bold">Top Players</h3>
        {topPlayers.slice(0, 5).map((player, index) => (
          <div key={player.userId} className="flex items-center gap-3 py-2">
            <span className="w-6 text-sm">{leaderboardRanks[index] ?? `${index + 1}.`}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold">
              {(player.name || '?').charAt(0).toUpperCase()}
            </div>
            <span className="flex-1 text-sm font-medium">{player.name}</span>
            <span className="text-xs text-muted-foreground">
              {player.totalScore.toLocaleString()} pts
            </span>
          </div>
        ))}
        {topPlayers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No players on the board yet.</p>
        ) : null}
      </div>

      {currentUser ? (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
          <h3 className="font-bold">Your stats</h3>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Level</span>
              <span className="font-semibold">{currentUser.level}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Streak</span>
              <span className="font-semibold">{currentUser.streakDays} days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">XP</span>
              <span className="font-semibold">{currentUser.xp.toLocaleString()}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
          <div className="text-3xl">⚡</div>
          <h3 className="mt-2 font-bold">Think you can top this?</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {stats.totalPlayers} players competing
          </p>
          <Button asChild className="mt-4 w-full">
            <Link href="/random-quiz">Start playing</Link>
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
  return (
    <section>
      <div className="rounded-3xl bg-[image:var(--background-image-hero-gradient)] px-8 py-10">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <h1 className="text-4xl font-black tracking-tight md:text-5xl">
              Play great quizzes right now
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Hundreds of quizzes across every topic.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/random-quiz">🎲 Play random quiz</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/categories">Browse categories</Link>
              </Button>
            </div>
          </div>

          <div className="relative hidden h-44 md:block">
            {popularQuizzes.slice(0, 3).map((quiz, index) => (
              <div
                key={quiz.id}
                className={cn(
                  'absolute w-48 rounded-xl border bg-card p-3 shadow-lg',
                  teaserPositions[index]
                )}
                style={{ borderColor: quiz.category.color, borderTopWidth: 3 }}
              >
                <p className="line-clamp-2 text-sm font-semibold">{quiz.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{quiz.category.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center text-sm text-muted-foreground">
        <span>{stats.totalQuizzes} quizzes</span>
        <span className="px-2">·</span>
        <span>{stats.totalPlayers} players</span>
        <span className="px-2">·</span>
        <span>{stats.totalCategories} categories</span>
        <span className="px-2">·</span>
        <span>{stats.totalQuestions} questions</span>
      </div>
    </section>
  )
}

function WelcomeBar({ currentUser }: { currentUser: HomeCurrentUser }) {
  const displayName = currentUser.name?.trim() || 'Quizzer'
  const firstName = displayName.split(/\s+/)[0] || 'Quizzer'

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card px-6 py-5">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {firstName}! 👋</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-full bg-violet-500/10 px-3 py-1 text-sm font-medium text-violet-500">
              ⚡ Level {currentUser.level}
            </span>
            <span className="rounded-full bg-orange-500/10 px-3 py-1 text-sm font-medium text-orange-500">
              🔥 {currentUser.streakDays} day streak
            </span>
            <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
              {currentUser.xp.toLocaleString()} XP
            </span>
          </div>
        </div>
        <Button asChild>
          <Link href="/random-quiz">Continue playing →</Link>
        </Button>
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
  currentUser,
}: HomePageClientProps) {
  const shouldReduce = useReducedMotion()
  const containerVariants = withReducedMotion(staggerContainer(0.06), shouldReduce)
  const sectionVariants = withReducedMotion(fadeUp, shouldReduce)

  return (
    <motion.div
      className="mx-auto max-w-7xl space-y-8 px-4 py-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {currentUser ? (
        <>
          <motion.div variants={sectionVariants}>
            <WelcomeBar currentUser={currentUser} />
          </motion.div>

          <motion.div variants={sectionVariants}>
            <FeaturedQuizSection
              title="⭐ Today's Pick"
              popularQuizzes={popularQuizzes}
              trendingQuizzes={trendingQuizzes}
            />
          </motion.div>

          {personalizedQuizzes.length > 0 ? (
            <motion.div variants={sectionVariants}>
              <QuizScrollerSection
                title="For You"
                quizzes={personalizedQuizzes}
                subtitle="Based on your activity"
              />
            </motion.div>
          ) : null}

          <motion.div variants={sectionVariants}>
            <QuizGridSection title="🔥 Trending" quizzes={trendingQuizzes} />
          </motion.div>

          <motion.div variants={sectionVariants}>
            <QuizScrollerSection title="✨ Just Added" quizzes={newestQuizzes} />
          </motion.div>

          <motion.div variants={sectionVariants}>
            <CategoryMosaic featuredCategories={featuredCategories} />
          </motion.div>
        </>
      ) : (
        <>
          <motion.div variants={sectionVariants}>
            <GuestHero popularQuizzes={popularQuizzes} stats={stats} />
          </motion.div>

          <motion.div variants={sectionVariants}>
            <CategoryMosaic featuredCategories={featuredCategories} />
          </motion.div>

          <motion.div variants={sectionVariants}>
            <FeaturedQuizSection
              title="⭐ Featured Quiz"
              popularQuizzes={popularQuizzes}
              trendingQuizzes={trendingQuizzes}
            />
          </motion.div>

          <motion.div variants={sectionVariants}>
            <QuizGridSection title="🔥 Trending" quizzes={trendingQuizzes} />
          </motion.div>

          <motion.div variants={sectionVariants}>
            <QuizScrollerSection title="✨ Just Added" quizzes={newestQuizzes} />
          </motion.div>

          <motion.div variants={sectionVariants}>
            <LeaderboardSection topPlayers={topPlayers} stats={stats} currentUser={null} />
          </motion.div>
        </>
      )}
    </motion.div>
  )
}
