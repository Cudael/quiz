import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About BusQuiz',
  description:
    'Learn about BusQuiz — the platform where you can play, create, and compete in quizzes across every topic imaginable.',
}

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">About BusQuiz</h1>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        BusQuiz is the ultimate destination for quiz lovers and knowledge seekers. Play thousands of
        quizzes across every imaginable category, create your own with our intuitive studio, and
        compete with friends and the global community on real-time leaderboards.
      </p>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Play</h2>
        <p className="text-muted-foreground">
          Dive into quizzes spanning science, history, pop culture, sports, and more. With multiple
          question formats — single choice, multiple choice, fill-in-the-blank, ordering, matching,
          categorize, and label — every quiz feels fresh and challenging.
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-2xl font-semibold">Create</h2>
        <p className="text-muted-foreground">
          Our Quiz Studio gives you everything you need to build and publish your own quizzes. Add
          cover images, set difficulty levels, organize questions, and share your creations with the
          world.
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-2xl font-semibold">Compete</h2>
        <p className="text-muted-foreground">
          Challenge specific friends in head-to-head duels or see how you stack up against the
          worldwide community on our leaderboards. Earn XP, level up, maintain streaks, and collect
          badges as you climb the ranks.
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-2xl font-semibold">Free and Open</h2>
        <p className="text-muted-foreground">
          BusQuiz is free to play, forever. No paywalls, no premium tiers — just pure quiz
          enjoyment. We believe knowledge should be accessible to everyone.
        </p>
      </section>

      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/categories"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Browse quizzes
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/leaderboard"
          className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
        >
          View leaderboard
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
