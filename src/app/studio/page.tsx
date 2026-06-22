import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AlertTriangle, BarChart3, Eye, FileText, Star } from 'lucide-react'
import { auth } from '@/server/auth'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
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

  const [quizzes, categories] = await Promise.all([
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
  ])

  const isAdmin = session.user.role === 'ADMIN'
  const publishedCount = quizzes.filter((quiz) => quiz.isPublished).length
  const draftCount = quizzes.length - publishedCount
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
    <div className="container mx-auto px-4 py-12">
      <PageHeader
        title="Quiz Studio"
        description="Manage your drafts and published quizzes in one place."
      />

      <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StudioStat
          icon={<FileText className="h-4 w-4" />}
          label="Published"
          value={publishedCount}
        />
        <StudioStat icon={<BarChart3 className="h-4 w-4" />} label="Drafts" value={draftCount} />
        <StudioStat icon={<Eye className="h-4 w-4" />} label="Total plays" value={totalPlays} />
        <StudioStat
          icon={<Star className="h-4 w-4" />}
          label="Avg rating"
          value={averageRating ? averageRating.toFixed(1) : '—'}
        />
      </section>

      {needsAttention.length > 0 && (
        <section className="mb-6 rounded-2xl border border-quiz-orange/30 bg-quiz-orange/5 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-quiz-orange" />
              <div>
                <h2 className="font-bold">
                  {needsAttention.length} quiz{needsAttention.length === 1 ? '' : 'zes'} need
                  attention
                </h2>
                <p className="text-sm text-muted-foreground">
                  Add cover images, more questions, or tune quizzes with low scores and ratings.
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild className="rounded-xl">
              <Link href={`/studio/quiz/${needsAttention[0].id}/edit`}>Fix First Quiz</Link>
            </Button>
          </div>
        </section>
      )}

      <div className="mb-6 flex items-center gap-2">
        <Button variant={activeTab === 'published' ? 'default' : 'outline'} asChild>
          <Link href="/studio?tab=published">Published</Link>
        </Button>
        <Button variant={activeTab === 'drafts' ? 'default' : 'outline'} asChild>
          <Link href="/studio?tab=drafts">Drafts</Link>
        </Button>
        <div className="ml-auto flex items-center gap-2">
          {isAdmin && <AiGenerateButton categories={categories} />}
          <Button asChild>
            <Link href="/studio/quiz/new">New Quiz</Link>
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
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-2 flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-black">{value}</p>
    </div>
  )
}
