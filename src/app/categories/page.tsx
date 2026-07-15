import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Search, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { QuizCardHorizontal, type QuizCardData } from '@/components/ui/quiz-card'
import { prisma } from '@/server/prisma'
import { absoluteUrl } from '@/lib/site'
import { cn } from '@/lib/utils'
import { getDisplayAuthorName } from '@/lib/author-display'
import { getQuizPath } from '@/lib/quiz-url'
import { categoryIcons } from '@/lib/category-icons'
import { isQuizListingIndexable } from '@/lib/seo-metadata'

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}): Promise<Metadata> {
  const query = (await searchParams).q?.trim()
  const publishedQuizCount = query ? 0 : await prisma.quiz.count({ where: { isPublished: true } })
  return {
    title: query ? `Search results for “${query.slice(0, 50)}”` : 'Quiz Categories',
    description: 'Browse quiz categories and jump into your next challenge.',
    alternates: { canonical: '/categories' },
    robots:
      query || !isQuizListingIndexable(publishedQuizCount)
        ? { index: false, follow: true }
        : undefined,
    openGraph: {
      title: 'BusQuiz Quiz Categories',
      description: 'Browse quiz categories and discover new challenges.',
      url: absoluteUrl('/categories'),
    },
    twitter: {
      card: 'summary_large_image',
      title: 'BusQuiz Quiz Categories',
      description: 'Browse quiz categories and discover new challenges.',
    },
  }
}

