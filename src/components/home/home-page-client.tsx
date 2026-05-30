'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Flame, Trophy } from 'lucide-react'
import { xpProgress } from '@/domain/leveling'
import { fadeUp, staggerContainer, withReducedMotion } from '@/lib/motion'
import type { HomePageClientProps } from './home-page-client.types'
import { CategoryMosaic } from './sections/category-mosaic'
import { DuelInviteCard, JoinCTABanner } from './sections/cta-cards'
import { HeroDailySection } from './sections/hero-daily-section'
import { QuizGridSection, QuizScrollerSection } from './sections/quiz-sections'
import { Divider } from './sections/section-primitives'

export type {
  HomeCurrentUser,
  HomeFeaturedCategory,
  HomeStats,
  HomeTopPlayer,
} from './home-page-client.types'

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
  const xpState = currentUser ? xpProgress(currentUser.xp) : null

  return (
    <motion.div
      className="container mx-auto px-4 py-8 md:px-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0 space-y-8">
          {currentUser ? (
            <>
              <motion.div variants={sectionVariants}>
                <HeroDailySection featuredQuiz={featuredQuiz} currentUser={currentUser} />
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
                  <QuizGridSection
                    title="Countries & Geography"
                    quizzes={loggedInGeographyQuizzes}
                  />
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
                <JoinCTABanner stats={stats} />
              </motion.div>
            </>
          )}
        </div>

        <aside className="hidden flex-col gap-5 lg:sticky lg:top-8 lg:flex lg:self-start">
          {currentUser && xpState ? (
            <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
              <h3 className="mb-3 text-base font-black">Your Progress</h3>
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-black text-primary">
                  Lv.{currentUser.level}
                </span>
                <span className="text-xs font-semibold text-muted-foreground">
                  {currentUser.xp.toLocaleString()} XP
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span>Level progress</span>
                  <span>{Math.round(xpState.pct)}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${xpState.pct}%` }}
                  />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-orange-500">
                <Flame className="h-3.5 w-3.5" />
                {currentUser.streakDays} day streak
              </div>
            </div>
          ) : null}

          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-base font-black">
              <Trophy className="h-4 w-4 text-quiz-yellow" /> Top Players
            </h3>
            {topPlayers.length > 0 ? (
              topPlayers.slice(0, 3).map((player, i) => (
                <div
                  key={player.userId}
                  className="flex items-center gap-2 border-b border-border/20 py-2 last:border-0"
                >
                  <span className="w-5 text-xs font-black">{['🥇', '🥈', '🥉'][i]}</span>
                  <span className="flex-1 truncate text-sm font-semibold">{player.name}</span>
                  <span className="text-xs font-bold text-muted-foreground">
                    {player.totalScore.toLocaleString()} XP
                  </span>
                </div>
              ))
            ) : (
              <p className="py-2 text-sm text-muted-foreground">No players on the board yet.</p>
            )}
            <Link
              href="/leaderboard"
              className="mt-3 flex items-center justify-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-primary/80"
            >
              View Full Leaderboard <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </aside>
      </div>
    </motion.div>
  )
}
