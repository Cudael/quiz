import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react'
import { notFound } from 'next/navigation'
import { absoluteUrl } from '@/lib/site'
import { Button } from '@/components/ui/button'
import { QuizCardHorizontal } from '@/components/ui/quiz-card'
import type { QuizCardData } from '@/components/ui/quiz-card'
import { prisma } from '@/server/prisma'

const PAGE_SIZE = 20

type SortOption = 'popular' | 'newest' | 'name'

function parseSearchParams(sp: Record<string, string | string[] | undefined>): {
  page: number
  sort: SortOption
} {
  const page = Math.max(1, Number(sp.page ?? '1'))
  const sortRaw = Array.isArray(sp.sort) ? sp.sort[0] : sp.sort
  const sort: SortOption = sortRaw === 'newest' || sortRaw === 'name' ? sortRaw : 'popular'
  return { page, sort }
}

const SORT_LABELS: Record<SortOption, string> = {
  popular: 'Most Popular',
  newest: 'Newest',
  name: 'A–Z',
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

  const { page, sort } = parseSearchParams(await searchParams)

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

  const orderBy =
    sort === 'newest'
      ? { createdAt: 'desc' as const }
      : sort === 'name'
        ? { title: 'asc' as const }
        : { playCount: 'desc' as const }

  const [quizzes, totalCount] = await Promise.all([
    prisma.quiz.findMany({
      where: { categoryId: { in: allCategoryIds }, isPublished: true },
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        title: true,
        coverImage: true,
        difficulty: true,
        playCount: true,
        author: { select: { name: true } },
        category: { select: { name: true, color: true } },
      },
    }),
    prisma.quiz.count({
      where: { categoryId: { in: allCategoryIds }, isPublished: true },
    }),
  ])

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  const quizCards: QuizCardData[] = quizzes.map((quiz) => ({
    id: quiz.id,
    title: quiz.title,
    coverImage: quiz.coverImage,
    difficulty:
      quiz.difficulty === 'EASY' || quiz.difficulty === 'MEDIUM' || quiz.difficulty === 'HARD'
        ? quiz.difficulty
        : 'MEDIUM',
    category: {
      name: quiz.category.name,
      color: quiz.category.color,
    },
    playCount: quiz.playCount,
    authorName: quiz.author?.name ?? undefined,
  }))

  const categorySlug = category.slug

  function buildUrl(p: number, s: SortOption) {
    const params = new URLSearchParams()
    if (p > 1) params.set('page', String(p))
    if (s !== 'popular') params.set('sort', s)
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

      {/* Sort + Results count */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalCount)} of{' '}
          {totalCount.toLocaleString()} results
        </p>
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
    </div>
  )
}
