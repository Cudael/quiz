import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { absoluteUrl } from '@/lib/site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, quizzes] = await Promise.all([
    prisma.category.findMany({ select: { slug: true, createdAt: true } }),
    prisma.quiz.findMany({ where: { isPublished: true }, select: { id: true, updatedAt: true } }),
  ])

  return [
    {
      url: absoluteUrl('/'),
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: absoluteUrl('/leaderboard'),
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: absoluteUrl('/categories'),
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...categories.map((category) => ({
      url: absoluteUrl(`/categories?category=${category.slug}`),
      lastModified: category.createdAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...quizzes.map((quiz) => ({
      url: absoluteUrl(`/quiz/${quiz.id}`),
      lastModified: quiz.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ]
}
