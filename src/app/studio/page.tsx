import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AlertTriangle, BarChart3, Eye, FileText, Star, Plus } from 'lucide-react'
import { auth } from '@/server/auth'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { prisma } from '@/server/prisma'
import { StudioQuizBrowser } from './_components/studio-quiz-browser'
import { AiGenerateButton } from './_components/ai-generate-button'

export const metadata: Metadata = {
  title: 'Quiz Studio',
  robots: { index: false },
}

export default async function StudioPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/api/auth/signin?callbackUrl=/studio')
  }

  const { tab } = await searchParams
  const activeTab = tab === 'drafts' ? 'drafts' : 'published'

  const [quizzes, categories, publishedCount, draftCount] = await Promise.all([
    prisma.quiz.findMany({
      where: {
        authorId: session.user.id,
        isPublished: activeTab === 'published',
      },
      select: {
        id: true,
        title: true,
        coverImage: true,
        difficulty: true,
        playCount: true,
        avgScore: true,
        updatedAt: true,
        isPublished: true,
        ratings: { select: { stars: true } },
        category: { select: { name: true, color: true } },
        questions: { select: { id: true } },
      },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.category.findMany({
      where: { parentSlug: null },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
    prisma.quiz.count({ where: { authorId: session.user.id, isPublished: true } }),
    prisma.quiz.count({ where: { authorId: session.user.id, isPublished: false } }),
  ])

  const isAdmin = session.user.role === 'ADMIN'
  const totalPlays = quizzes.reduce((sum, quiz) => sum + quiz.playCount, 0)
  const allRatings = quizzes.flatMap((quiz) => quiz.ratings.map((rating) => rating.stars))
  const averageRating =
    allRatings.length > 0
      ? allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length
      : null
  const needsAttention = quizzes.filter((quiz) => {
    const quizRating =
      quiz.ratings.length > 0
        ? quiz.ratings.reduce((sum, rating) => sum + rating.stars, 0) / quiz.ratings.length
        : null
    return (
      quiz.questions.length === 0 ||
      quiz.questions.length < 5 ||
      !quiz.coverImage ||
      (quiz.isPublished && quiz.avgScore < 45 && quiz.playCount >= 5) ||
      (quizRating !== null && quizRating < 3)
    )
  })

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 md:py-12">
      {/* Premium Dashboard Header Banner Card */}
      <section className="relative overflow-hidden rounded-md border border-border bg-card p-6 md:p-8 shadow-sm transition-all hover:shadow-md mb-8">
        <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-quiz-purple/5 blur-3xl" />
        <div className="absolute -left-16 -bottom-16 h-36 w-36 rounded-full bg-quiz-orange/5 blur-3xl" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-extrabold tracking-tight">Quiz Studio</h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-md leading-relaxed">
              Create, curate, and optimize your quizzes. Check analytics, manage drafts, and keep
              your content top-tier.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {isAdmin && <AiGenerateButton categories={categories} />}
            <Button
              asChild
              size="lg"
              className="rounded-md shadow-sm font-bold bg-quiz-orange hover:bg-quiz-orange/90 text-white"
            >
              <Link href="/studio/quiz/new">
                <Plus className="mr-1.5 h-5 w-5 shrink-0" />
                Create a Quiz
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mb-8 grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StudioStat
          icon={<FileText className="h-5 w-5" />}
          label="Published"
          value={publishedCount}
        />
        <StudioStat icon={<BarChart3 className="h-5 w-5" />} label="Drafts" value={draftCount} />
        <StudioStat
          icon={<Eye className="h-5 w-5" />}
          label="Total plays"
          value={totalPlays.toLocaleString()}
        />
        <StudioStat
          icon={<Star className="h-5 w-5" />}
          label="Avg rating"
          value={averageRating ? averageRating.toFixed(1) : '—'}
        />
      </section>

      {needsAttention.length > 0 && (
        <section className="mb-8 rounded-md border border-quiz-orange/30 bg-quiz-orange/5 p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-quiz-orange/10 text-quiz-orange">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-bold text-sm sm:text-base">
                  {needsAttention.length} quiz{needsAttention.length === 1 ? '' : 'zes'} need
                  attention
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-0.5">
                  Complete questions, add beautiful cover images, or fine-tune difficulty settings
                  for low-performing quizzes.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="rounded-md shadow-sm self-center shrink-0"
            >
              <Link href={`/studio/quiz/${needsAttention[0].id}/edit`}>Fix First Quiz</Link>
            </Button>
          </div>
        </section>
      )}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-px">
        <div className="flex gap-1.5 pb-2">
          <Button
            className="rounded-md font-bold shadow-sm"
            variant={activeTab === 'published' ? 'default' : 'outline'}
            asChild
          >
            <Link href="/studio?tab=published">Published</Link>
          </Button>
          <Button
            className="rounded-md font-bold shadow-sm"
            variant={activeTab === 'drafts' ? 'default' : 'outline'}
            asChild
          >
            <Link href="/studio?tab=drafts">Drafts</Link>
          </Button>
        </div>
      </div>

      {quizzes.length === 0 ? (
        <EmptyState
          icon="✏️"
          title={activeTab === 'published' ? 'No published quizzes yet.' : 'No drafts yet.'}
          description={
            activeTab === 'published'
              ? 'Finish a draft and publish it to see it here.'
              : 'Start from scratch or use a sample template.'
          }
          action={
            activeTab === 'published'
              ? { label: 'Go to Drafts', href: '/studio?tab=drafts' }
              : { label: 'Create a quiz', href: '/studio/quiz/new' }
          }
        />
      ) : (
        <StudioQuizBrowser
          quizzes={quizzes.map((quiz) => ({
            ...quiz,
            updatedAt: quiz.updatedAt.toISOString(),
            questionCount: quiz.questions.length,
          }))}
        />
      )}
    </div>
  )
}

function StudioStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
}) {
  return (
    <div className="flex flex-col justify-between rounded-md border bg-card p-5 transition-all hover:shadow-md">
      <div className="mb-2 flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-extrabold leading-none">{value}</p>
    </div>
  )
}
