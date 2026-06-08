'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { fadeUp, staggerContainer, withReducedMotion } from '@/lib/motion'
import type { HomePageClientProps } from './home-page-client.types'
import {
  QuizDenseGridSection,
  QuizScrollerSection,
  CategoryRowSection,
} from './sections/quiz-sections'
import { HeroCards } from './sections/hero-cards'
import { Divider } from './sections/section-primitives'

export type { HomeCurrentUser } from './home-page-client.types'

export function HomePageClient({
  categoriesWithQuizzes,
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
      <motion.div variants={sectionVariants}>
        <HeroCards currentUser={currentUser} />
      </motion.div>

      <Divider />

      {/* Category rows with horizontal scroll — all categories and their quizzes */}
      {categoriesWithQuizzes.map((cat) => (
        <motion.div key={cat.slug} variants={sectionVariants}>
          <CategoryRowSection category={cat} />
        </motion.div>
      ))}

      <Divider />

      {currentUser ? (
        <>
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
        </>
      )}
    </motion.div>
  )
}
