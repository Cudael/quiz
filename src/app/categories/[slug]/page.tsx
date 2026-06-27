import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react'
import { notFound } from 'next/navigation'
import { absoluteUrl } from '@/lib/site'
import { serializeJsonLd } from '@/lib/seo'
import { Button } from '@/components/ui/button'
import { QuizCardHorizontal } from '@/components/ui/quiz-card'
import type { QuizCardData } from '@/components/ui/quiz-card'
import { getDisplayAuthorName } from '@/lib/author-display'
import { getQuizPath } from '@/lib/quiz-url'
import { prisma } from '@/server/prisma'
import { auth } from '@/server/auth'

const PAGE_SIZE = 20

type SortOption = 'popular' | 'newest' | 'name' | 'rating'
type DifficultyFilter = 'all' | 'EASY' | 'MEDIUM' | 'HARD'
type CompletionFilter = 'all' | 'unplayed' | 'completed'

function parseSearchParams(sp: Record<string, string | string[] | undefined>): {
  page: number
  sort: SortOption
  difficulty: DifficultyFilter
  completion: CompletionFilter
} {
  const page = Math.max(1, Number(sp.page ?? '1'))
  const sortRaw = Array.isArray(sp.sort) ? sp.sort[0] : sp.sort
  const sort: SortOption =
    sortRaw === 'newest' || sortRaw === 'name' || sortRaw === 'rating' ? sortRaw : 'popular'
  const difficultyRaw = Array.isArray(sp.difficulty) ? sp.difficulty[0] : sp.difficulty
  const difficulty: DifficultyFilter =
    difficultyRaw === 'EASY' || difficultyRaw === 'MEDIUM' || difficultyRaw === 'HARD'
      ? difficultyRaw
      : 'all'
  const completionRaw = Array.isArray(sp.completion) ? sp.completion[0] : sp.completion
  const completion: CompletionFilter =
    completionRaw === 'unplayed' || completionRaw === 'completed' ? completionRaw : 'all'
  return { page, sort, difficulty, completion }
}

const SORT_LABELS: Record<SortOption, string> = {
  popular: 'Most Popular',
  newest: 'Newest',
  name: 'A–Z',
  rating: 'Highest Rated',
}

const DIFFICULTY_LABELS: Record<DifficultyFilter, string> = {
  all: 'All levels',
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard',
}

const COMPLETION_LABELS: Record<CompletionFilter, string> = {
  all: 'All quizzes',
  unplayed: 'Not played',
  completed: 'Completed',
}

