import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Gamepad2, PenLine, Swords, Zap, Trophy, Users, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { prisma } from '@/server/prisma'
import { absoluteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'About BusQuiz',
  description:
    'Learn about BusQuiz — the platform where you can play, create, and compete in quizzes across every topic imaginable.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About BusQuiz',
    description:
      'Learn about BusQuiz — the platform where you can play, create, and compete in quizzes.',
    url: absoluteUrl('/about'),
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About BusQuiz',
    description:
      'Learn about BusQuiz — the platform where you can play, create, and compete in quizzes.',
  },
}

export default async function AboutPage() {
  const [totalQuizzes, totalUsers, totalCategories] = await Promise.all([
    prisma.quiz.count({ where: { isPublished: true } }),
    prisma.user.count(),
    prisma.category.count(),
  ])

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10 md:py-16">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">About BusQuiz</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          A growing home for quiz lovers and knowledge seekers. Play, create, and compete across a
          wide range of topics.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm font-semibold">
          <span className="flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-quiz-purple" />
            {totalQuizzes.toLocaleString()} quizzes
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-quiz-green" />
            {totalUsers.toLocaleString()} players
          </span>
          <span className="flex items-center gap-1.5">
            <Trophy className="h-4 w-4 text-quiz-orange" />
            {totalCategories} categories
          </span>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid gap-5 sm:grid-cols-2 mb-12">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-quiz-purple/10">
                <Gamepad2 className="h-5 w-5 text-quiz-purple" />
              </div>
              <h2 className="text-xl font-bold">Play</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Dive into quizzes spanning science, history, pop culture, sports, and more. With
              text-based and image-based formats, every quiz feels fresh and challenging. Earn XP,
              maintain streaks, and collect badges as you learn.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-quiz-green/10">
                <PenLine className="h-5 w-5 text-quiz-green" />
              </div>
              <h2 className="text-xl font-bold">Create</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our Quiz Studio gives you everything you need to build and publish your own quizzes.
              Add cover images, set difficulty levels, organize questions, and share your creations
              with the world.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-quiz-orange/10">
                <Swords className="h-5 w-5 text-quiz-orange" />
              </div>
              <h2 className="text-xl font-bold">Compete</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Challenge friends in real-time head-to-head duels or see how you stack up on global
              leaderboards. Earn XP, level up, and climb the ranks.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-quiz-yellow/10">
                <Sparkles className="h-5 w-5 text-quiz-yellow" />
              </div>
              <h2 className="text-xl font-bold">Free Forever</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              BusQuiz is free to play, forever. No paywalls, no premium tiers — just pure quiz
              enjoyment. We believe knowledge should be accessible to everyone.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* How it Works */}
      <div className="mb-12">
        <h2 className="text-2xl font-extrabold tracking-tight text-center mb-8">How It Works</h2>
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            {
              step: '1',
              title: 'Browse',
              description: 'Find a quiz that interests you from the available topics.',
            },
            {
              step: '2',
              title: 'Play',
              description: 'Answer questions against the clock. Earn XP for correct answers.',
            },
            {
              step: '3',
              title: 'Compete',
              description: 'Challenge friends in duels or climb the global leaderboard.',
            },
            {
              step: '4',
              title: 'Create',
              description: 'Build your own quizzes and share them with the community.',
            },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-sm bg-quiz-orange text-white font-bold text-sm">
                {item.step}
              </div>
              <h3 className="font-bold mb-1">{item.title}</h3>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Our Mission */}
      <div className="rounded-md border bg-muted/30 p-8 text-center mb-12">
        <h2 className="text-2xl font-extrabold tracking-tight mb-3">Our Mission</h2>
        <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
          We believe learning should be fun, social, and accessible. BusQuiz makes it easy to test
          your knowledge, challenge friends, and discover new topics — all for free.
        </p>
      </div>

      {/* CTAs */}
      <div className="flex flex-wrap justify-center gap-4">
        <Button asChild size="lg" variant="accent" className="rounded-md font-bold">
          <Link href="/categories">
            Browse Quizzes
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="rounded-md font-bold">
          <Link href="/duel">
            Start a Duel
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="rounded-md font-bold">
          <Link href="/studio">
            Create a Quiz
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
