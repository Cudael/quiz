import type { Metadata } from 'next'
import { Zap, Users, Play, BarChart3, Globe, Layers } from 'lucide-react'
import { prisma } from '@/server/prisma'
import { absoluteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Global Stats | BusQuiz',
  description: 'Live statistics from the BusQuiz platform. Total quizzes, players, plays and more.',
  alternates: { canonical: '/stats' },
  openGraph: {
    title: 'BusQuiz Statistics',
    description: "See the numbers behind the world''s most engaging quiz platform.",
    url: absoluteUrl('/stats'),
  },
}

export default async function StatsPage() {
  const [
    totalQuizzes,
    totalUsers,
    totalPlays,
    totalQuestions,
    totalCategories,
    topCategory,
    topQuiz,
    newestQuiz,
    mostProlificCreator,
  ] = await Promise.all([
    prisma.quiz.count({ where: { isPublished: true } }),
    prisma.user.count(),
    prisma.playSession.count(),
    prisma.question.count(),
    prisma.category.count(),
    prisma.category.findFirst({
      orderBy: { quizzes: { _count: 'desc' } },
      select: { name: true, slug: true, _count: { select: { quizzes: true } } },
    }),
    prisma.quiz.findFirst({
      where: { isPublished: true },
      orderBy: { playCount: 'desc' },
      select: { title: true, id: true, playCount: true },
    }),
    prisma.quiz.findFirst({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      select: { title: true, id: true, createdAt: true },
    }),
    prisma.user.findFirst({
      orderBy: { quizzes: { _count: 'desc' } },
      select: { name: true, username: true, _count: { select: { quizzes: true } } },
    }),
  ])

  const stats = [
    {
      label: 'Total Quizzes',
      value: totalQuizzes.toLocaleString(),
      icon: Layers,
      color: 'text-quiz-purple',
      bg: 'bg-quiz-purple/10',
    },
    {
      label: 'Total Players',
      value: totalUsers.toLocaleString(),
      icon: Users,
      color: 'text-quiz-green',
      bg: 'bg-quiz-green/10',
    },
    {
      label: 'Total Plays',
      value: totalPlays.toLocaleString(),
      icon: Play,
      color: 'text-quiz-blue',
      bg: 'bg-quiz-blue/10',
    },
    {
      label: 'Total Questions',
      value: totalQuestions.toLocaleString(),
      icon: BarChart3,
      color: 'text-quiz-orange',
      bg: 'bg-quiz-orange/10',
    },
    {
      label: 'Categories',
      value: totalCategories.toString(),
      icon: Globe,
      color: 'text-quiz-pink',
      bg: 'bg-quiz-pink/10',
    },
  ]

  const funFacts = []
  if (totalQuizzes > 0 && totalPlays > 0) {
    funFacts.push(
      `On average, each quiz has been played ${Math.round(totalPlays / totalQuizzes).toLocaleString()} times.`
    )
  }
  if (totalQuestions > 0 && totalPlays > 0) {
    funFacts.push(
      `Over ${(totalQuestions * totalPlays).toLocaleString()} questions have been answered across all sessions.`
    )
  }
  if (totalQuizzes > 0 && totalUsers > 0) {
    funFacts.push(
      `If every player created one quiz, we''d have ${totalUsers.toLocaleString()} — there are ${totalQuizzes.toLocaleString()} now.`
    )
  }
  funFacts.push('The fastest recorded quiz completion is under 30 seconds. Can you beat that?')

  const milestones = [
    {
      emoji: '🏆',
      title: 'Most Played Quiz',
      value: topQuiz?.title ?? '—',
      detail: topQuiz ? `${topQuiz.playCount.toLocaleString()} plays` : '',
    },
    {
      emoji: '🔥',
      title: 'Largest Category',
      value: topCategory?.name ?? '—',
      detail: topCategory ? `${topCategory._count.quizzes} quizzes` : '',
    },
    {
      emoji: '✍️',
      title: 'Most Prolific Creator',
      value: mostProlificCreator?.name ?? '—',
      detail: mostProlificCreator ? `${mostProlificCreator._count.quizzes} quizzes` : '',
    },
    {
      emoji: '🆕',
      title: 'Newest Quiz',
      value: newestQuiz?.title ?? '—',
      detail: newestQuiz ? `Added ${new Date(newestQuiz.createdAt).toLocaleDateString()}` : '',
    },
  ]

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10 md:py-16">
      <div className="mb-10 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-bold text-muted-foreground">
          <BarChart3 className="h-3.5 w-3.5" />
          Live numbers
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Platform Stats</h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-xl mx-auto">
          Real-time statistics from the BusQuiz universe. Every quiz play, every new player, every
          question answered.
        </p>
      </div>

      {/* Big stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 mb-12">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex flex-col items-center rounded-2xl border border-border/60 bg-card p-5 text-center transition-all hover:-translate-y-1 hover:shadow-md"
          >
            <span className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${s.bg}`}>
              <s.icon className={`h-6 w-6 ${s.color}`} />
            </span>
            <span className="text-2xl font-black tracking-tight">{s.value}</span>
            <span className="mt-1 text-xs text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Milestones */}
      <div className="mb-12">
        <h2 className="mb-5 text-2xl font-black tracking-tight">Platform Milestones</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {milestones.map((m) => (
            <div
              key={m.title}
              className="flex items-start gap-4 rounded-xl border border-border/50 bg-card p-4"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-xl">
                {m.emoji}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {m.title}
                </p>
                <p className="mt-1 truncate text-sm font-semibold">{m.value}</p>
                {m.detail ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">{m.detail}</p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fun facts */}
      <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-quiz-purple/5 to-quiz-orange/5 p-6 md:p-8">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-quiz-orange/10">
            <Zap className="h-4 w-4 text-quiz-orange" />
          </span>
          <h2 className="text-lg font-black">Did You Know?</h2>
        </div>
        <ul className="space-y-3">
          {funFacts.map((fact, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed"
            >
              <span className="mt-0.5 shrink-0 text-quiz-purple font-bold">•</span>
              {fact}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
