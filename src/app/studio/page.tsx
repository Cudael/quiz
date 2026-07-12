import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AlertTriangle, BarChart3, Eye, FileText, Star, Plus, Search } from 'lucide-react'
import { auth } from '@/server/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/ui/empty-state'
import { prisma } from '@/server/prisma'
import { StudioQuizBrowser } from './_components/studio-quiz-browser'
import { StudioPagination } from './_components/studio-pagination'
import { AiGenerateButton } from './_components/ai-generate-button'

export const metadata: Metadata = {
  title: 'Quiz Studio',
  robots: { index: false },
}

const PAGE_SIZE = 20

function buildStudioHref({
  tab,
  q,
  page,
}: {
  tab: 'published' | 'drafts'
  q?: string
  page?: number
}) {
  const params = new URLSearchParams()
  params.set('tab', tab)
  if (q) params.set('q', q)
  if (page && page > 1) params.set('page', String(page))
  return `/studio?${params.toString()}`
}

export default async function StudioPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string; page?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/api/auth/signin?callbackUrl=/studio')
  }

  const { tab, q, page: pageParam } = await searchParams
  const activeTab = tab === 'drafts' ? 'drafts' : 'published'
  const searchQuery = (q ?? '').trim()
  const currentPage = Math.max(1, Number.parseInt(pageParam ?? '1', 10) || 1)

  const ownershipFilter = {
    OR: [{ authorId: session.user.id }, { collaborators: { some: { userId: session.user.id } } }],
  }
  const tabFilter = { isPublished: activeTab === 'published' }
  const searchFilter = searchQuery
    ? { title: { contains: searchQuery, mode: 'insensitive' as const } }
    : {}
  const quizWhere = { ...ownershipFilter, ...tabFilter, ...searchFilter }

  const [quizzes, matchingCount, statsQuizzes, categories, publishedCount, draftCount] =
    await Promise.all([
      prisma.quiz.findMany({
        where: quizWhere,
        select: {
          id: true,
          title: true,
          slug: true,
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
        skip: (currentPage - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.quiz.count({ where: quizWhere }),
      // Unpaginated, unfiltered-by-search — dashboard stats and the "needs
      // attention" banner summarize the whole tab, not just the current page.
      prisma.quiz.findMany({
        where: { ...ownershipFilter, ...tabFilter },
        select: {
          id: true,
          coverImage: true,
          playCount: true,
          avgScore: true,
          isPublished: true,
          ratings: { select: { stars: true } },
          questions: { select: { id: true } },
        },
      }),
      prisma.category.findMany({
        orderBy: [{ parentSlug: { sort: 'asc', nulls: 'first' } }, { name: 'asc' }],
        select: { id: true, name: true, slug: true, parentSlug: true },
      }),
      prisma.quiz.count({ where: { ...ownershipFilter, isPublished: true } }),
      prisma.quiz.count({ where: { ...ownershipFilter, isPublished: false } }),
    ])

  const totalPages = Math.max(1, Math.ceil(matchingCount / PAGE_SIZE))

  const isAdmin = session.user.role === 'ADMIN'
  const totalPlays = statsQuizzes.reduce((sum, quiz) => sum + quiz.playCount, 0)
  const allRatings = statsQuizzes.flatMap((quiz) => quiz.ratings.map((rating) => rating.stars))
  const averageRating =
    allRatings.length > 0
      ? allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length
      : null
  const needsAttention = statsQuizzes.filter((quiz) => {
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
      <section className="relative overflow-hidden rounded-md border border-border bg-card p-6 md:p-8 mb-8">
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-center sm:text-left">
            <p className="mb-2 flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground sm:justify-start">
              <span aria-hidden className="h-2 w-2 shrink-0 bg-quiz-orange" />
              Creator tools
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight">Quiz Studio</h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-md leading-relaxed">
              Create, curate, and optimize your quizzes. Check analytics, manage drafts, and keep
              your content top-tier.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {isAdmin && <AiGenerateButton categories={categories} />}
            <Button asChild size="lg" variant="warm" className="font-bold">
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
            <Link href={buildStudioHref({ tab: 'published', q: searchQuery })}>Published</Link>
          </Button>
          <Button
            className="rounded-md font-bold shadow-sm"
            variant={activeTab === 'drafts' ? 'default' : 'outline'}
            asChild
          >
            <Link href={buildStudioHref({ tab: 'drafts', q: searchQuery })}>Drafts</Link>
          </Button>
        </div>

        <form action="/studio" method="GET" className="flex items-center gap-2 pb-2">
          <input type="hidden" name="tab" value={activeTab} />
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              name="q"
              defaultValue={searchQuery}
              placeholder="Search your quizzes…"
              className="w-56 pl-9 sm:w-64"
            />
          </div>
          <Button type="submit" variant="outline" size="sm">
            Search
          </Button>
          {searchQuery && (
            <Button asChild variant="ghost" size="sm">
              <Link href={buildStudioHref({ tab: activeTab })}>Clear</Link>
            </Button>
          )}
        </form>
      </div>

      {quizzes.length === 0 ? (
        <EmptyState
          icon="✏️"
          title={
            searchQuery
              ? `No quizzes match "${searchQuery}".`
              : activeTab === 'published'
                ? 'No published quizzes yet.'
                : 'No drafts yet.'
          }
          description={
            searchQuery
              ? 'Try a different search term, or clear the search to see all your quizzes.'
              : activeTab === 'published'
                ? 'Finish a draft and publish it to see it here.'
                : 'Start from scratch or use a sample template.'
          }
          action={
            searchQuery
              ? { label: 'Clear search', href: buildStudioHref({ tab: activeTab }) }
              : activeTab === 'published'
                ? { label: 'Go to Drafts', href: buildStudioHref({ tab: 'drafts' }) }
                : { label: 'Create a quiz', href: '/studio/quiz/new' }
          }
        />
      ) : (
        <div className="space-y-4">
          <StudioPagination
            currentPage={currentPage}
            totalPages={totalPages}
            buildHref={(page) => buildStudioHref({ tab: activeTab, q: searchQuery, page })}
          />

          <StudioQuizBrowser
            quizzes={quizzes.map((quiz) => ({
              ...quiz,
              updatedAt: quiz.updatedAt.toISOString(),
              questionCount: quiz.questions.length,
            }))}
          />

          <StudioPagination
            currentPage={currentPage}
            totalPages={totalPages}
            buildHref={(page) => buildStudioHref({ tab: activeTab, q: searchQuery, page })}
          />
        </div>
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
