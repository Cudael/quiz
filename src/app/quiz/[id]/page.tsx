import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, BarChart3, Users, Trophy, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { prisma } from '@/lib/prisma'
import { ModeSelector } from './mode-selector'
import { ReportQuizForm } from '../report-quiz-form'

const difficultyVariant: Record<string, 'success' | 'warning' | 'destructive'> = {
  EASY: 'success',
  MEDIUM: 'warning',
  HARD: 'destructive',
}

export default async function QuizDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: {
      category: true,
      author: { select: { id: true, name: true, image: true } },
      questions: { select: { id: true } },
      sessions: {
        orderBy: { score: 'desc' },
        take: 5,
        select: {
          id: true,
          score: true,
          guestName: true,
          timeTakenMs: true,
          mode: true,
          createdAt: true,
          user: { select: { name: true, image: true } },
        },
      },
    },
  })

  if (!quiz) {
    notFound()
  }

  const questionCount = quiz.questions.length

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Back */}
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/categories">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Categories
          </Link>
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Header */}
          <div className="mb-6">
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge variant="purple">{quiz.category.name}</Badge>
              <Badge variant={difficultyVariant[quiz.difficulty] ?? 'outline'}>
                {quiz.difficulty}
              </Badge>
            </div>
            <h1 className="text-3xl font-extrabold md:text-4xl">{quiz.title}</h1>

            {/* Author */}
            <div className="mt-4 flex items-center gap-3">
              <Avatar src={quiz.author.image} fallback={quiz.author.name} size="sm" />
              <span className="text-sm text-muted-foreground">by {quiz.author.name}</span>
            </div>

            {/* Stats row */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard icon={<Users className="h-4 w-4" />} label="Plays" value={quiz.playCount} />
              <StatCard
                icon={<BarChart3 className="h-4 w-4" />}
                label="Avg Score"
                value={Math.round(quiz.avgScore)}
              />
              <StatCard
                icon={<BookOpen className="h-4 w-4" />}
                label="Questions"
                value={questionCount}
              />
              <StatCard
                icon={<Clock className="h-4 w-4" />}
                label="~Time"
                value={`${Math.round((questionCount * 20) / 60)} min`}
              />
            </div>
          </div>

          {/* Description */}
          {quiz.description && (
            <p className="mb-8 text-muted-foreground leading-relaxed">{quiz.description}</p>
          )}

          {/* Mode selector + CTA */}
          <ModeSelector quizId={quiz.id} />
          <div className="mt-4">
            <ReportQuizForm quizId={quiz.id} />
          </div>
        </div>

        {/* Leaderboard sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-quiz-yellow" />
                Top Scores
              </CardTitle>
            </CardHeader>
            <CardContent>
              {quiz.sessions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No scores yet — be the first!
                </p>
              ) : (
                <ol className="space-y-3">
                  {quiz.sessions.map((session, i) => {
                    const name = session.user?.name ?? session.guestName ?? 'Anonymous'
                    const mins = Math.floor(session.timeTakenMs / 60000)
                    const secs = Math.floor((session.timeTakenMs % 60000) / 1000)
                    return (
                      <li key={session.id} className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            i === 0
                              ? 'bg-quiz-yellow text-black'
                              : i === 1
                                ? 'bg-muted-foreground/30 text-foreground'
                                : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{name}</p>
                          <p className="text-xs text-muted-foreground">
                            {mins}:{String(secs).padStart(2, '0')} · {session.mode}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-quiz-purple-light">
                          {session.score}
                        </span>
                      </li>
                    )
                  })}
                </ol>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 text-center">
      <div className="flex justify-center mb-1 text-muted-foreground">{icon}</div>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
