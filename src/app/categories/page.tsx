import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { prisma } from '@/server/prisma'
import { absoluteUrl } from '@/lib/site'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Categories | BusQuiz',
  description: 'Browse quiz categories and jump into your next challenge.',
  alternates: {
    canonical: '/categories',
  },
  openGraph: {
    title: 'BusQuiz Categories',
    description: 'Browse quiz categories and discover new challenges.',
    url: absoluteUrl('/categories'),
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BusQuiz Categories',
    description: 'Browse quiz categories and discover new challenges.',
  },
}

interface CategoryWithQuizzes {
  slug: string
  name: string
  color: string
  quizCount: number
  topQuizzes: { id: string; title: string; playCount: number }[]
}

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { parentSlug: null },
    include: {
      quizzes: {
        where: { isPublished: true },
        select: { id: true },
      },
    },
    orderBy: { name: 'asc' },
  })

  // Fetch top 5 quizzes per parent category (including subcategory quizzes)
  const categorySlugs = categories.map((c) => c.slug)
  const subcategories = await prisma.category.findMany({
    where: { parentSlug: { in: categorySlugs } },
    select: { slug: true, parentSlug: true },
  })

  const parentToSubSlugs = new Map<string, string[]>()
  for (const sub of subcategories) {
    if (!sub.parentSlug) continue
    const arr = parentToSubSlugs.get(sub.parentSlug) ?? []
    arr.push(sub.slug)
    parentToSubSlugs.set(sub.parentSlug, arr)
  }

  const allWithQuizzes: CategoryWithQuizzes[] = await Promise.all(
    categories.map(async (cat) => {
      const slugs = [cat.slug, ...(parentToSubSlugs.get(cat.slug) ?? [])]

      const topQuizzes = await prisma.quiz.findMany({
        where: {
          isPublished: true,
          category: { slug: { in: slugs } },
        },
        orderBy: { playCount: 'desc' },
        take: 5,
        select: { id: true, title: true, playCount: true },
      })

      // Count quizzes across parent + children (include subcategory quiz counts)
      const childCounts = await prisma.category.findMany({
        where: { parentSlug: cat.slug },
        select: {
          _count: { select: { quizzes: { where: { isPublished: true } } } },
        },
      })
      const childTotal = childCounts.reduce((s, c) => s + c._count.quizzes, 0)

      return {
        slug: cat.slug,
        name: cat.name,
        color: cat.color,
        quizCount: cat.quizzes.length + childTotal,
        topQuizzes,
      }
    })
  )

  // Sort by quiz count descending
  allWithQuizzes.sort((a, b) => b.quizCount - a.quizCount)

  const totalQuizzes = allWithQuizzes.reduce((s, c) => s + c.quizCount, 0)

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <h1 className="text-3xl font-extrabold md:text-4xl">
          Browse <span className="text-primary">Categories</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          {allWithQuizzes.length} categories · {totalQuizzes} quizzes
        </p>
      </div>

      {/* Category grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-md">
      {/* Header — colored */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ backgroundColor: category.color + '14' }}
      >
        <Link
          href={`/categories/${category.slug}`}
          className="text-sm font-bold transition-colors hover:opacity-80"
          style={{ color: category.color }}
        >
          {category.name}
        </Link>
        <span className="text-xs font-semibold text-muted-foreground">({category.quizCount})</span>
      </div>

      {/* Quiz list */}
      <div className="flex flex-1 flex-col">
        {category.topQuizzes.length === 0 ? (
          <p className="px-4 py-6 text-center text-xs text-muted-foreground">No quizzes yet</p>
        ) : (
          <ul className="divide-y divide-border/50">
            {category.topQuizzes.map((quiz, i) => (
              <li key={quiz.id}>
                <Link
                  href={`/quiz/${quiz.id}`}
                  className={cn(
                    'flex items-center justify-between gap-3 px-4 py-2.5 transition-colors hover:bg-accent/60',
                    i % 2 === 0 ? 'bg-background/40' : 'bg-transparent'
                  )}
                >
                  <span className="min-w-0 flex-1 truncate text-sm">{quiz.title}</span>
                  <span className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
                    {formatCount(quiz.playCount)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {/* Browse all link */}
        <div className="mt-auto border-t px-4 py-2.5">
          <Link
            href={`/categories/${category.slug}`}
            className="inline-flex items-center text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
          >
            Browse all
            <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}
