import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { cache } from 'react'
import { CalendarDays, CheckCircle2, Flame, Users, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'
import { getDailyQuiz as getDailyQuizUncached, getDailyKey } from '@/server/daily'
import { absoluteUrl } from '@/lib/site'
import { getQuizPath } from '@/lib/quiz-url'

const getDailyQuiz = cache(getDailyQuizUncached)

export async function generateMetadata(): Promise<Metadata> {
  const daily = await getDailyQuiz()
  if (!daily) {
    return {
      title: 'Daily Quiz',
      description:
        'One quiz, once a day, for everyone. Play today’s daily quiz and see how you stack up.',
      alternates: { canonical: '/daily' },
    }
  }

  const title = `Daily Quiz — ${daily.quiz.title}`
  const description = `Today's daily quiz: ${daily.quiz.title} (${daily.quiz.category.name}). One quiz, once a day, same for everyone — see how you stack up.`

  return {
    title,
    description,
    alternates: { canonical: '/daily' },
    openGraph: {
      title,
      description,
      url: absoluteUrl('/daily'),
      images: daily.quiz.coverImage ? [daily.quiz.coverImage] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export const dynamic = 'force-dynamic'

const difficultyVariant: Record<string, 'success' | 'warning' | 'destructive'> = {
  EASY: 'success',
  MEDIUM: 'warning',
  HARD: 'destructive',
}

function startOfUtcDay(key: string): Date {
  return new Date(`${key}T00:00:00.000Z`)
}

export default async function DailyQuizPage() {
  const [session, daily] = await Promise.all([auth(), getDailyQuiz()])

  if (!daily) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-3xl font-extrabold">Daily Quiz</h1>
        <p className="mt-3 text-muted-foreground">
          No daily quiz is available yet. Check back soon!
        </p>
      </div>
    )
  }

  const todayStart = startOfUtcDay(daily.date)
  const userId = session?.user?.id ?? null

  const [playerCount, viewerSession, topSessions] = await Promise.all([
    prisma.playSession.count({
      where: { mode: 'DAILY', quizId: daily.quiz.id, createdAt: { gte: todayStart } },
    }),
    userId
      ? prisma.playSession.findFirst({
          where: {
            mode: 'DAILY',
            quizId: daily.quiz.id,
            userId,
            createdAt: { gte: todayStart },
          },
          orderBy: { createdAt: 'asc' },
          select: { id: true, score: true, correctCount: true, totalCount: true },
        })
      : null,
    prisma.playSession.findMany({
      where: {
        mode: 'DAILY',
        quizId: daily.quiz.id,
        createdAt: { gte: todayStart },
        userId: { not: null },
      },
      orderBy: [{ score: 'desc' }, { timeTakenMs: 'asc' }],
      take: 10,
      select: {
        id: true,
        score: true,
        correctCount: true,
        totalCount: true,
        user: { select: { username: true } },
      },
    }),
  ])

  const alreadyPlayed = Boolean(viewerSession)
  const dateLabel = new Date(`${daily.date}T12:00:00.000Z`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      {/* Hero */}
      <div className="mb-8 text-center">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-quiz-purple/10 px-4 py-1.5 text-sm font-semibold text-quiz-purple">
          <CalendarDays className="h-4 w-4" />
          {dateLabel}
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">Daily Quiz</h1>
        <p className="mt-2 text-muted-foreground">
          One quiz, once a day, same for everyone. Come back tomorrow for a fresh one!
        </p>
      </div>

      {/* Quiz card */}
      <div className="overflow-hidden rounded-md border bg-card">
        <div className="relative h-40 w-full">
          {daily.quiz.coverImage ? (
            <Image
              src={daily.quiz.coverImage}
              alt={`${daily.quiz.title} cover image`}
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          ) : (
            <div
              className="h-full w-full"
              style={{
                background: `linear-gradient(135deg, ${daily.quiz.category.color} 0%, hsl(var(--foreground)) 100%)`,
              }}
            />
          )}
        </div>
        <div className="p-5 sm:p-6">
          <div className="mb-2 flex flex-wrap gap-1.5">
            <Badge variant="purple">{daily.quiz.category.name}</Badge>
            <Badge variant={difficultyVariant[daily.quiz.difficulty] ?? 'outline'}>
              {daily.quiz.difficulty}
            </Badge>
            <Badge variant="outline">{daily.quiz.questionCount} questions</Badge>
          </div>
          <h2 className="text-xl font-extrabold">{daily.quiz.title}</h2>
          {daily.quiz.description ? (
            <p className="mt-1.5 text-sm text-muted-foreground">{daily.quiz.description}</p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {alreadyPlayed && viewerSession ? (
              <>
                <div className="inline-flex items-center gap-2 rounded-md bg-quiz-green/10 px-4 py-2 text-sm font-semibold text-quiz-green">
                  <CheckCircle2 className="h-4 w-4" />
                  Done for today — {viewerSession.correctCount}/{viewerSession.totalCount} correct ·{' '}
                  {viewerSession.score} pts
                </div>
                <Button asChild variant="outline">
                  <Link href={getQuizPath({ id: daily.quiz.id, slug: daily.quiz.slug })}>
                    View quiz
                  </Link>
                </Button>
              </>
            ) : (
              <Button asChild size="lg" variant="accent" className="font-bold">
                <Link href={`/play/${daily.quiz.id}?mode=daily`}>
                  <Zap className="mr-2 h-5 w-5" />
                  Play today&apos;s quiz
                </Link>
              </Button>
            )}
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              {playerCount} played today
            </span>
          </div>
        </div>
      </div>

      {/* Today's board */}
      <div className="mt-8">
        <div className="mb-3 flex items-center gap-2">
          <Flame className="h-5 w-5 text-quiz-orange" />
          <h2 className="text-lg font-bold">Today&apos;s top players</h2>
        </div>
        {topSessions.length === 0 ? (
          <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            No one has played yet — be the first on the board!
          </p>
        ) : (
          <ol className="divide-y rounded-md border bg-card">
            {topSessions.map((entry, index) => (
              <li key={entry.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                <span className="w-6 text-center font-bold text-muted-foreground">{index + 1}</span>
                {entry.user?.username ? (
                  <Link href={`/u/${entry.user.username}`} className="font-medium hover:underline">
                    @{entry.user.username}
                  </Link>
                ) : (
                  <span className="font-medium">{entry.user?.username ?? 'Player'}</span>
                )}
                <span className="ml-auto text-muted-foreground">
                  {entry.correctCount}/{entry.totalCount}
                </span>
                <span className="w-16 text-right font-bold">{entry.score} pts</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        A new quiz drops at midnight UTC ({getDailyKey()} today).
      </p>
    </div>
  )
}
