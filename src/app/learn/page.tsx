import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Lightbulb,
  Newspaper,
  PenLine,
  GraduationCap,
  ArrowRight,
  Brain,
  Puzzle,
  Target,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { absoluteUrl } from '@/lib/site'
import { getAllBlogPosts } from '@/content/blog-posts'

export const metadata: Metadata = {
  title: 'Learn | BusQuiz',
  description:
    'Expand your knowledge with quizzes, trivia facts, and blog articles. The smarter way to learn.',
  alternates: { canonical: '/learn' },
  openGraph: {
    title: 'Learn with BusQuiz',
    description: 'Quizzes, trivia facts, and educational content that make learning addictive.',
    url: absoluteUrl('/learn'),
  },
}

const LEARNING_PATHS = [
  {
    emoji: '🧠',
    title: 'Memory & Recall',
    description:
      'Quizzes are scientifically proven to improve memory retention. Practice active recall with our growing library.',
    link: '/categories',
    linkLabel: 'Start practicing',
    color: 'quiz-purple',
  },
  {
    emoji: '🎯',
    title: 'Targeted Practice',
    description:
      'Focus on specific topics or difficulty levels. Master one subject at a time with curated collections.',
    link: '/collections',
    linkLabel: 'Browse collections',
    color: 'quiz-green',
  },
  {
    emoji: '📊',
    title: 'Track Your Growth',
    description:
      'See your scores improve over time. Level up, earn badges, and watch your knowledge expand.',
    link: '/profile',
    linkLabel: 'View your profile',
    color: 'quiz-blue',
  },
  {
    emoji: '⚡',
    title: 'Spaced Repetition',
    description:
      'Coming back regularly helps cement knowledge. Our challenges and streaks keep you coming back.',
    link: '/challenges',
    linkLabel: 'Take a challenge',
    color: 'quiz-orange',
  },
]

const QUICK_TIPS = [
  {
    icon: Brain,
    title: 'Active Recall beats passive review',
    description:
      "Testing yourself is 2-3x more effective than re-reading notes. That''s exactly what quizzes do.",
  },
  {
    icon: Target,
    title: 'Focus on one topic at a time',
    description:
      'Use our category filters to drill deep into one subject before moving to the next.',
  },
  {
    icon: Puzzle,
    title: 'Mix difficulty levels',
    description:
      'Start with easy quizzes to build confidence, then tackle medium and hard ones as you improve.',
  },
  {
    icon: Zap,
    title: 'Stay consistent with streaks',
    description:
      'Even 5 minutes of quizzing daily builds more knowledge than cramming for an hour once a week.',
  },
]

export default function LearnPage() {
  const blogPosts = getAllBlogPosts().slice(0, 3)

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10 md:py-16">
      {/* Hero */}
      <div className="mb-12 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-bold text-muted-foreground">
          <GraduationCap className="h-3.5 w-3.5" />
          Learning Hub
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Learn Smarter</h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Quizzing is one of the most effective ways to learn. Discover how to use BusQuiz to master
          any subject — one question at a time.
        </p>
      </div>

      {/* Learning Paths */}
      <div className="mb-12">
        <h2 className="mb-5 text-2xl font-black tracking-tight">Your Learning Paths</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {LEARNING_PATHS.map((path) => (
            <Link
              key={path.title}
              href={path.link}
              className="group flex flex-col gap-4 rounded-2xl border border-border/50 bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-2xl">
                  {path.emoji}
                </span>
                <div>
                  <h3 className="text-lg font-bold">{path.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    {path.description}
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 self-start text-sm font-bold text-primary transition-colors group-hover:text-primary/80">
                {path.linkLabel}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="mb-12">
        <h2 className="mb-5 text-2xl font-black tracking-tight">Science-Backed Study Tips</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {QUICK_TIPS.map((tip) => (
            <div
              key={tip.title}
              className="flex gap-4 rounded-xl border border-border/40 bg-card p-5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <tip.icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-sm font-bold">{tip.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {tip.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Blog preview */}
      {blogPosts.length > 0 && (
        <div className="mb-12">
          <div className="mb-5 flex items-end justify-between">
            <h2 className="text-2xl font-black tracking-tight">From the Blog</h2>
            <Link
              href="/blog"
              className="flex items-center gap-1 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {blogPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col rounded-xl border border-border/50 bg-card p-5 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
              >
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
                  <Newspaper className="h-3 w-3" />
                  Article
                </span>
                <h3 className="mt-3 text-sm font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {post.description}
                </p>
                <p className="mt-auto pt-3 text-[10px] text-muted-foreground/60">
                  {new Date(post.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-quiz-purple/5 to-quiz-pink/5 p-6 text-center">
          <Lightbulb className="mx-auto h-8 w-8 text-quiz-purple" />
          <h2 className="mt-3 text-lg font-black">Trivia Facts</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Discover fascinating facts that make you the most interesting person in the room.
          </p>
          <Button asChild variant="outline" className="mt-4 rounded-xl">
            <Link href="/trivia-facts">
              Explore Facts <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-quiz-green/5 to-quiz-blue/5 p-6 text-center">
          <PenLine className="mx-auto h-8 w-8 text-quiz-green" />
          <h2 className="mt-3 text-lg font-black">Create a Quiz</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Teaching others is one of the best ways to learn. Build your own quiz and share it.
          </p>
          <Button asChild className="mt-4 rounded-xl font-bold" variant="gradient-green">
            <Link href="/studio">
              Quiz Studio <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
