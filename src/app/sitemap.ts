import type { MetadataRoute } from 'next'
import { prisma } from '@/server/prisma'
import { getAllBlogPosts } from '@/content/blog-posts'
import { quizCollections } from '@/content/collections'
import { absoluteUrl } from '@/lib/site'
import { getQuizPath } from '@/lib/quiz-url'
import { isQuizIndexable } from '@/lib/seo-metadata'

const STATIC_LAST_MODIFIED = new Date('2026-07-12')

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, quizzes, publicProfiles, publicPlaylists, latestPlay, latestDaily] =
    await Promise.all([
      prisma.category.findMany({ select: { slug: true, createdAt: true } }),
      prisma.quiz.findMany({
        where: { isPublished: true },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          difficulty: true,
          updatedAt: true,
          category: { select: { slug: true } },
          _count: {
            select: {
              questions: true,
              reports: { where: { status: 'PENDING' } },
            },
          },
        },
      }),
      prisma.user.findMany({
        where: { username: { not: null }, quizzes: { some: { isPublished: true } } },
        select: {
          username: true,
          createdAt: true,
          quizzes: {
            where: { isPublished: true },
            orderBy: { updatedAt: 'desc' },
            take: 1,
            select: { updatedAt: true },
          },
        },
      }),
      prisma.playlist.findMany({
        where: { isPublic: true, items: { some: { quiz: { isPublished: true } } } },
        select: { slug: true, updatedAt: true },
      }),
      prisma.playSession.aggregate({ _max: { createdAt: true } }),
      prisma.dailyQuiz.findFirst({ orderBy: { createdAt: 'desc' }, select: { createdAt: true } }),
    ])

  const indexableQuizzes = quizzes.filter((quiz) =>
    isQuizIndexable({
      description: quiz.description,
      questionCount: quiz._count.questions,
      pendingReportCount: quiz._count.reports,
    })
  )
  const latestQuizUpdate = indexableQuizzes.reduce<Date | null>(
    (latest, quiz) => (!latest || quiz.updatedAt > latest ? quiz.updatedAt : latest),
    null
  )
  const categoryLastModified = new Map<string, Date>()
  for (const quiz of indexableQuizzes) {
    const previous = categoryLastModified.get(quiz.category.slug)
    if (!previous || quiz.updatedAt > previous) {
      categoryLastModified.set(quiz.category.slug, quiz.updatedAt)
    }
  }
  const indexableCollections = quizCollections.filter((collection) => {
    const matchingCount = indexableQuizzes.filter(
      (quiz) =>
        (!collection.categorySlugs || collection.categorySlugs.includes(quiz.category.slug)) &&
        (!collection.difficulties || collection.difficulties.includes(quiz.difficulty))
    ).length
    return matchingCount >= 3
  })

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
      lastModified: latestPlay._max.createdAt ?? STATIC_LAST_MODIFIED,
      changeFrequency: 'hourly',
      priority: 0.6,
    },
    {
      url: absoluteUrl('/categories'),
      lastModified: latestQuizUpdate ?? STATIC_LAST_MODIFIED,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: absoluteUrl('/popular'),
      lastModified: latestQuizUpdate ?? STATIC_LAST_MODIFIED,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: absoluteUrl('/trending'),
      lastModified: latestPlay._max.createdAt ?? latestQuizUpdate ?? STATIC_LAST_MODIFIED,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: absoluteUrl('/daily'),
      lastModified: latestDaily?.createdAt ?? STATIC_LAST_MODIFIED,
      changeFrequency: 'daily',
      priority: 0.7,
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
      url: absoluteUrl('/about/accessibility'),
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: absoluteUrl('/contact'),
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: absoluteUrl('/privacy'),
      lastModified: new Date('2026-07-15'),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: absoluteUrl('/cookies'),
      lastModified: new Date('2026-07-15'),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: absoluteUrl('/terms'),
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: absoluteUrl('/survival'),
      lastModified: latestPlay._max.createdAt ?? STATIC_LAST_MODIFIED,
      changeFrequency: 'daily',
      priority: 0.7,
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
    ...indexableCollections.map((collection) => ({
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
      lastModified: categoryLastModified.get(category.slug) ?? category.createdAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...indexableQuizzes.map((quiz) => ({
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
              lastModified: user.quizzes[0]?.updatedAt ?? user.createdAt,
              changeFrequency: 'weekly' as const,
              priority: 0.5,
            },
          ]
        : []
    ),
    ...publicPlaylists.map((playlist) => ({
      url: absoluteUrl(`/playlists/${playlist.slug}`),
      lastModified: playlist.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ]
}
