'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { fadeUp, staggerContainer, withReducedMotion } from '@/lib/motion'
import type { HomePageClientProps } from './home-page-client.types'
import { CategoryMosaic } from './sections/category-mosaic'
import { DuelInviteCard, JoinCTABanner } from './sections/cta-cards'
import { GuestHeroSection } from './sections/guest-hero-section'
import { HeroDailySection } from './sections/hero-daily-section'
import { LeaderboardSection } from './sections/leaderboard-section'
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

  return (
    <motion.div
      className="container mx-auto space-y-8 px-4 py-8 md:px-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
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

          {recentlyPlayed.length > 0 ? (
            <>
              <Divider />
              <motion.div variants={sectionVariants}>
                <QuizScrollerSection title="Recently Played" quizzes={recentlyPlayed} />
              </motion.div>
            </>
          ) : null}

          <Divider />

          <motion.div variants={sectionVariants}>
            <CategoryMosaic featuredCategories={featuredCategories} />
          </motion.div>

          <Divider />

          <motion.div variants={sectionVariants}>
            <QuizScrollerSection title="Freshly Added" quizzes={newestQuizzes} />
          </motion.div>

          <Divider />

          <motion.div variants={sectionVariants}>
            <LeaderboardSection
              topPlayers={topPlayers}
              stats={stats}
              currentUser={currentUser}
            />
          </motion.div>
        </>
      ) : (
        <>
          <motion.div variants={sectionVariants}>
            <GuestHeroSection stats={stats} />
          </motion.div>

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

          <Divider />

          <motion.div variants={sectionVariants}>
            <LeaderboardSection topPlayers={topPlayers} stats={stats} currentUser={null} />
          </motion.div>
        </>
      )}
    </motion.div>
  )
}
