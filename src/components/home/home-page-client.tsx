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
      {/* Welcome banner */}
      <motion.div variants={sectionVariants}>
        <div className="rounded-2xl border border-border/40 bg-gradient-to-r from-primary/5 via-transparent to-quiz-purple/5 px-6 py-4">
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
            {currentUser
              ? `Welcome back! Ready to flex those brain muscles? 💪`
              : 'Thousands of quizzes. Zero boredom. 🧠'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {currentUser
              ? 'Pick up where you left off or try something new.'
              : 'Test your knowledge, challenge friends, and climb the leaderboard.'}
          </p>
        </div>
      </motion.div>

      <motion.div variants={sectionVariants}>
        <HeroCards currentUser={currentUser} />
      </motion.div>

      {/* Stats bar */}
      <motion.div variants={sectionVariants}>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-xl border border-border/30 bg-muted/30 px-4 py-3 text-center text-sm">
          <span className="font-semibold text-foreground">🎯 2,500+ quizzes</span>
          <span className="text-muted-foreground">·</span>
          <span className="font-semibold text-foreground">👥 50,000+ players</span>
          <span className="text-muted-foreground">·</span>
          <span className="font-semibold text-foreground">💡 1M+ questions answered</span>
        </div>
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
              title="Picked Just for You"
              subtitle="Because we know your taste"
              quizzes={personalizedQuizzes.length > 0 ? personalizedQuizzes : popularQuizzes}
              maxItems={12}
            />
          </motion.div>

          <Divider />

          <motion.div variants={sectionVariants}>
            <QuizScrollerSection
              title="What's Hot Right Now"
              subtitle="The quizzes everyone's buzzing about this week"
              quizzes={trendingQuizzes}
            />
          </motion.div>

          <motion.div variants={sectionVariants}>
            <QuizScrollerSection
              title="Fresh Off the Press"
              subtitle="Brand new quizzes, still shiny ✨"
              quizzes={newestQuizzes}
            />
          </motion.div>

          {recentlyPlayed.length > 0 ? (
            <motion.div variants={sectionVariants}>
              <QuizScrollerSection
                title="Your Recent Conquests"
                subtitle="Pick up where you left off"
                quizzes={recentlyPlayed}
              />
            </motion.div>
          ) : null}

          <Divider />

          <motion.div variants={sectionVariants}>
            <QuizDenseGridSection
              title="Hall of Fame"
              subtitle="The all-time crowd favorites"
              quizzes={popularQuizzes}
              maxItems={12}
            />
          </motion.div>
        </>
      ) : (
        <>
          <motion.div variants={sectionVariants}>
            <QuizDenseGridSection
              title="Hall of Fame"
              subtitle="The all-time crowd favorites"
              quizzes={popularQuizzes}
              maxItems={12}
              href="/categories"
            />
          </motion.div>

          <Divider />

          <motion.div variants={sectionVariants}>
            <QuizScrollerSection
              title="What's Hot Right Now"
              subtitle="The quizzes everyone's buzzing about this week"
              quizzes={trendingQuizzes}
            />
          </motion.div>

          <motion.div variants={sectionVariants}>
            <QuizScrollerSection
              title="Fresh Off the Press"
              subtitle="Brand new quizzes, still shiny ✨"
              quizzes={newestQuizzes}
            />
          </motion.div>
        </>
      )}
    </motion.div>
  )
}