function getCategoryFaq(categoryName: string, totalCount: number) {
  return [
    {
      question: `What are ${categoryName} quizzes?`,
      answer: `${categoryName} quizzes are short trivia challenges focused on ${categoryName.toLowerCase()} topics. They can include quick recall, visual questions, map questions, and timed rounds depending on the quiz creator.`,
    },
    {
      question: `How many ${categoryName} quizzes are available?`,
      answer: `This category currently has ${totalCount.toLocaleString()} published ${totalCount === 1 ? 'quiz' : 'quizzes'} available on BusQuiz.`,
    },
    {
      question: `How should I choose a ${categoryName} quiz?`,
      answer: `Start with Easy or Medium if you are warming up, sort by popularity to find proven favorites, or use Completed and Not played filters when signed in to track your progress.`,
    },
  ]
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const category = await prisma.category.findUnique({
    where: { slug },
    select: { name: true, description: true, slug: true },
  })

  if (!category) {
    return {
      title: 'Category not found | BusQuiz',
      description: 'This category could not be found.',
      alternates: { canonical: `/categories/${slug}` },
    }
  }

  const title = `${category.name} Quizzes | BusQuiz`
  const description =
    category.description || `Play quizzes in the ${category.name} category on BusQuiz.`
  const url = absoluteUrl(`/categories/${category.slug}`)

  return {
    title,
    description,
    alternates: { canonical: `/categories/${category.slug}` },
    openGraph: { title, description, url },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { slug } = await params
  const category = await prisma.category.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      icon: true,
      color: true,
      parentSlug: true,
    },
  })

  if (!category) notFound()

  const { page, sort, difficulty, completion } = parseSearchParams(await searchParams)

  // Cross-reference user's played quizzes to show completion badge
  const session = await auth()
  const playedQuizIds = new Set<string>()
  if (session?.user?.id) {
    const userSessions = await prisma.playSession.findMany({
      where: { userId: session.user.id },
      select: { quizId: true },
      distinct: ['quizId'],
    })
    for (const s of userSessions) {
      playedQuizIds.add(s.quizId)
    }
  }

  // Fetch subcategories (used as filter pills)
  const [subcategories, parentCategory] = await Promise.all([
    prisma.category.findMany({
      where: { parentSlug: category.slug },
      select: { slug: true, name: true, icon: true, color: true },
      orderBy: { name: 'asc' },
    }),
    category.parentSlug
      ? prisma.category.findUnique({
          where: { slug: category.parentSlug },
          select: { slug: true, name: true },
        })
      : Promise.resolve(null),
  ])

  // If this is a parent category, include subcategory quizzes
  const childSlugs = subcategories.map((s) => s.slug)
  const childCategoryIds =
    childSlugs.length > 0
      ? (
          await prisma.category.findMany({
            where: { slug: { in: childSlugs } },
            select: { id: true },
          })
        ).map((c) => c.id)
      : []

  const allCategoryIds = [category.id, ...childCategoryIds]

  const completionFilter = (() => {
    if (!session?.user?.id || completion === 'all') return {}
    const ids = [...playedQuizIds]
    if (completion === 'completed') return { id: { in: ids } }
    if (ids.length === 0) return {}
    return { id: { notIn: ids } }
  })()

  const quizWhere = {
    categoryId: { in: allCategoryIds },
    isPublished: true,
    ...(difficulty !== 'all' ? { difficulty } : {}),
    ...completionFilter,
  }

  const selectFields = {
    id: true,
    title: true,
    coverImage: true,
    difficulty: true,
    playCount: true,
    author: { select: { name: true, role: true } },
    category: { select: { name: true, color: true } },
    _count: { select: { ratings: true } },
    ratings: { select: { stars: true } },
  } as const

  function toQuizCard(
    quiz: Awaited<ReturnType<typeof prisma.quiz.findMany<{ select: typeof selectFields }>>>[number]
  ): QuizCardData {
    const ratingCount = quiz._count?.ratings ?? 0
    const ratings = quiz.ratings ?? []
    const avgRating =
      ratingCount > 0 ? ratings.reduce((sum, r) => sum + r.stars, 0) / ratingCount : undefined
    return {
      id: quiz.id,
      title: quiz.title,
      coverImage: quiz.coverImage,
      difficulty:
        quiz.difficulty === 'EASY' || quiz.difficulty === 'MEDIUM' || quiz.difficulty === 'HARD'
          ? quiz.difficulty
          : 'MEDIUM',
      category: { name: quiz.category.name, color: quiz.category.color },
      playCount: quiz.playCount,
      avgRating,
      ratingCount,
      authorName: quiz.author ? getDisplayAuthorName(quiz.author) : undefined,
      completed: playedQuizIds.has(quiz.id) || undefined,
    }
  }

  async function fetchPaginatedQuizzes(
    orderBy: Record<string, unknown>,
    skip: number
  ): Promise<{ quizCards: QuizCardData[]; totalCount: number }> {
    const [quizzes, totalCount] = await Promise.all([
      prisma.quiz.findMany({
        where: quizWhere,
        orderBy,
        skip,
        take: PAGE_SIZE,
        select: selectFields,
      }),
      prisma.quiz.count({
        where: quizWhere,
      }),
    ])
    return { quizCards: quizzes.map(toQuizCard), totalCount }
  }

  let quizCards: QuizCardData[]
  let totalCount: number

  if (sort === 'rating') {
    // Fetch all quizzes, compute avg rating in-memory, then paginate
    const allQuizzes = await prisma.quiz.findMany({
      where: quizWhere,
      select: selectFields,
    })

    totalCount = allQuizzes.length

    const scored = allQuizzes.map(toQuizCard).sort((a, b) => {
      const aAvg = a.avgRating ?? 0
      const bAvg = b.avgRating ?? 0
      if (bAvg !== aAvg) return bAvg - aAvg
      // Tie-break by rating count, then playCount
      const aCount = a.ratingCount ?? 0
      const bCount = b.ratingCount ?? 0
      if (bCount !== aCount) return bCount - aCount
      return (b.playCount ?? 0) - (a.playCount ?? 0)
    })

    const skip = (page - 1) * PAGE_SIZE
    quizCards = scored.slice(skip, skip + PAGE_SIZE)
  } else {
    const orderBy =
      sort === 'newest'
        ? { createdAt: 'desc' as const }
        : sort === 'name'
          ? { title: 'asc' as const }
          : { playCount: 'desc' as const }
    ;({ quizCards, totalCount } = await fetchPaginatedQuizzes(orderBy, (page - 1) * PAGE_SIZE))
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  const categorySlug = category.slug
  const resultStart = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const resultEnd = Math.min(page * PAGE_SIZE, totalCount)
  const faqItems = getCategoryFaq(category.name, totalCount)

  function buildUrl(p: number, s: SortOption, d = difficulty, c = completion) {
    const params = new URLSearchParams()
    if (p > 1) params.set('page', String(p))
    if (s !== 'popular') params.set('sort', s)
    if (d !== 'all') params.set('difficulty', d)
    if (c !== 'all') params.set('completion', c)
    const qs = params.toString()
    return `/categories/${categorySlug}${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="container mx-auto space-y-6 px-4 py-8 md:px-6">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground"
      >
        <Link href="/" className="transition-colors hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
        <Link href="/categories" className="transition-colors hover:text-foreground">
          Categories
        </Link>
        {parentCategory ? (
          <>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
            <Link
              href={`/categories/${parentCategory.slug}`}
              className="transition-colors hover:text-foreground"
            >
              {parentCategory.name}
            </Link>
          </>
        ) : null}
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
        <span className="font-medium text-foreground">{category.name}</span>
      </nav>

      {/* BreadcrumbList JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Categories',
                item: absoluteUrl('/categories'),
              },
              ...(parentCategory
                ? [
                    {
                      '@type': 'ListItem' as const,
                      position: 3,
                      name: parentCategory.name,
                      item: absoluteUrl(`/categories/${parentCategory.slug}`),
                    },
                  ]
                : []),
              {
                '@type': 'ListItem',
                position: parentCategory ? 4 : 3,
                name: category.name,
                item: absoluteUrl(`/categories/${category.slug}`),
              },
            ],
          }),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqItems.map((item) => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
              },
            })),
          }),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: `${category.name} quizzes`,
            numberOfItems: quizCards.length,
            itemListElement: quizCards.map((quiz, index) => ({
              '@type': 'ListItem',
              position: resultStart + index,
              name: quiz.title,
              url: absoluteUrl(getQuizPath(quiz)),
            })),
          }),
        }}
      />

      {/* Banner */}
      <section className="rounded-2xl border border-border/50 bg-card p-4 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <Button variant="ghost" size="sm" asChild className="-ml-2 mb-1 h-7 px-2 text-xs">
              <Link href="/categories">
                <ArrowLeft className="mr-1 h-3 w-3" />
                All Categories
              </Link>
            </Button>
            <h1 className="text-2xl font-black tracking-tight">{category.name}</h1>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {category.description}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border/50 bg-background px-3 py-1 text-sm">
            <span className="font-bold tabular-nums">{totalCount.toLocaleString()}</span>
            <span className="text-muted-foreground">{totalCount === 1 ? 'quiz' : 'quizzes'}</span>
          </div>
        </div>
      </section>

      {/* Subcategory pills */}
      {subcategories.length > 0 ? (
        <div className="rounded-2xl border border-border/50 bg-card p-4">
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Want to dig deeper?
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/categories/${category.slug}`}
              className="rounded-lg border border-foreground/20 bg-foreground/10 px-3 py-1 text-sm font-semibold transition-colors hover:bg-foreground/15"
            >
              All
            </Link>
            {subcategories.map((sub) => (
              <Link
                key={sub.slug}
                href={`/categories/${sub.slug}`}
                className="rounded-lg border border-border/50 px-3 py-1 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
              >
                {sub.name}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {/* Filters + Results count */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Showing {resultStart}–{resultEnd} of {totalCount.toLocaleString()} results
        </p>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center rounded-xl border border-border/50 bg-card p-0.5 text-sm">
            {(Object.keys(DIFFICULTY_LABELS) as DifficultyFilter[]).map((key) => (
              <Link
                key={key}
                href={buildUrl(1, sort, key, completion)}
                className={`rounded-lg px-3 py-1 font-medium transition-colors ${
                  difficulty === key
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {DIFFICULTY_LABELS[key]}
              </Link>
            ))}
          </div>
          {session?.user?.id && (
            <div className="flex items-center rounded-xl border border-border/50 bg-card p-0.5 text-sm">
              {(Object.keys(COMPLETION_LABELS) as CompletionFilter[]).map((key) => (
                <Link
                  key={key}
                  href={buildUrl(1, sort, difficulty, key)}
                  className={`rounded-lg px-3 py-1 font-medium transition-colors ${
                    completion === key
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {COMPLETION_LABELS[key]}
                </Link>
              ))}
            </div>
          )}
          <div className="flex items-center rounded-xl border border-border/50 bg-card p-0.5 text-sm">
            {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
              <Link
                key={key}
                href={buildUrl(1, key)}
                className={`rounded-lg px-3 py-1 font-medium transition-colors ${
                  sort === key
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {SORT_LABELS[key]}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Quiz grid */}
      {quizCards.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {quizCards.map((quiz) => (
            <QuizCardHorizontal
              key={quiz.id}
              quiz={quiz}
              className="w-full min-w-0 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
          <p className="text-sm text-muted-foreground">
            No published quizzes in this category yet.
          </p>
          <div className="mt-4">
            <Button variant="outline" asChild>
              <Link href="/categories">Browse other categories</Link>
            </Button>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 ? (
        <nav aria-label="Pagination" className="flex items-center justify-center gap-2">
          {page > 1 ? (
            <Button variant="outline" size="sm" asChild>
              <Link href={buildUrl(page - 1, sort)}>
                <ArrowLeft className="mr-1 h-4 w-4" />
                Previous
              </Link>
            </Button>
          ) : null}
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Button variant="outline" size="sm" asChild>
              <Link href={buildUrl(page + 1, sort)}>
                Next
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          ) : null}
        </nav>
      ) : null}

      <section className="grid gap-4 rounded-2xl border bg-card p-5 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <h2 className="text-xl font-black tracking-tight">About {category.name} Quizzes</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {category.description} Use the filters above to find a comfortable difficulty, return to
            unfinished topics, or replay favorites when you want to improve your score.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" asChild className="rounded-xl">
              <Link href="/random-quiz">Play Random Quiz</Link>
            </Button>
            <Button size="sm" variant="outline" asChild className="rounded-xl">
              <Link href="/studio/quiz/new">Create a Quiz</Link>
            </Button>
          </div>
        </div>
        <div className="space-y-3">
          {faqItems.map((item) => (
            <details key={item.question} className="rounded-xl border bg-background p-3">
              <summary className="cursor-pointer text-sm font-bold">{item.question}</summary>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  )
}
