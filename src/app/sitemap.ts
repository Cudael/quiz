import type { MetadataRoute } from 'next'
import { prisma } from '@/server/prisma'
import { getAllBlogPosts } from '@/content/blog-posts'
import { absoluteUrl } from '@/lib/site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, quizzes] = await Promise.all([
    prisma.category.findMany({ select: { slug: true, createdAt: true } }),
    prisma.quiz.findMany({ where: { isPublished: true }, select: { id: true, updatedAt: true } }),
  ])

  const blogPosts = getAllBlogPosts()

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
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: absoluteUrl('/categories'),
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: absoluteUrl('/blog'),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...blogPosts.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: new Date(post.date),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
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
