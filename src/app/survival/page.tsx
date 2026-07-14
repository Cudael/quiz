import type { Metadata } from 'next'
import { Skull, Trophy } from 'lucide-react'
import { prisma } from '@/server/prisma'
import { absoluteUrl } from '@/lib/site'
import { SurvivalGame } from './survival-game'

export const metadata: Metadata = {
  title: 'Survival Mode',
  description:
    'How long can you last? Answer questions until you get one wrong. One life, no second chances.',
  alternates: { canonical: '/survival' },
  openGraph: {
    title: 'Survival Mode | BusQuiz',
    description: 'One wrong answer and it’s over. How far can you go?',
    url: absoluteUrl('/survival'),
  },
}

export const dynamic = 'force-dynamic'

export default async function SurvivalPage() {
  const [categories, topRuns] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { slug: true, name: true },
    }),
    prisma.survivalRun.findMany({
      where: { correctCount: { gt: 0 } },
      orderBy: [{ correctCount: 'desc' }, { createdAt: 'asc' }],
      take: 10,
      select: {
        id: true,
        correctCount: true,
        guestName: true,
        user: { select: { username: true } },
        category: { select: { name: true } },
      },
    }),
  ])

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 text-center">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-destructive/10 px-4 py-1.5 text-sm font-semibold text-destructive">
          <Skull className="h-4 w-4" />
          Survival Mode
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
          One wrong answer and it&apos;s over
        </h1>
        <p className="mt-2 text-muted-foreground">
          Endless questions, 15 seconds each, one life. How far can you go?
        </p>
      </div>

      <SurvivalGame categories={categories} />

      <div className="mt-10">
        <div className="mb-3 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-quiz-yellow" />
          <h2 className="text-lg font-bold">All-time longest runs</h2>
        </div>
        {topRuns.length === 0 ? (
          <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            No runs yet — set the first record!
          </p>
        ) : (
          <ol className="divide-y rounded-md border bg-card">
            {topRuns.map((run, index) => (
              <li key={run.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                <span className="w-6 text-center font-bold text-muted-foreground">{index + 1}</span>
                <span className="font-medium">
                  {run.user?.username ?? run.guestName ?? 'Guest'}
                </span>
                {run.category ? (
                  <span className="text-xs text-muted-foreground">({run.category.name})</span>
                ) : null}
                <span className="ml-auto font-bold">{run.correctCount} in a row</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}
