import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { prisma } from '@/server/prisma'
import { absoluteUrl } from '@/lib/site'

const BADGE_EMOJIS: Record<string, string> = {
  'first-win': '🏆',
  'perfect-score': '💯',
  'streak-7': '🔥',
  'streak-30': '🌟',
  'quiz-author': '✏️',
  'category-master-science': '🔬',
  'speed-demon': '⚡',
  'night-owl': '🦉',
  centurion: '💎',
  'daily-devotee': '📅',
}

export const metadata: Metadata = {
  title: 'Earn Badges',
  description:
    'Play quizzes, build streaks, and unlock achievements. See all available badges on BusQuiz.',
  alternates: { canonical: '/badges' },
  openGraph: {
    title: 'Earn Badges — BusQuiz',
    description: 'Play quizzes, build streaks, and unlock achievements.',
    url: absoluteUrl('/badges'),
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Earn Badges — BusQuiz',
    description: 'Play quizzes, build streaks, and unlock achievements.',
  },
}

export default async function BadgesPage() {
  const badges = await prisma.badge.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      _count: { select: { awards: true } },
    },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="container mx-auto px-4 py-10 md:px-6 md:py-16">
      <PageHeader
        eyebrow="Achievements"
        accent="purple"
        back={
          <Button variant="ghost" asChild className="-ml-2">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        }
        title="Earn Badges"
        description="Play quizzes, build streaks, and unlock achievements. Complete challenges to collect them all and show off your quiz mastery."
      />

      {badges.length === 0 ? (
        <div className="rounded-md border border-dashed bg-accent/20 p-12 text-center">
          <p className="text-muted-foreground">Badges coming soon!</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {badges.map((badge) => {
            const emoji = BADGE_EMOJIS[badge.slug] ?? '🎖️'

            return (
              <div
                key={badge.id}
                className="group flex items-start gap-4 rounded-md border border-border/50 bg-card p-5 transition-all duration-200 hover:border-quiz-purple/30 hover:shadow-md"
              >
                <span className="text-4xl shrink-0" aria-hidden="true">
                  {emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-bold tracking-tight">{badge.name}</h2>
                  <p className="mt-1 text-sm text-foreground/70 leading-relaxed">
                    {badge.description}
                  </p>
                  <p className="mt-2 text-xs text-foreground/50">
                    {badge._count.awards > 0
                      ? `${badge._count.awards.toLocaleString()} ${badge._count.awards === 1 ? 'player has' : 'players have'} earned this`
                      : 'No one has earned this yet — be the first!'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-12 rounded-md border bg-muted/30 p-6 text-center">
        <p className="text-sm text-foreground/70">
          Want to earn badges?{' '}
          <Link href="/categories" className="font-semibold text-primary hover:underline">
            Browse quizzes
          </Link>{' '}
          and start playing!
        </p>
      </div>
    </div>
  )
}