interface CategoryWithQuizzes {
  slug: string
  name: string
  color: string
  icon: string
  quizCount: number
  topQuizzes: { id: string; title: string; slug: string | null; playCount: number }[]
}

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = q?.trim()

  // Search mode: find quizzes matching the query
  if (query) {
    const raw = await prisma.quiz.findMany({
      where: {
        isPublished: true,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { category: { name: { contains: query, mode: 'insensitive' } } },
          { author: { username: { contains: query, mode: 'insensitive' } } },
        ],
      },
      orderBy: [{ playCount: 'desc' }, { createdAt: 'desc' }],
      take: 50,
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
        difficulty: true,
        playCount: true,
        avgScore: true,
        author: { select: { username: true, role: true } },
        category: { select: { slug: true, name: true, icon: true, color: true } },
        _count: { select: { ratings: true } },
        ratings: { select: { stars: true } },
      },
    })

    const quizzes: QuizCardData[] = raw.map((quiz) => {
      const ratingCount = quiz._count.ratings
      const avgRating =
        ratingCount > 0
          ? quiz.ratings.reduce((sum, r) => sum + r.stars, 0) / ratingCount
          : undefined
      return {
        id: quiz.id,
        title: quiz.title,
        slug: quiz.slug,
        coverImage: quiz.coverImage,
        difficulty: quiz.difficulty as 'EASY' | 'MEDIUM' | 'HARD',
        category: {
          name: quiz.category.name,
          color: quiz.category.color || 'var(--background-image-card-gradient)',
        },
        playCount: quiz.playCount,
        avgScore: quiz.avgScore ?? undefined,
        avgRating,
        ratingCount,
        authorName: quiz.author ? getDisplayAuthorName(quiz.author) : undefined,
      }
    })

    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4 -ml-2">
            <Link href="/categories">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Categories
            </Link>
          </Button>
          <h1 className="text-3xl font-extrabold md:text-4xl">
            Search results for &ldquo;{query}&rdquo;
          </h1>
          <p className="mt-2 text-muted-foreground">
            {quizzes.length} {quizzes.length === 1 ? 'quiz' : 'quizzes'} found
          </p>
        </div>

        {quizzes.length === 0 ? (
          <div className="rounded-md border border-dashed bg-accent/20 p-12 text-center">
            <Search className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No quizzes match &ldquo;{query}&rdquo;. Try a different search term.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {quizzes.map((quiz) => (
              <QuizCardHorizontal key={quiz.id} quiz={quiz} className="w-full min-w-0" />
            ))}
          </div>
        )}
      </div>
    )
  }

  // Default: show category grid with batched data loading (no per-category fan-out)
  const parentCategories = await prisma.category.findMany({
    where: { parentSlug: null },
    select: {
      id: true,
      slug: true,
      name: true,
      color: true,
      icon: true,
    },
    orderBy: { name: 'asc' },
  })

  const parentSlugs = parentCategories.map((c) => c.slug)
  const subcategories =
    parentSlugs.length > 0
      ? await prisma.category.findMany({
          where: { parentSlug: { in: parentSlugs } },
          select: { id: true, slug: true, parentSlug: true },
        })
      : []

  const categoryIdToSlug = new Map<string, string>()
  for (const parent of parentCategories) {
    categoryIdToSlug.set(parent.id, parent.slug)
  }
  for (const sub of subcategories) {
    categoryIdToSlug.set(sub.id, sub.slug)
  }

  const allRelevantCategoryIds = [...categoryIdToSlug.keys()]

  const [publishedCounts, publishedQuizzes] =
    allRelevantCategoryIds.length > 0
      ? await Promise.all([
          prisma.quiz.groupBy({
            by: ['categoryId'],
            where: {
              isPublished: true,
              categoryId: { in: allRelevantCategoryIds },
            },
            _count: { _all: true },
          }),
          prisma.quiz.findMany({
            where: {
              isPublished: true,
              categoryId: { in: allRelevantCategoryIds },
            },
            orderBy: { playCount: 'desc' },
            select: { id: true, title: true, slug: true, playCount: true, categoryId: true },
          }),
        ])
      : [[], []]

  const quizCountBySlug = new Map<string, number>()
  for (const entry of publishedCounts) {
    const slug = categoryIdToSlug.get(entry.categoryId)
    if (!slug) continue
    quizCountBySlug.set(slug, entry._count._all)
  }

  const parentToSubSlugs = new Map<string, string[]>()
  const subSlugToParentSlug = new Map<string, string>()
  for (const sub of subcategories) {
    if (!sub.parentSlug) continue
    const arr = parentToSubSlugs.get(sub.parentSlug) ?? []
    arr.push(sub.slug)
    parentToSubSlugs.set(sub.parentSlug, arr)
    subSlugToParentSlug.set(sub.slug, sub.parentSlug)
  }

  const topQuizzesByParent = new Map<
    string,
    { id: string; title: string; slug: string | null; playCount: number }[]
  >()
  for (const parent of parentCategories) {
    topQuizzesByParent.set(parent.slug, [])
  }

  for (const quiz of publishedQuizzes) {
    const categorySlug = categoryIdToSlug.get(quiz.categoryId)
    if (!categorySlug) continue
    const parentSlug = subSlugToParentSlug.get(categorySlug) ?? categorySlug
    const bucket = topQuizzesByParent.get(parentSlug)
    if (!bucket || bucket.length >= 5) continue
    bucket.push({
      id: quiz.id,
      title: quiz.title,
      slug: quiz.slug,
      playCount: quiz.playCount,
    })
  }

  const allWithQuizzes: CategoryWithQuizzes[] = parentCategories
    .map((cat) => {
      const childSlugs = parentToSubSlugs.get(cat.slug) ?? []
      const childTotal = childSlugs.reduce((sum, slug) => sum + (quizCountBySlug.get(slug) ?? 0), 0)
      const parentTotal = quizCountBySlug.get(cat.slug) ?? 0

      return {
        slug: cat.slug,
        name: cat.name,
        color: cat.color || 'var(--color-quiz-blue)',
        icon: cat.icon || 'HelpCircle',
        quizCount: parentTotal + childTotal,
        topQuizzes: topQuizzesByParent.get(cat.slug) ?? [],
      }
    })
    .filter((category) => isQuizListingIndexable(category.quizCount))

  // Sort by quiz count descending
  allWithQuizzes.sort((a, b) => b.quizCount - a.quizCount)

  const totalQuizzes = allWithQuizzes.reduce((s, c) => s + c.quizCount, 0)

  return (
    <div className="container mx-auto px-4 py-8 md:px-6">
      {/* Header */}
      <div className="relative mb-10 overflow-hidden rounded-md border border-border/50 bg-card p-6 md:p-8">
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="-ml-2 mb-2 h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <Link href="/">
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                Back to Home
              </Link>
            </Button>
            <p className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              <span aria-hidden className="h-2 w-2 shrink-0 bg-quiz-blue" />
              Explore
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl text-foreground">
              Browse Quiz Categories
            </h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl">
              Test your knowledge across {allWithQuizzes.length} parent topics. Explore
              subcategories, seek legendary scores, and claim your crown!
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-sm border border-border/60 bg-background/50 px-4 py-1.5 text-sm font-semibold backdrop-blur-sm">
            <Layers className="h-4 w-4 text-foreground" />
            <span className="font-bold tabular-nums text-foreground">
              {totalQuizzes.toLocaleString()}
            </span>
            <span className="text-muted-foreground">total quizzes</span>
          </div>
        </div>
      </div>

      {/* Category grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {allWithQuizzes.map((cat) => (
          <CategoryCard key={cat.slug} category={cat} />
        ))}
      </div>
    </div>
  )
}

/** Formats a play count for display. */
function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`
  return n.toString()
}

function CategoryCard({ category }: { category: CategoryWithQuizzes }) {
  const Icon = categoryIcons[category.icon] || categoryIcons['HelpCircle']

  return (
    <div className="flex flex-col overflow-hidden rounded-md border border-border/40 bg-card/65 backdrop-blur-sm transition-all duration-300 hover:border-border/85 hover:bg-card hover:shadow-md group">
      {/* Header — elegant glow & matching theme accent */}
      <div
        className="flex items-center justify-between px-4 py-3.5 border-b border-border/20 transition-all duration-300"
        style={{
          backgroundColor: category.color + '0d',
          borderBottomColor: category.color + '26',
        }}
      >
        <Link
          href={`/categories/${category.slug}`}
          className="flex items-center gap-2 text-sm font-bold tracking-tight transition-colors duration-200 group-hover:opacity-90"
          style={{ color: category.color }}
        >
          <span
            className="flex h-7 w-7 items-center justify-center rounded-md transition-all duration-300 group-hover:scale-110"
            style={{
              backgroundColor: category.color + '18',
              color: category.color,
            }}
          >
            <Icon className="h-3.5 w-3.5" />
          </span>
          <span className="truncate">{category.name}</span>
        </Link>
        <span className="rounded-sm bg-muted/50 px-2 py-0.5 text-[11px] font-semibold text-muted-foreground/90 select-none">
          {category.quizCount}
        </span>
      </div>

      {/* Quiz list */}
      <div className="flex flex-1 flex-col">
        {category.topQuizzes.length === 0 ? (
          <div className="flex flex-1 items-center justify-center px-4 py-8">
            <p className="text-center text-xs text-muted-foreground italic">No quizzes yet</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/30">
            {category.topQuizzes.map((quiz, i) => (
              <li key={quiz.id}>
                <Link
                  href={getQuizPath(quiz)}
                  className={cn(
                    'flex items-center justify-between gap-3 px-4 py-2.5 transition-all duration-200 hover:bg-accent/40',
                    i % 2 === 0 ? 'bg-background/20' : 'bg-transparent'
                  )}
                >
                  <span className="min-w-0 flex-1 truncate text-xs font-semibold text-foreground/85 transition-colors group-hover:text-foreground">
                    {quiz.title}
                  </span>
                  <span className="shrink-0 text-[10px] font-medium tabular-nums text-muted-foreground/80">
                    {formatCount(quiz.playCount)} plays
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {/* Browse all link */}
        <div className="mt-auto border-t border-border/20 px-4 py-2.5 bg-muted/5">
          <Link
            href={`/categories/${category.slug}`}
            className="inline-flex items-center text-xs font-bold text-muted-foreground transition-colors hover:text-foreground"
          >
            Browse all quizzes
            <ArrowRight className="ml-1 h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
