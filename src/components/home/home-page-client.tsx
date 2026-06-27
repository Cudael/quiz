'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { TrendingUp, Trophy, Layers, Award, PenLine } from 'lucide-react'
import { fadeUp, staggerContainer, withReducedMotion } from '@/lib/motion'
import type { HomePageClientProps } from './home-page-client.types'
import { QuizDenseGridSection, CategoryRowSection } from './sections/quiz-sections'
import { QuizFeaturedGridSection } from './sections/quiz-featured-grid'
import { HeroInsightBox } from './sections/hero-insight-box'
import { HeroCards } from './sections/hero-cards'
import { BadgeShowcase } from './sections/badge-showcase'
import { ContinueStreakStrip } from './sections/continue-streak-strip'
import { Divider } from './sections/section-primitives'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export type { HomeCurrentUser } from './home-page-client.types'

const QUICK_LINKS = [
  { label: 'Popular', href: '/popular', icon: TrendingUp },
  { label: 'Trending', href: '/trending', icon: Trophy },
  { label: 'Categories', href: '/categories', icon: Layers },
  { label: 'Badges', href: '/badges', icon: Award },
]

export function HomePageClient({
  categoriesWithQuizzes,
  popularQuizzes,
  trendingQuizzes,
  newestQuizzes,
  personalizedQuizzes,
  recentlyPlayed,
  currentUser,
  badgePreviews,
  totalQuizCount,
  todayChallenge,
}: HomePageClientProps) {
  const shouldReduce = useReducedMotion()
  const containerVariants = withReducedMotion(staggerContainer(0.06), shouldReduce)
  const sectionVariants = withReducedMotion(fadeUp, shouldReduce)

  return (
    <motion.div
      className="container mx-auto space-y-4 px-4 py-6 md:px-6 overflow-x-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Hero: Insight box (left) + Duel/Daily cards (right) */}
      <motion.div variants={sectionVariants}>
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <HeroInsightBox
              currentUser={currentUser}
              totalQuizCount={totalQuizCount}
              quickLinks={QUICK_LINKS}
            />
          </div>
          <div>
            <HeroCards currentUser={currentUser} todayChallenge={todayChallenge} />
          </div>
        </div>
      </motion.div>

      {currentUser && (
        <motion.div variants={sectionVariants}>
          <ContinueStreakStrip
            currentUser={currentUser}
            recommendedQuiz={personalizedQuizzes[0] ?? trendingQuizzes[0] ?? popularQuizzes[0]}
          />
        </motion.div>
      )}

      {currentUser && personalizedQuizzes.length > 0 && (
        <motion.div variants={sectionVariants}>
          <QuizDenseGridSection
            title="Picked for You Quizzes"
            subtitle="Based on the categories you keep coming back to"
            quizzes={personalizedQuizzes}
            href="/categories"
          />
        </motion.div>
      )}

      {/* Most Popular — featured layout with large + grid */}
      {popularQuizzes.length > 0 && (
        <motion.div variants={sectionVariants}>
          <QuizFeaturedGridSection
            title="⭐ Most Popular Quizzes"
            subtitle="The all-time crowd favorites"
            quizzes={popularQuizzes}
            href="/popular"
          />
        </motion.div>
      )}

      <Divider />

      {/* Trending */}
      <motion.div variants={sectionVariants}>
        <QuizDenseGridSection
          title="🔥 Trending Right Now Quizzes"
          subtitle="The quizzes everyone's buzzing about this week"
          quizzes={trendingQuizzes}
        />
      </motion.div>

      {/* Badge showcase */}
      {badgePreviews.length > 0 && (
        <motion.div variants={sectionVariants}>
          <BadgeShowcase badges={badgePreviews} currentUser={currentUser} />
        </motion.div>
      )}

      <Divider />

      {/* Category rows */}
      {categoriesWithQuizzes.map((cat) => (
        <motion.div key={cat.slug} variants={sectionVariants}>
          <CategoryRowSection category={cat} />
        </motion.div>
      ))}

      <Divider />

      {/* Fresh Off the Press */}
      <motion.div variants={sectionVariants}>
        <QuizDenseGridSection
          title="✨ Fresh Off the Press Quizzes"
          subtitle="Brand new quizzes, still shiny"
          quizzes={newestQuizzes}
          href="/newest"
        />
      </motion.div>

      {/* Recently Played (authenticated only) */}
      {currentUser && recentlyPlayed.length > 0 && (
        <motion.div variants={sectionVariants}>
          <QuizDenseGridSection
            title="Your Recent Conquests Quizzes"
            subtitle="Pick up where you left off"
            quizzes={recentlyPlayed}
          />
        </motion.div>
      )}

      <Divider />

      {/* Hall of Fame */}
      <motion.div variants={sectionVariants}>
        <QuizDenseGridSection
          title="🏅 Hall of Fame Quizzes"
          subtitle="The greatest quizzes of all time"
          quizzes={popularQuizzes}
          maxItems={12}
        />
      </motion.div>

      <Divider />

      {/* CTA Banner */}
      <motion.div variants={sectionVariants}>
        <div className="flex flex-col sm:flex-row items-center gap-4 rounded-xl border-2 border-dashed border-quiz-orange/30 bg-quiz-orange/5 p-5">
          <PenLine className="h-8 w-8 shrink-0 text-quiz-orange" />
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-lg font-extrabold tracking-tight">Got a quiz idea?</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Share your knowledge — create a quiz in minutes.
            </p>
          </div>
          <Button asChild size="sm" className="shrink-0 rounded-xl text-sm font-bold">
            <Link href="/studio">Create a Quiz</Link>
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
