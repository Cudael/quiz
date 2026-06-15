'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { TrendingUp, Trophy, Layers, Award } from 'lucide-react'
import { fadeUp, staggerContainer, withReducedMotion } from '@/lib/motion'
import type { HomePageClientProps } from './home-page-client.types'
import {
  QuizDenseGridSection,
  QuizScrollerSection,
  CategoryRowSection,
} from './sections/quiz-sections'
import { QuizFeaturedGridSection } from './sections/quiz-featured-grid'
import { HeroInsightBox } from './sections/hero-insight-box'
import { HeroCards } from './sections/hero-cards'
import { BadgeShowcase } from './sections/badge-showcase'
import { Divider } from './sections/section-primitives'

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
}: HomePageClientProps) {
  const shouldReduce = useReducedMotion()
  const containerVariants = withReducedMotion(staggerContainer(0.06), shouldReduce)
  const sectionVariants = withReducedMotion(fadeUp, shouldReduce)

  return (
    <motion.div
      className="container mx-auto space-y-4 px-4 py-6 md:px-6"
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
            <HeroCards currentUser={currentUser} />
          </div>
        </div>
      </motion.div>

      {/* Most Popular — featured layout with large + grid */}
      {popularQuizzes.length > 0 && (
        <motion.div variants={sectionVariants}>
          <QuizFeaturedGridSection
            title="⭐ Most Popular"
            subtitle="The all-time crowd favorites"
            quizzes={
              currentUser && personalizedQuizzes.length >= 3 ? personalizedQuizzes : popularQuizzes
            }
            href="/popular"
          />
        </motion.div>
      )}

      <Divider />

      {/* Trending */}
      <motion.div variants={sectionVariants}>
        <QuizScrollerSection
          title="🔥 Trending Right Now"
          subtitle="The quizzes everyone's buzzing about this week"
          quizzes={trendingQuizzes}
        />
      </motion.div>

      {/* Badge showcase */}
      {badgePreviews.length > 0 && (
        <motion.div variants={sectionVariants}>
          <BadgeShowcase badges={badgePreviews} />
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
        <QuizScrollerSection
          title="✨ Fresh Off the Press"
          subtitle="Brand new quizzes, still shiny"
          quizzes={newestQuizzes}
        />
      </motion.div>

      {/* Recently Played (authenticated only) */}
      {currentUser && recentlyPlayed.length > 0 && (
        <motion.div variants={sectionVariants}>
          <QuizScrollerSection
            title="Your Recent Conquests"
            subtitle="Pick up where you left off"
            quizzes={recentlyPlayed}
          />
        </motion.div>
      )}

      <Divider />

      {/* Hall of Fame */}
      <motion.div variants={sectionVariants}>
        <QuizDenseGridSection
          title="🏅 Hall of Fame"
          subtitle="The greatest quizzes of all time"
          quizzes={popularQuizzes}
          maxItems={12}
        />
      </motion.div>
    </motion.div>
  )
}
