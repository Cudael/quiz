import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react'
import { notFound } from 'next/navigation'
import { absoluteUrl } from '@/lib/site'
import { serializeJsonLd } from '@/lib/seo'
import { Button } from '@/components/ui/button'
import { QuizCardHorizontal } from '@/components/ui/quiz-card'
import type { QuizCardData } from '@/components/ui/quiz-card'
import { Prisma } from '@prisma/client'
import { getDisplayAuthorName } from '@/lib/author-display'
import { getQuizPath } from '@/lib/quiz-url'
import { prisma } from '@/server/prisma'
import { auth } from '@/server/auth'
import { categoryIcons } from '@/lib/category-icons'
import {
  isQuizIndexable,
  isQuizListingIndexable,
  seoDescription,
  seoTitle,
} from '@/lib/seo-metadata'
import { countUsefulQuestionExplanations } from '@/domain/quiz-publication-quality'

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
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}): Promise<Metadata> {
  const { slug } = await params
  const category = await prisma.category.findUnique({
    where: { slug },
    select: { id: true, name: true, description: true, slug: true },
  })

  if (!category) {
    return {
      title: 'Category not found',
      description: 'This category could not be found.',
      alternates: { canonical: `/categories/${slug}` },
    }
  }

  const title = seoTitle(`${category.name} Quizzes`)
  const description = seoDescription(
    category.description,
    `Play quizzes in the ${category.name} category on BusQuiz.`
  )
  const url = absoluteUrl(`/categories/${category.slug}`)
  const childCategories = await prisma.category.findMany({
    where: { parentSlug: category.slug },
    select: { id: true },
  })
  const candidateQuizzes = await prisma.quiz.findMany({
    where: {
      isPublished: true,
      categoryId: { in: [category.id, ...childCategories.map((child) => child.id)] },
    },
    select: {
      description: true,
      questions: { select: { explanation: true } },
      _count: {
        select: {
          questions: true,
          reports: { where: { status: 'PENDING' } },
        },
      },
    },
  })
  const indexableQuizCount = candidateQuizzes.filter((quiz) =>
    isQuizIndexable({
      description: quiz.description,
      questionCount: quiz._count.questions,
      explainedQuestionCount: countUsefulQuestionExplanations(quiz.questions),
      pendingReportCount: quiz._count.reports,
    })
  ).length
  const requestedSearchParams = await searchParams
  const isFilteredView = Object.values(requestedSearchParams).some((value) => value !== undefined)

  return {
    title,
    description,
    alternates: { canonical: `/categories/${category.slug}` },
    robots:
      isFilteredView || !isQuizListingIndexable(indexableQuizCount)
        ? { index: false, follow: true }
        : undefined,
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
    slug: true,
    coverImage: true,
    difficulty: true,
    playCount: true,
    author: { select: { username: true, role: true } },
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
      slug: quiz.slug,
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

  async function fetchRatingSortedQuizzes(skip: number): Promise<{
    quizCards: QuizCardData[]
    totalCount: number
  }> {
    const completionIds = [...playedQuizIds]

    if (completion === 'completed' && completionIds.length === 0) {
      return { quizCards: [], totalCount: 0 }
    }

    const conditions: Prisma.Sql[] = [
      Prisma.sql`q."isPublished" = true`,
      Prisma.sql`q."categoryId" IN (${Prisma.join(allCategoryIds)})`,
    ]

    if (difficulty !== 'all') {
      conditions.push(Prisma.sql`q."difficulty" = ${difficulty}`)
    }

    if (completion === 'completed') {
      conditions.push(Prisma.sql`q."id" IN (${Prisma.join(completionIds)})`)
    } else if (completion === 'unplayed' && completionIds.length > 0) {
      conditions.push(Prisma.sql`q."id" NOT IN (${Prisma.join(completionIds)})`)
    }

    const whereSql = Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`

    const [totalCount, rankedQuizIds] = await Promise.all([
      prisma.quiz.count({ where: quizWhere }),
      prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
        SELECT q."id"
        FROM "Quiz" q
        LEFT JOIN (
          SELECT
            r."quizId" AS "quizId",
            AVG(r."stars")::float AS "avgRating",
            COUNT(*)::int AS "ratingCount"
          FROM "Rating" r
          GROUP BY r."quizId"
        ) rr ON rr."quizId" = q."id"
        ${whereSql}
        ORDER BY
          COALESCE(rr."avgRating", 0) DESC,
          COALESCE(rr."ratingCount", 0) DESC,
          q."playCount" DESC,
          q."id" ASC
        OFFSET ${skip}
        LIMIT ${PAGE_SIZE}
      `),
    ])

    const pageIds = rankedQuizIds.map((q) => q.id)
    if (pageIds.length === 0) {
      return { quizCards: [], totalCount }
    }

    const pageQuizzes = await prisma.quiz.findMany({
      where: { id: { in: pageIds } },
      select: selectFields,
    })

    const quizById = new Map(pageQuizzes.map((quiz) => [quiz.id, quiz]))
    const quizCards: QuizCardData[] = []
    for (const id of pageIds) {
      const quiz = quizById.get(id)
      if (!quiz) continue
      quizCards.push(toQuizCard(quiz))
    }

    return { quizCards, totalCount }
  }

  let quizCards: QuizCardData[]
  let totalCount: number

  if (sort === 'rating') {
    ;({ quizCards, totalCount } = await fetchRatingSortedQuizzes((page - 1) * PAGE_SIZE))
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
        className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-muted-foreground/80"
      >
        <Link href="/" className="transition-colors hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        <Link href="/categories" className="transition-colors hover:text-foreground">
          Categories
        </Link>
        {parentCategory ? (
          <>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            <Link
              href={`/categories/${parentCategory.slug}`}
              className="transition-colors hover:text-foreground"
            >
              {parentCategory.name}
            </Link>
          </>
        ) : null}
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="font-semibold text-foreground/90">{category.name}</span>
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
      <section className="relative overflow-hidden rounded-md border border-border/50 bg-card p-6 md:p-8">
        <div
          className="absolute inset-x-0 top-0 h-1"
          style={{ backgroundColor: category.color || 'var(--color-quiz-blue)' }}
        />
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="-ml-2 h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <Link href="/categories">
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                All Categories
              </Link>
            </Button>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
              {category.icon
                ? (() => {
                    const Icon = categoryIcons[category.icon] || categoryIcons['HelpCircle']
                    return (
                      <span
                        className="flex h-10 w-10 items-center justify-center rounded-md"
                        style={{
                          backgroundColor: (category.color || '#3b82f6') + '22',
                          color: category.color || '#3b82f6',
                        }}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                    )
                  })()
                : null}
              <span>
                {category.name}{' '}
                <span className="text-muted-foreground/50 font-normal">Quizzes</span>
              </span>
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              {category.description || `Test your knowledge in our ${category.name} quizzes.`}
            </p>
          </div>
          <div
            className="flex shrink-0 items-center gap-1.5 rounded-sm border px-4 py-1.5 text-sm font-semibold shadow-sm backdrop-blur-sm"
            style={{
              backgroundColor: (category.color || '#3b82f6') + '0d',
              borderColor: (category.color || '#3b82f6') + '2d',
              color: category.color || 'inherit',
            }}
          >
            <span className="font-bold tabular-nums">{(totalCount || 0).toLocaleString()}</span>
            <span className="opacity-80">{totalCount === 1 ? 'quiz' : 'quizzes'}</span>
          </div>
        </div>
      </section>

      {/* Subcategory pills */}
      {subcategories.length > 0 ? (
        <div className="rounded-md border border-border/50 bg-card/65 backdrop-blur-sm p-4">
          <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground/90">
            Want to dig deeper?
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/categories/${category.slug}`}
              className="rounded-md border border-foreground/20 bg-foreground/10 px-3 py-1.5 text-xs font-bold transition-all hover:bg-foreground/15 text-foreground"
            >
              All
            </Link>
            {subcategories.map((sub) => (
              <Link
                key={sub.slug}
                href={`/categories/${sub.slug}`}
                className="rounded-md border border-border/50 bg-background/30 px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-all hover:border-foreground/20 hover:text-foreground hover:bg-background/80"
                style={
                  {
                    '--sub-hover': sub.color + '14',
                    '--sub-border': sub.color + '33',
                    '--sub-text': sub.color,
                  } as React.CSSProperties
                }
              >
                <span className="flex items-center gap-1.5">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: sub.color }}
                  />
                  {sub.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {/* Filters + Results count */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/30 pb-3">
        <p className="text-xs font-bold text-muted-foreground/80 lowercase">
          Showing{' '}
          <span className="text-foreground font-semibold">
            {resultStart}–{resultEnd}
          </span>{' '}
          of <span className="text-foreground font-semibold">{totalCount.toLocaleString()}</span>{' '}
          quizzes
        </p>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center rounded-md border border-border/50 bg-card p-0.5 text-xs shadow-sm">
            {(Object.keys(DIFFICULTY_LABELS) as DifficultyFilter[]).map((key) => (
              <Link
                key={key}
                href={buildUrl(1, sort, key, completion)}
                className={`rounded-md px-3 py-1 font-bold transition-all ${
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
            <div className="flex items-center rounded-md border border-border/50 bg-card p-0.5 text-xs shadow-sm">
              {(Object.keys(COMPLETION_LABELS) as CompletionFilter[]).map((key) => (
                <Link
                  key={key}
                  href={buildUrl(1, sort, difficulty, key)}
                  className={`rounded-md px-3 py-1 font-bold transition-all ${
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
          <div className="flex items-center rounded-md border border-border/50 bg-card p-0.5 text-xs shadow-sm">
            {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
              <Link
                key={key}
                href={buildUrl(1, key)}
                className={`rounded-md px-3 py-1 font-bold transition-all ${
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
        <div className="rounded-md border border-dashed border-border bg-card/50 p-10 text-center">
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

      <section className="grid gap-6 rounded-md border border-border/50 bg-card/65 backdrop-blur-sm p-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-foreground">
              About {category.name} Quizzes
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {category.description ||
                `Delve into our curated collection of ${category.name} quizzes.`}{' '}
              Use the interactive filter dashboard above to target specific difficulty ranges, track
              your completion stats, or organize quizzes by play counts and ratings.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <Button size="sm" asChild className="rounded-md font-bold px-4">
              <Link href="/random-quiz">Play Random Quiz</Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              asChild
              className="rounded-md font-bold px-4 border-border/60 bg-background/50 hover:bg-background"
            >
              <Link href="/studio/quiz/new">Create a Quiz</Link>
            </Button>
          </div>
        </div>
        <div className="space-y-3">
          {faqItems.map((item) => (
            <details
              key={item.question}
              className="rounded-md border border-border/40 bg-background/45 p-3.5 transition-all duration-300 hover:border-border/80 group [&_summary]:open:border-b [&_summary]:open:pb-2.5 [&_summary]:open:mb-2"
            >
              <summary className="cursor-pointer text-sm font-bold text-foreground/90 transition-colors hover:text-foreground list-none flex items-center justify-between">
                <span>{item.question}</span>
                <span className="text-[10px] font-bold text-muted-foreground/60 transition-transform duration-200 group-open:rotate-180">
                  ▼
                </span>
              </summary>
              <p className="text-xs leading-relaxed text-muted-foreground mt-2">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  )
}
