'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Play, Trophy, Zap, Users, ArrowRight, Brain, Flame, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CategoryTile } from '@/components/ui/category-tile'
import { Avatar } from '@/components/ui/avatar'
import { ProgressBar } from '@/components/ui/progress-bar'

const FEATURED_CATEGORIES = [
  {
    slug: 'science',
    name: 'Science',
    icon: '🔬',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    description: 'Explore the universe of knowledge',
    quizCount: 24,
  },
  {
    slug: 'history',
    name: 'History',
    icon: '📜',
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    description: 'Journey through time',
    quizCount: 18,
  },
  {
    slug: 'movies',
    name: 'Movies',
    icon: '🎬',
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    description: 'Lights, camera, action!',
    quizCount: 31,
  },
  {
    slug: 'music',
    name: 'Music',
    icon: '🎵',
    color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    description: 'Test your musical knowledge',
    quizCount: 22,
  },
  {
    slug: 'geography',
    name: 'Geography',
    icon: '🌍',
    color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    description: 'Explore the world',
    quizCount: 15,
  },
  {
    slug: 'sports',
    name: 'Sports',
    icon: '⚽',
    color: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    description: 'Champions know it all',
    quizCount: 27,
  },
  {
    slug: 'tech',
    name: 'Technology',
    icon: '💻',
    color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    description: 'Code your way to victory',
    quizCount: 19,
  },
  {
    slug: 'gaming',
    name: 'Gaming',
    icon: '🎮',
    color: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
    description: 'Press start to quiz',
    quizCount: 28,
  },
]

const TOP_PLAYERS = [
  { name: 'Alex Chen', xp: 45200, level: 42, avatar: null, badge: '🏆' },
  { name: 'Sarah Kim', xp: 38900, level: 37, avatar: null, badge: '⚡' },
  { name: 'Marcus Lee', xp: 32100, level: 31, avatar: null, badge: '🔥' },
  { name: 'Priya Patel', xp: 28500, level: 28, avatar: null, badge: '🌟' },
  { name: 'Jake Wilson', xp: 24300, level: 24, avatar: null, badge: '🎯' },
]

const HOW_IT_WORKS = [
  {
    icon: BookOpen,
    title: 'Browse & Choose',
    description:
      'Explore hundreds of quizzes across 10+ categories. Filter by difficulty and mode.',
    color: 'text-quiz-purple',
    bg: 'bg-quiz-purple/10',
  },
  {
    icon: Zap,
    title: 'Play & Compete',
    description: 'Race the clock with timed questions. Earn more points for faster answers.',
    color: 'text-quiz-green',
    bg: 'bg-quiz-green/10',
  },
  {
    icon: Trophy,
    title: 'Rank & Win',
    description: 'Climb the global leaderboard. Earn XP, level up, and unlock exclusive badges.',
    color: 'text-quiz-orange',
    bg: 'bg-quiz-orange/10',
  },
]

