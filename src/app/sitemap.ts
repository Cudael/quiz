import type { MetadataRoute } from 'next'
import { prisma } from '@/server/prisma'
import { getAllBlogPosts } from '@/content/blog-posts'
import { quizCollections } from '@/content/collections'
import { absoluteUrl } from '@/lib/site'
import { getQuizPath } from '@/lib/quiz-url'

const STATIC_LAST_MODIFIED = new Date('2026-06-27')

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, quizzes, publicProfiles] = await Promise.all([
    prisma.category.findMany({ select: { slug: true, createdAt: true } }),
    prisma.quiz.findMany({
      where: { isPublished: true },
      select: { id: true, title: true, slug: true, updatedAt: true },
    }),
    prisma.user.findMany({
      where: { username: { not: null }, quizzes: { some: { isPublished: true } } },
      select: { username: true, createdAt: true },
    }),
  ])

  const blogPosts = getAllBlogPosts()

  return [
    {
      url: absoluteUrl('/'),
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: absoluteUrl('/leaderboard'),
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'hourly',
      priority: 0.6,
    },
    {
      url: absoluteUrl('/categories'),
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: absoluteUrl('/popular'),
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: absoluteUrl('/trending'),
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: absoluteUrl('/badges'),
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: absoluteUrl('/about'),
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: absoluteUrl('/learn'),
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: absoluteUrl('/challenges'),
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: absoluteUrl('/trivia-facts'),
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: absoluteUrl('/stats'),
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: absoluteUrl('/collections'),
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...quizCollections.map((collection) => ({
      url: absoluteUrl(`/collections/${collection.slug}`),
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'weekly' as const,
      priority: 0.75,
    })),
    {
      url: absoluteUrl('/blog'),
      lastModified: STATIC_LAST_MODIFIED,
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
      url: absoluteUrl(`/categories/${category.slug}`),
      lastModified: category.createdAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...quizzes.map((quiz) => ({
      url: absoluteUrl(getQuizPath(quiz)),
      lastModified: quiz.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...publicProfiles.flatMap((user) =>
      user.username
        ? [
            {
              url: absoluteUrl(`/u/${user.username}`),
              lastModified: user.createdAt,
              changeFrequency: 'weekly' as const,
              priority: 0.5,
            },
          ]
        : []
    ),
  ]
}
