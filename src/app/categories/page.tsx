import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prisma'
import { CategoryBrowser } from './category-browser'
import { absoluteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Categories | QuizArena',
  description: 'Browse quiz categories, filter by difficulty, and jump into your next challenge.',
  openGraph: {
    title: 'QuizArena Categories',
    description: 'Browse quiz categories and discover new challenges.',
    url: absoluteUrl('/categories'),
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QuizArena Categories',
    description: 'Browse quiz categories and discover new challenges.',
  },
}

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: 'asc' },
    include: {
      quizzes: {
        select: {
          id: true,
          title: true,
          difficulty: true,
          playCount: true,
          createdAt: true,
        },
        where: { isPublished: true },
      },
    },
  })

  // Serialize dates for client component
  const serialized = categories.map((cat) => ({
    ...cat,
    createdAt: cat.createdAt.toISOString(),
    quizzes: cat.quizzes.map((q) => ({
      ...q,
      createdAt: q.createdAt.toISOString(),
    })),
  }))

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <Button variant="ghost" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>

      <div className="mb-10">
        <h1 className="text-3xl font-extrabold md:text-4xl">
          Browse{' '}
          <span className="bg-gradient-to-r from-quiz-purple to-quiz-pink bg-clip-text text-transparent">
            Categories
          </span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          {categories.length} categories ·{' '}
          {categories.reduce((sum, c) => sum + c.quizzes.length, 0)} quizzes
        </p>
      </div>

      <CategoryBrowser categories={serialized} />
    </div>
  )
}
