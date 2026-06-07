'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { fadeUp, staggerContainer, withReducedMotion } from '@/lib/motion'
import type { HomePageClientProps } from './home-page-client.types'
import { ActionBoxesRow, JoinCTABanner } from './sections/cta-cards'
import { GuestHeroSection } from './sections/guest-hero-section'
import { QuizDenseGridSection, QuizScrollerSection } from './sections/quiz-sections'
import { DailyDashboard } from './sections/daily-dashboard'
import { CategoryTiles } from './sections/category-tiles'
import { LeaderboardSection } from './sections/leaderboard-section'
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

  return (
    <motion.div
      className="container mx-auto space-y-6 px-4 py-6 md:px-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {currentUser ? (
        <>
          <motion.div variants={sectionVariants}>
            <DailyDashboard currentUser={currentUser} topPlayers={topPlayers} />
          </motion.div>

          <motion.div variants={sectionVariants}>
            <CategoryTiles categories={featuredCategories} />
          </motion.div>

          <Divider />

          <motion.div variants={sectionVariants}>
            <QuizDenseGridSection
              title="For You"
              quizzes={personalizedQuizzes.length > 0 ? personalizedQuizzes : popularQuizzes}
              maxItems={12}
            />
          </motion.div>

          <Divider />

          <motion.div variants={sectionVariants}>
            <QuizScrollerSection title="Trending Right Now" quizzes={trendingQuizzes} />
          </motion.div>

          <motion.div variants={sectionVariants}>
            <QuizScrollerSection title="Freshly Added" quizzes={newestQuizzes} />
          </motion.div>

          {recentlyPlayed.length > 0 ? (
            <motion.div variants={sectionVariants}>
              <QuizScrollerSection title="Recently Played" quizzes={recentlyPlayed} />
            </motion.div>
          ) : null}

          <Divider />

          <motion.div variants={sectionVariants}>
            <QuizDenseGridSection title="Most Popular" quizzes={popularQuizzes} maxItems={12} />
          </motion.div>
        </>
      ) : (
        <>
          <motion.div variants={sectionVariants}>
            <GuestHeroSection stats={stats} showStats />
          </motion.div>

          <motion.div variants={sectionVariants}>
            <ActionBoxesRow isGuest />
          </motion.div>

          <Divider />

          <motion.div variants={sectionVariants}>
            <QuizDenseGridSection
              title="Most Popular"
              quizzes={popularQuizzes}
              maxItems={12}
              href="/categories"
            />
          </motion.div>

          <Divider />

          <motion.div variants={sectionVariants}>
            <QuizScrollerSection title="Trending Right Now" quizzes={trendingQuizzes} />
          </motion.div>

          <motion.div variants={sectionVariants}>
            <QuizScrollerSection title="Freshly Added" quizzes={newestQuizzes} />
          </motion.div>

          <Divider />

          <motion.div variants={sectionVariants}>
            <JoinCTABanner stats={stats} />
          </motion.div>

          <Divider />

          <motion.div variants={sectionVariants}>
            <LeaderboardSection topPlayers={topPlayers} stats={stats} currentUser={null} />
          </motion.div>
        </>
      )}
    </motion.div>
  )
}