const STATS = [
  { label: 'Active Players', value: '12,400+' },
  { label: 'Quizzes', value: '2,800+' },
  { label: 'Questions', value: '45,000+' },
  { label: 'Categories', value: '10+' },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-hero-gradient py-24 md:py-32">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div
          className="absolute top-20 left-10 h-64 w-64 rounded-full bg-quiz-purple/20 blur-3xl animate-pulse-slow"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-quiz-pink/20 blur-3xl animate-pulse-slow"
          aria-hidden="true"
        />

        <div className="container relative mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="purple" className="mb-6 text-sm px-4 py-1.5">
              <Flame className="mr-1 h-3.5 w-3.5" />
              12,400+ players competing right now
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6 text-5xl font-extrabold tracking-tight text-white md:text-7xl lg:text-8xl"
          >
            Test Your{' '}
            <span className="bg-gradient-to-r from-quiz-purple-light via-quiz-pink to-quiz-orange bg-clip-text text-transparent">
              Knowledge
            </span>
            <br />
            <span className="text-white">Win the Crown</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mb-10 max-w-2xl text-lg text-white/80 md:text-xl"
          >
            Play thousands of quizzes, create your own, and compete against players worldwide. Earn
            XP, unlock badges, and climb the leaderboard!
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <Button variant="gradient" size="xl" asChild className="gap-2">
              <Link href="/categories">
                <Play className="h-5 w-5" />
                Play Now — It&apos;s Free!
              </Link>
            </Button>
            <Button
              variant="outline"
              size="xl"
              asChild
              className="border-white/30 text-white hover:bg-white/10 hover:text-white bg-transparent"
            >
              <Link href="/studio">
                Create a Quiz
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4"
          >
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-extrabold text-white md:text-4xl">{stat.value}</p>
                <p className="mt-1 text-sm text-white/60">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-extrabold md:text-4xl">
              Browse{' '}
              <span className="bg-gradient-to-r from-quiz-purple-light to-quiz-pink bg-clip-text text-transparent">
                Categories
              </span>
            </h2>
            <p className="mt-3 text-muted-foreground">
              From science to pop culture — we&apos;ve got you covered
            </p>
          </div>
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
          >
            {FEATURED_CATEGORIES.map((cat) => (
              <motion.div key={cat.slug} variants={item}>
                <CategoryTile {...cat} />
              </motion.div>
            ))}
          </motion.div>
          <div className="mt-8 text-center">
            <Button variant="outline" size="lg" asChild>
              <Link href="/categories">
                View all categories
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-extrabold md:text-4xl">
              How It{' '}
              <span className="bg-gradient-to-r from-quiz-green to-quiz-blue bg-clip-text text-transparent">
                Works
              </span>
            </h2>
            <p className="mt-3 text-muted-foreground">Three simple steps to quiz glory</p>
          </div>
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            className="grid gap-8 md:grid-cols-3"
          >
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div key={step.title} variants={item}>
                <Card className="relative overflow-hidden border-border/50 hover:border-border hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-8 text-center">
                    <div
                      className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${step.bg}`}
                    >
                      <step.icon className={`h-8 w-8 ${step.color}`} />
                    </div>
                    <div className="absolute top-4 right-4 text-4xl font-extrabold text-muted/30">
                      {i + 1}
                    </div>
                    <h3 className="mb-3 text-xl font-bold">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Top Players */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-extrabold md:text-4xl">
              Top{' '}
              <span className="bg-gradient-to-r from-quiz-orange to-quiz-yellow bg-clip-text text-transparent">
                Players
              </span>
            </h2>
            <p className="mt-3 text-muted-foreground">This week&apos;s champions</p>
          </div>
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            className="mx-auto max-w-2xl space-y-3"
          >
            {TOP_PLAYERS.map((player, i) => (
              <motion.div key={player.name} variants={item}>
                <Card className="border-border/50 hover:border-border hover:shadow-md transition-all duration-200">
                  <CardContent className="flex items-center gap-4 p-4">
                    <span className="w-8 text-center text-lg font-bold text-muted-foreground">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </span>
                    <Avatar fallback={player.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold truncate">{player.name}</p>
                        <span className="text-sm">{player.badge}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">Level {player.level}</span>
                        <ProgressBar
                          value={player.xp % 1000}
                          max={1000}
                          size="sm"
                          variant="gradient"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-quiz-purple-light">
                        {player.xp.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">XP</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
          <div className="mt-8 text-center">
            <Button variant="outline" size="lg" asChild>
              <Link href="/leaderboard">
                <Trophy className="mr-2 h-4 w-4" />
                View Full Leaderboard
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" aria-hidden="true" />
        <div className="container relative mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 text-5xl" aria-hidden="true">
              🧠
            </div>
            <h2 className="mb-4 text-3xl font-extrabold text-white md:text-5xl">
              Ready to prove your worth?
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-white/80 text-lg">
              Join thousands of players competing daily. No account needed to start!
            </p>
            <Button variant="gradient" size="xl" asChild>
              <Link href="/categories">
                <Zap className="mr-2 h-5 w-5" />
                Start Playing Free
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-1">
              <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-quiz-purple to-quiz-pink">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <span className="bg-gradient-to-r from-quiz-purple-light to-quiz-pink bg-clip-text text-transparent">
                  QuizMaster
                </span>
              </Link>
              <p className="text-sm text-muted-foreground">
                The fun, fast, and free quiz platform for curious minds everywhere.
              </p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Play</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/categories" className="hover:text-foreground transition-colors">
                    Browse Categories
                  </Link>
                </li>
                <li>
                  <Link href="/play/daily" className="hover:text-foreground transition-colors">
                    Daily Challenge
                  </Link>
                </li>
                <li>
                  <Link href="/leaderboard" className="hover:text-foreground transition-colors">
                    Leaderboard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Create</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/studio" className="hover:text-foreground transition-colors">
                    Quiz Studio
                  </Link>
                </li>
                <li>
                  <Link href="/studio/new" className="hover:text-foreground transition-colors">
                    New Quiz
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">About</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/about" className="hover:text-foreground transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-foreground transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-border pt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-between text-sm text-muted-foreground">
            <p>© 2024 QuizMaster. Made with ❤️ for curious minds.</p>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>12,400+ active players</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
