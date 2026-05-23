import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { prisma } from '@/server/prisma'
import { CategoryBrowser } from './category-browser'
import { absoluteUrl } from '@/lib/site'
import type { QuizCardData } from '@/components/ui/quiz-card'

export const metadata: Metadata = {
  title: 'Categories | QuizArena',
  description: 'Browse quiz categories and jump into your next challenge.',
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

export interface SubcategoryData {
  slug: string
  name: string
  description: string
  icon: string
  color: string
  quizCount: number
  totalPlays: number
}

export interface ParentCategoryData {
  slug: string
  name: string
  description: string
  icon: string
  color: string
  quizCount: number
  totalPlays: number
  subcategories: SubcategoryData[]
  featuredQuizzes: QuizCardData[]
}

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      quizzes: {
        where: { isPublished: true },
        select: {
          id: true,
          title: true,
          coverImage: true,
          difficulty: true,
          playCount: true,
          avgScore: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  const parents = categories.filter((c) => !c.parentSlug)
  const subcats = categories.filter((c) => Boolean(c.parentSlug))

  const parentCategories: ParentCategoryData[] = parents
    .map((parent) => {
      const children = subcats.filter((s) => s.parentSlug === parent.slug)
      const childSubcategories: SubcategoryData[] = children
        .map((child) => ({
          slug: child.slug,
          name: child.name,
          description: child.description,
          icon: child.icon,
          color: child.color,
          quizCount: child.quizzes.length,
          totalPlays: child.quizzes.reduce((s, q) => s + q.playCount, 0),
        }))
        .sort((a, b) => b.quizCount - a.quizCount)

      const ownQuizCount = parent.quizzes.length
      const childQuizCount = childSubcategories.reduce((s, c) => s + c.quizCount, 0)
      const ownPlays = parent.quizzes.reduce((s, q) => s + q.playCount, 0)
      const childPlays = childSubcategories.reduce((s, c) => s + c.totalPlays, 0)
      const featuredQuizzes = [...parent.quizzes]
        .sort((a, b) => b.playCount - a.playCount)
        .slice(0, 4)
        .map<QuizCardData>((quiz) => ({
          id: quiz.id,
          title: quiz.title,
          coverImage: quiz.coverImage,
          playCount: quiz.playCount,
          avgScore: quiz.avgScore,
          difficulty:
            quiz.difficulty === 'EASY' || quiz.difficulty === 'MEDIUM' || quiz.difficulty === 'HARD'
              ? quiz.difficulty
              : 'MEDIUM',
          category: {
            name: parent.name,
            color: parent.color,
          },
        }))

      return {
        slug: parent.slug,
        name: parent.name,
        description: parent.description,
        icon: parent.icon,
        color: parent.color,
        quizCount: ownQuizCount + childQuizCount,
        totalPlays: ownPlays + childPlays,
        subcategories: childSubcategories,
        featuredQuizzes,
      }
    })
    .sort((a, b) => b.quizCount - a.quizCount)

  const totalQuizzes = parentCategories.reduce((s, p) => s + p.quizCount, 0)
  const totalCategories = categories.length

  return (
    <div className="container mx-auto px-4 py-12">
      <PageHeader
        back={
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        }
        title={
          <>
            Browse{' '}
            <span className="bg-gradient-to-r from-quiz-purple to-quiz-pink bg-clip-text text-transparent">
              Categories
            </span>
          </>
        }
        description={`${totalCategories} categories · ${totalQuizzes} quizzes`}
      />

      <CategoryBrowser
        parentCategories={parentCategories}
        totalQuizzes={totalQuizzes}
        totalCategories={totalCategories}
      />
    </div>
  )
}
