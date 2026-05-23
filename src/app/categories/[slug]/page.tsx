import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { absoluteUrl } from '@/lib/site'
import { prisma } from '@/server/prisma'

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
      title: 'Category not found | QuizArena',
      description: 'This category could not be found.',
      alternates: {
        canonical: `/categories/${slug}`,
      },
    }
  }

  const title = `${category.name} Quizzes | QuizArena`
  const description =
    category.description || `Play quizzes in the ${category.name} category on QuizArena.`
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
    select: { slug: true },
  })

  if (!category) {
    notFound()
  }

  redirect(`/categories?category=${encodeURIComponent(slug)}`)
}
