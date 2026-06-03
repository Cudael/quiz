import Link from 'next/link'
import { BookOpen, Play, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimatedCounter } from './section-primitives'
import type { HomeStats } from '../home-page-client.types'

const STAT_ITEMS = [
  { key: 'players' as const, label: 'players competing' },
  { key: 'quizzes' as const, label: 'quizzes to play' },
  { key: 'questions' as const, label: 'questions to answer' },
  { key: 'categories' as const, label: 'categories to explore' },
]

export function GuestHeroSection({
  stats,
  showStats = true,
}: {
  stats: HomeStats
  showStats?: boolean
}) {
  const baseSectionClasses =
    'relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-primary/8 via-background to-quiz-purple/5 shadow-sm'
  const sectionClasses = showStats
    ? `${baseSectionClasses} px-6 py-10 md:px-12 md:py-14`
    : `${baseSectionClasses} h-full p-8`
  const headingClasses = `text-4xl font-black tracking-tight${showStats ? ' md:text-5xl' : ''}`
  const subtitleClasses = `mt-4 text-base font-medium leading-relaxed text-muted-foreground${showStats ? ' md:text-lg' : ''}`

  const statValues: Record<(typeof STAT_ITEMS)[number]['key'], number> = {
    players: stats.totalPlayers,
    quizzes: stats.totalQuizzes,
    questions: stats.totalQuestions,
    categories: stats.totalCategories,
  }

  return (
    <section className={sectionClasses} aria-label="Welcome to BusQuiz">
      {/* Ambient blobs */}
      <div
        className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-quiz-purple/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-2xl text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
          <Zap className="h-3 w-3" aria-hidden="true" />
          Free to play
        </div>

        <h1 className={headingClasses}>
          Test Your Knowledge.{' '}
          <span className="bg-gradient-to-r from-primary via-quiz-purple to-quiz-pink bg-clip-text text-transparent">
            Challenge the World.
          </span>
        </h1>

        <p className={subtitleClasses}>
          Play hundreds of quizzes across every topic, compete on global leaderboards, and earn
          badges as you level up.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="rounded-2xl font-bold shadow-md">
            <Link href="/categories">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              Browse Quizzes
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-2xl font-bold">
            <Link href="/random-quiz">
              <Play className="h-4 w-4" aria-hidden="true" />
              Play Random
            </Link>
          </Button>
          <Button asChild size="lg" variant="gradient" className="rounded-2xl font-bold shadow-md">
            <Link href="/sign-up">
              <Zap className="h-4 w-4" aria-hidden="true" />
              Sign Up Free
            </Link>
          </Button>
        </div>
      </div>

      {showStats && stats.totalQuizzes > 0 ? (
        <dl className="relative mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STAT_ITEMS.map(({ key, label }) => (
            <div
              key={key}
              className="flex flex-col items-center rounded-2xl border border-border/40 bg-background/60 px-4 py-4 text-center backdrop-blur-sm"
            >
              <dt className="order-2 mt-1 text-xs font-semibold text-muted-foreground">{label}</dt>
              <dd className="order-1 text-2xl font-black tabular-nums text-foreground md:text-3xl">
                <AnimatedCounter value={statValues[key]} />
                {key === 'players' || key === 'quizzes' ? '+' : ''}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  )
}
