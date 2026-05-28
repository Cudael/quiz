import type { Metadata } from 'next'
import type React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import * as LucideIcons from 'lucide-react'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { notFound } from 'next/navigation'
import { absoluteUrl } from '@/lib/site'
import { withAlphaColor } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { QuizCard } from '@/components/ui/quiz-card'
import type { QuizCardData } from '@/components/ui/quiz-card'
import { prisma } from '@/server/prisma'

type IconLikeProps = {
  className?: string
  style?: React.CSSProperties
  'aria-hidden'?: boolean
}

function isIconComponent(value: unknown): value is React.ComponentType<IconLikeProps> {
  return typeof value === 'function'
}

function renderLucideIcon(name: string, className: string, color: string) {
  const maybeIcon = LucideIcons[name as keyof typeof LucideIcons]
  if (!isIconComponent(maybeIcon)) return null
  const Icon = maybeIcon

  return <Icon className={className} style={{ color } as React.CSSProperties} aria-hidden />
}

const SUBCATEGORY_ICON_BG_ALPHA = 0.13

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
      alternates: {
        canonical: `/categories/${slug}`,
      },
    }
  }

  const title = `${category.name} Quizzes | BusQuiz`
  const description =
    category.description || `Play quizzes in the ${category.name} category on BusQuiz.`
  const url = absoluteUrl(`/categories/${category.slug}`)

  return {
    title,
    description,
    alternates: {
      canonical: `/categories/${category.slug}`,
    },
    openGraph: { title, description, url },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
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

  if (!category) {
    notFound()
  }

  const [subcategories, quizzes, parentCategory] = await Promise.all([
    prisma.category.findMany({
      where: { parentSlug: category.slug },
      include: {
        quizzes: {
          where: { isPublished: true },
          select: { id: true },
        },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.quiz.findMany({
      where: {
        categoryId: category.id,
        isPublished: true,
      },
      orderBy: { playCount: 'desc' },
      select: {
        id: true,
        title: true,
        coverImage: true,
        difficulty: true,
      },
    }),
    category.parentSlug
      ? prisma.category.findUnique({
          where: { slug: category.parentSlug },
          select: { slug: true, name: true },
        })
      : Promise.resolve(null),
  ])

  const quizCards: QuizCardData[] = quizzes.map((quiz) => ({
    id: quiz.id,
    title: quiz.title,
    coverImage: quiz.coverImage,
    difficulty:
      quiz.difficulty === 'EASY' || quiz.difficulty === 'MEDIUM' || quiz.difficulty === 'HARD'
        ? quiz.difficulty
        : 'MEDIUM',
    category: {
      name: category.name,
      color: category.color,
    },
  }))

  return (
    <div className="container mx-auto space-y-8 px-4 py-12">
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

      <section
        className="rounded-3xl border border-border/70 p-6 md:p-8"
        style={{
          backgroundImage: `linear-gradient(135deg, ${category.color}44 0%, hsl(var(--card)) 75%)`,
        }}
      >
        <PageHeader
          className="mb-0"
          back={
            <Button variant="ghost" asChild>
              <Link href="/categories">
                <ArrowLeft className="mr-2 h-4 w-4" />
                All Categories
              </Link>
            </Button>
          }
          title={
            <span className="inline-flex items-center gap-3">
              <span
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ backgroundColor: 'rgb(255 255 255 / 0.45)' }}
              >
                {renderLucideIcon(category.icon, 'h-6 w-6', category.color)}
              </span>
              {category.name}
            </span>
          }
          description={
            <span>
              {category.description} · {quizCards.length}{' '}
              {quizCards.length === 1 ? 'quiz' : 'quizzes'}
            </span>
          }
        />
      </section>

      {subcategories.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-xl font-bold">Subcategories</h2>
          <div className="space-y-2">
            {subcategories.map((sub) => {
              return (
                <Link
                  key={sub.slug}
                  href={`/categories/${sub.slug}`}
                  className="group flex items-center gap-3 rounded-2xl border border-border bg-card/70 p-3 transition hover:border-transparent hover:shadow-sm"
                >
                  <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl">
                    {sub.imageUrl ? (
                      <Image
                        src={sub.imageUrl}
                        alt={sub.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    ) : (
                      <span
                        className="flex h-10 w-10 items-center justify-center rounded-xl"
                        style={{
                          backgroundColor: withAlphaColor(sub.color, SUBCATEGORY_ICON_BG_ALPHA),
                        }}
                      >
                        {renderLucideIcon(sub.icon, 'h-5 w-5', sub.color)}
                      </span>
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold transition-colors group-hover:text-primary">
                      {sub.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {sub.quizzes.length} {sub.quizzes.length === 1 ? 'quiz' : 'quizzes'}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                </Link>
              )
            })}
          </div>
        </section>
      ) : null}

      {quizCards.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-xl font-bold">Quizzes</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quizCards.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
          </div>
        </section>
      ) : null}

      {quizCards.length === 0 && subcategories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
          <p className="text-sm text-muted-foreground">
            No published quizzes or subcategories in this category yet.
          </p>
          <div className="mt-4">
            <Button variant="outline" asChild>
              <Link href="/categories">Browse other categories</Link>
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
