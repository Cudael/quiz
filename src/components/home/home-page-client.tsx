'use client'

import Link from 'next/link'
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
      className="container mx-auto space-y-6 px-4 py-6 md:px-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Hero: Insight box (left) + Duel/Daily cards (right) */}
      <motion.div variants={sectionVariants}>
        <div className="grid gap-6 lg:grid-cols-5 lg:items-center">
          <div className="lg:col-span-3">
            <HeroInsightBox currentUser={currentUser} totalQuizCount={totalQuizCount} />
          </div>
          <div className="lg:col-span-2">
            <HeroCards currentUser={currentUser} />
          </div>
        </div>
      </motion.div>

      {/* Quick links */}
      <motion.div variants={sectionVariants}>
        <div className="flex flex-wrap gap-2">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-card px-4 py-2 text-sm font-semibold transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <link.icon className="h-3.5 w-3.5" />
              {link.label}
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Most Popular — featured layout with large + grid */}
      {popularQuizzes.length > 0 && (
        <motion.div variants={sectionVariants}>
          <QuizFeaturedGridSection
            title="⭐ Most Popular"
            subtitle="The all-time crowd favorites"
            quizzes={
              currentUser
                ? personalizedQuizzes.length > 0
                  ? personalizedQuizzes
                  : popularQuizzes
                : popularQuizzes
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
