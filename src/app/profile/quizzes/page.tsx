import Link from 'next/link'
import { redirect } from 'next/navigation'
import { BarChart3, Eye, FilePenLine, Plus, Sparkles } from 'lucide-react'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default async function MyQuizzesPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/sign-in?callbackUrl=/profile/quizzes')
  }

  const quizzes = await prisma.quiz.findMany({
    where: { authorId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      difficulty: true,
      playCount: true,
      avgScore: true,
      isPublished: true,
      updatedAt: true,
      category: { select: { name: true, color: true } },
      questions: { select: { id: true } },
      ratings: { select: { stars: true } },
    },
  })

  const publishedCount = quizzes.filter((quiz) => quiz.isPublished).length
  const draftCount = quizzes.length - publishedCount
  const totalPlays = quizzes.reduce((sum, quiz) => sum + quiz.playCount, 0)
  const averageRating = (() => {
    const ratings = quizzes.flatMap((quiz) => quiz.ratings.map((rating) => rating.stars))
    if (ratings.length === 0) return null
    return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
  })()

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">My Quizzes</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Track your published quizzes, drafts, and the signals that tell you what to improve
              next.
            </p>
          </div>
          <Button asChild className="rounded-xl font-bold">
            <Link href="/studio/quiz/new">
              <Plus className="mr-2 h-4 w-4" />
              New Quiz
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <CreatorStat label="Published" value={publishedCount.toLocaleString()} />
        <CreatorStat label="Drafts" value={draftCount.toLocaleString()} />
        <CreatorStat label="Total plays" value={totalPlays.toLocaleString()} />
        <CreatorStat label="Avg rating" value={averageRating ? averageRating.toFixed(1) : '—'} />
      </section>

      {quizzes.length === 0 ? (
        <section className="rounded-2xl border border-dashed bg-muted/30 p-10 text-center">
          <Sparkles className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
          <h2 className="font-bold">No quizzes created yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Start with a simple idea, add a few questions, and publish when it feels ready.
          </p>
          <Button asChild className="mt-5 rounded-xl">
            <Link href="/studio/quiz/new">Create Your First Quiz</Link>
          </Button>
        </section>
      ) : (
        <section className="space-y-3">
          {quizzes.map((quiz) => {
            const averageQuizRating =
              quiz.ratings.length > 0
                ? quiz.ratings.reduce((sum, rating) => sum + rating.stars, 0) / quiz.ratings.length
                : null
            const needsAttention =
              quiz.questions.length < 5 ||
              quiz.avgScore < 45 ||
              (averageQuizRating !== null && averageQuizRating < 3)

            return (
              <article key={quiz.id} className="rounded-xl border bg-card p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge variant={quiz.isPublished ? 'success' : 'secondary'}>
                        {quiz.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                      <Badge variant="outline">{quiz.category.name}</Badge>
                      <Badge variant="secondary">{quiz.difficulty}</Badge>
                      {needsAttention ? <Badge variant="warning">Needs attention</Badge> : null}
                    </div>
                    <h2 className="truncate text-lg font-bold">{quiz.title}</h2>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>{quiz.questions.length} questions</span>
                      <span>{quiz.playCount.toLocaleString()} plays</span>
                      <span>{Math.round(quiz.avgScore)}% avg score</span>
                      <span>
                        {averageQuizRating
                          ? `${averageQuizRating.toFixed(1)} rating`
                          : 'No ratings yet'}
                      </span>
                      <span>
                        Updated{' '}
                        {new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(
                          quiz.updatedAt
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/studio/quiz/${quiz.id}/edit`}>
                        <FilePenLine className="mr-1.5 h-4 w-4" />
                        Edit
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/quiz/${quiz.id}`}>
                        <Eye className="mr-1.5 h-4 w-4" />
                        Preview
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/studio/quiz/${quiz.id}/analytics`}>
                        <BarChart3 className="mr-1.5 h-4 w-4" />
                        Analytics
                      </Link>
                    </Button>
                  </div>
                </div>
              </article>
            )
          })}
        </section>
      )}
    </div>
  )
}

function CreatorStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  )
}
