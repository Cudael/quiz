'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { QuizCard, QuizCardFeatured, type QuizCardData } from '@/components/ui/quiz-card'
import { fadeUp, staggerContainer, withReducedMotion } from '@/lib/motion'
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
  currentUser: HomeCurrentUser | null
}

const leaderboardRanks = ['🥇', '🥈', '🥉', '4.', '5.'] as const
const teaserPositions = [
  'top-0 right-0 rotate-2 z-30 shadow-xl',
  'top-8 right-6 -rotate-1 z-20 shadow-lg',
  'top-16 right-12 rotate-1 z-10 shadow-md',
]

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <Link 
        href={href} 
        className="text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md px-1"
      >
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
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          </div>
          <Link href="/categories" className="text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md px-1">
            See all →
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
            <QuizCard key={quiz.id} quiz={quiz} className="w-64 shrink-0 snap-start focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2" />
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
            <QuizCard key={quiz.id} quiz={quiz} className="w-full focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2" />
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
          {featuredCategories.slice(0, 8).map((category, index) => {
            const isLarge = index === 0
            return (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className={cn(
                  isLarge ? 'col-span-1 sm:col-span-2 md:row-span-2' : 'col-span-1',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-2xl block transition-transform hover:scale-[1.02]'
                )}
              >
                <div
                  style={{
                    background: `linear-gradient(135deg, ${category.color}15, ${category.color}80)`,
                  }}
                  className="relative flex h-full min-h-[8rem] cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-white/10 p-5 shadow-sm"
                >
                  <div 
                    className={cn('leading-none drop-shadow-sm', isLarge ? 'text-5xl' : 'text-3xl')}
                    aria-hidden="true" // Prevents screen readers from reading raw emojis
                  >
                    {category.icon}
                  </div>
                  <div className="mt-4">
                    <div className={cn(isLarge ? 'text-2xl font-black md:text-3xl' : 'text-lg font-bold')}>
                      {category.name}
                    </div>
                    <div className="mt-1.5 line-clamp-2 text-sm opacity-90 font-medium">
                      {category.description || `${category.quizCount} quizzes`}
                    </div>
                    {category.description ? (
                      <div className="mt-1 text-xs opacity-75 font-semibold">
                        {category.quizCount} {category.quizCount === 1 ? 'quiz' : 'quizzes'}
                      </div>
                    ) : null}
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
    <section className="grid gap-6 md:grid-cols-[1fr_300px]">
      <div className="rounded-3xl border bg-card p-6 shadow-sm">
        <h3 className="mb-5 text-xl font-bold tracking-tight">Top Players</h3>
        <div className="space-y-1">
          {topPlayers.slice(0, 5).map((player, index) => (
            <div 
              key={player.userId} 
              className={cn(
                "flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-accent/50",
                index === 0 && "bg-gradient-to-r from-amber-500/10 to-transparent"
              )}
            >
              <span className="w-6 text-center text-base font-bold">{leaderboardRanks[index] ?? `${index + 1}.`}</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold shadow-inner">
                {(player.name || '?').charAt(0).toUpperCase()}
              </div>
              <span className="flex-1 text-sm font-bold">{player.name}</span>
              <span className="text-sm font-semibold text-muted-foreground bg-background px-2 py-1 rounded-md shadow-sm">
                {player.totalScore.toLocaleString()} pts
              </span>
            </div>
          ))}
          {topPlayers.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4 text-center">No players on the board yet.</p>
          ) : null}
        </div>
      </div>

      {currentUser ? (
        <div className="rounded-3xl border border-primary/20 bg-gradient-to-b from-primary/10 to-transparent p-6 shadow-sm">
          <h3 className="font-bold text-lg">Your stats</h3>
          <div className="mt-5 space-y-4 text-sm">
            <div className="flex items-center justify-between rounded-lg bg-background/50 p-3">
              <span className="text-muted-foreground font-medium">Level</span>
              <span className="font-bold text-primary">{currentUser.level}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-background/50 p-3">
              <span className="text-muted-foreground font-medium">Streak</span>
              <span className="font-bold text-orange-500">🔥 {currentUser.streakDays} days</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-background/50 p-3">
              <span className="text-muted-foreground font-medium">XP</span>
              <span className="font-bold">{currentUser.xp.toLocaleString()}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-primary/20 bg-gradient-to-b from-primary/10 to-transparent p-6 text-center shadow-sm flex flex-col justify-center items-center">
          <div className="text-5xl drop-shadow-md mb-2">⚡</div>
          <h3 className="text-xl font-bold tracking-tight">Think you can top this?</h3>
          <p className="mt-2 text-sm text-muted-foreground font-medium">
            Join <span className="text-foreground font-bold">{stats.totalPlayers}</span> players competing globally.
          </p>
          <Button asChild className="mt-6 w-full shadow-md bg-gradient-to-r from-quiz-purple to-quiz-pink hover:opacity-90">
            <Link href="/sign-up">Create Free Account</Link>
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
      <div className="rounded-[2.5rem] bg-[image:var(--background-image-hero-gradient)] px-6 py-12 md:px-12 md:py-16 shadow-lg border border-white/10">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div className="max-w-xl">
            <h1 className="text-4xl font-black tracking-tight md:text-5xl lg:text-6xl leading-tight">
              Play great quizzes <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-quiz-purple to-quiz-pink">
                right now.
              </span>
            </h1>
            <p className="mt-4 text-lg md:text-xl text-muted-foreground font-medium">
              Hundreds of quizzes across every topic. Compete on the leaderboard or create your own.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 items-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-quiz-purple to-quiz-pink hover:opacity-90 shadow-md rounded-xl h-12 px-6 text-base">
                <Link href="/sign-up">Get Started — It's Free</Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="rounded-xl h-12 px-6 text-base bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/80">
                <Link href="/random-quiz">🎲 Instant Play</Link>
              </Button>
            </div>
          </div>

          <div className="relative hidden h-64 md:block perspective-1000">
            {popularQuizzes.slice(0, 3).map((quiz, index) => (
              <div
                key={quiz.id}
                className={cn(
                  'absolute w-56 rounded-2xl border bg-card p-4 shadow-xl transition-transform hover:-translate-y-2 hover:scale-105 duration-300',
                  teaserPositions[index]
                )}
                style={{ borderColor: quiz.category.color, borderTopWidth: 4 }}
              >
                <p className="line-clamp-2 text-sm font-bold leading-tight">{quiz.title}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: quiz.category.color }} />
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{quiz.category.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm font-medium text-muted-foreground bg-accent/30 py-3 px-6 rounded-full w-fit mx-auto">
        <span className="flex items-center gap-1.5"><strong className="text-foreground">{stats.totalQuizzes}</strong> quizzes</span>
        <span className="hidden sm:inline opacity-30">•</span>
        <span className="flex items-center gap-1.5"><strong className="text-foreground">{stats.totalPlayers}</strong> players</span>
        <span className="hidden sm:inline opacity-30">•</span>
        <span className="flex items-center gap-1.5"><strong className="text-foreground">{stats.totalCategories}</strong> categories</span>
      </div>
    </section>
  )
}

function WelcomeBar({ currentUser }: { currentUser: HomeCurrentUser }) {
  const displayName = currentUser.name?.trim() || 'Quizzer'
  const firstName = displayName.split(/\s+/)[0] || 'Quizzer'

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-6 rounded-[2rem] border bg-gradient-to-r from-card to-accent/20 px-8 py-6 shadow-sm">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Welcome back, {firstName}! 👋</h1>
          <div className="mt-3 flex flex-wrap gap-3">
            <span className="rounded-full bg-violet-500/15 px-4 py-1.5 text-sm font-bold text-violet-600 dark:text-violet-400 border border-violet-500/20">
              ⚡ Level {currentUser.level}
            </span>
            <span className="rounded-full bg-orange-500/15 px-4 py-1.5 text-sm font-bold text-orange-600 dark:text-orange-400 border border-orange-500/20">
              🔥 {currentUser.streakDays} day streak
            </span>
            <span className="rounded-full bg-muted/80 px-4 py-1.5 text-sm font-bold text-muted-foreground border border-border">
              {currentUser.xp.toLocaleString()} XP
            </span>
          </div>
        </div>
        <Button asChild size="lg" className="rounded-xl shadow-sm">
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
  const featuredQuiz = popularQuizzes[0] ?? trendingQuizzes[0] ?? null

  return (
    <motion.div
      className="mx-auto max-w-7xl space-y-12 px-4 py-8"
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
            <FeaturedQuizSection title="⭐ Today's Pick" featuredQuiz={featuredQuiz} />
          </motion.div>

          {personalizedQuizzes.length > 0 ? (
            <motion.div variants={sectionVariants}>
              <QuizScrollerSection
                title="For You"
                quizzes={personalizedQuizzes}
                subtitle="Curated based on your recent activity"
              />
            </motion.div>
          ) : null}

          <motion.div variants={sectionVariants}>
            <QuizGridSection
              title="🔥 Trending Right Now"
              quizzes={trendingQuizzes}
              excludeQuizId={featuredQuiz?.id}
            />
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
            <FeaturedQuizSection title="⭐ Editor's Pick" featuredQuiz={featuredQuiz} />
          </motion.div>

          <motion.div variants={sectionVariants}>
            <QuizGridSection
              title="🔥 Trending Globally"
              quizzes={trendingQuizzes}
              excludeQuizId={featuredQuiz?.id}
            />
          </motion.div>

          <motion.div variants={sectionVariants}>
            <QuizScrollerSection title="✨ Freshly Added" quizzes={newestQuizzes} />
          </motion.div>

          <motion.div variants={sectionVariants}>
            <LeaderboardSection topPlayers={topPlayers} stats={stats} currentUser={null} />
          </motion.div>
        </>
      )}
    </motion.div>
  )
}
