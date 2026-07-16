import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  BookOpenCheck,
  Gamepad2,
  Heart,
  PenLine,
  ShieldCheck,
  Sparkles,
  Swords,
  Trophy,
  Users,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageHero } from '@/components/ui/page-hero'
import { prisma } from '@/server/prisma'
import { absoluteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'About BusQuiz',
  description:
    'Learn how BusQuiz helps people discover topics, play quizzes, create original challenges, and compete with friends.',
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
      <PageHero
        eyebrow="About BusQuiz"
        icon={<Sparkles className="h-3.5 w-3.5" aria-hidden="true" />}
        title="Curiosity should feel like play"
        description="BusQuiz is a free quiz and trivia platform for discovering topics, testing what you know, creating original quizzes, and competing with friends."
      >
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-semibold">
          <span className="flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-quiz-purple" />
            {totalQuizzes.toLocaleString()} published quizzes
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-quiz-green" />
            {totalUsers.toLocaleString()} registered players
          </span>
          <span className="flex items-center gap-1.5">
            <Trophy className="h-4 w-4 text-quiz-orange" />
            {totalCategories} categories
          </span>
        </div>
      </PageHero>

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
              text-based and image-based formats, every quiz can offer a different challenge.
              Signed-in play can earn XP, maintain streaks, and unlock badges.
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
              Quiz Studio gives you the tools to build original quizzes in a range of formats. When
              a quiz is ready, submit it for administrator review before it appears publicly.
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
              Challenge friends in live duels, take on daily and survival modes, or see how you
              compare on the leaderboards. Earn XP, level up, and collect achievements.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-quiz-yellow/10">
                <Sparkles className="h-5 w-5 text-quiz-yellow" />
              </div>
              <h2 className="text-xl font-bold">Free to Play</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Browsing and playing BusQuiz is free. An account adds progress tracking, creator
              tools, social features, and personalised practice without changing access to quizzes.
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
              description: 'Answer questions, learn from the review, and track your progress.',
            },
            {
              step: '3',
              title: 'Compete',
              description: 'Challenge friends in duels or climb the global leaderboard.',
            },
            {
              step: '4',
              title: 'Create',
              description: 'Build a quiz and submit it for review by the BusQuiz team.',
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

      <div className="mb-12 grid gap-5 sm:grid-cols-3">
        {[
          {
            icon: Heart,
            title: 'Curiosity first',
            description: 'Make it easy to follow an interest and discover something unexpected.',
          },
          {
            icon: BookOpenCheck,
            title: 'Learn from every answer',
            description: 'Show clear results and useful explanations, not only a final score.',
          },
          {
            icon: ShieldCheck,
            title: 'Publish responsibly',
            description: 'Review community quizzes before publication and make reporting simple.',
          },
        ].map((value) => (
          <div key={value.title} className="rounded-md border bg-card p-5 text-center">
            <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-md bg-quiz-purple/10 text-quiz-purple">
              <value.icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="mt-3 font-bold">{value.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {value.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-12 rounded-md border border-t-4 border-t-quiz-orange bg-card p-8 text-center">
        <h2 className="text-2xl font-extrabold tracking-tight">Our mission</h2>
        <p className="mx-auto mt-3 max-w-xl leading-relaxed text-muted-foreground">
          Make learning playful, social, and easy to return to—whether you have two minutes for a
          random quiz or want to build a detailed challenge of your own.
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
