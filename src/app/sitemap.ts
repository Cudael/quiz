import type { MetadataRoute } from 'next'
import { prisma } from '@/server/prisma'
import { getAllBlogPosts } from '@/content/blog-posts'
import { quizCollections } from '@/content/collections'
import { absoluteUrl } from '@/lib/site'
import { getQuizPath } from '@/lib/quiz-url'
import { isQuizIndexable, isQuizListingIndexable } from '@/lib/seo-metadata'
import { countUsefulQuestionExplanations } from '@/domain/quiz-publication-quality'

const STATIC_LAST_MODIFIED = new Date('2026-07-12')

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [
    categories,
    quizzes,
    publicProfiles,
    publicPlaylists,
    latestPlay,
    latestDaily,
    badgeCount,
  ] = await Promise.all([
    prisma.category.findMany({ select: { slug: true, parentSlug: true, createdAt: true } }),
    prisma.quiz.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        difficulty: true,
        authorId: true,
        updatedAt: true,
        category: { select: { slug: true } },
        questions: {
          where: { explanation: { not: null } },
          select: { explanation: true },
        },
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
        id: true,
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
      select: {
        slug: true,
        updatedAt: true,
        items: {
          where: { quiz: { isPublished: true } },
          select: { quizId: true },
        },
      },
    }),
    prisma.playSession.aggregate({ _max: { createdAt: true } }),
    prisma.dailyQuiz.findFirst({ orderBy: { createdAt: 'desc' }, select: { createdAt: true } }),
    prisma.badge.count(),
  ])

  const indexableQuizzes = quizzes.filter((quiz) =>
    isQuizIndexable({
      description: quiz.description,
      questionCount: quiz._count.questions,
      explainedQuestionCount: countUsefulQuestionExplanations(quiz.questions),
      pendingReportCount: quiz._count.reports,
    })
  )
  const latestQuizUpdate = indexableQuizzes.reduce<Date | null>(
    (latest, quiz) => (!latest || quiz.updatedAt > latest ? quiz.updatedAt : latest),
    null
  )
  const indexableQuizIds = new Set(indexableQuizzes.map((quiz) => quiz.id))
  const indexableAuthorIds = new Set(indexableQuizzes.map((quiz) => quiz.authorId))
  const categoriesBySlug = new Map(categories.map((category) => [category.slug, category]))
  const categoryLastModified = new Map<string, Date>()
  const categoryQuizCounts = new Map<string, number>()
  for (const quiz of indexableQuizzes) {
    const category = categoriesBySlug.get(quiz.category.slug)
    const listingSlugs = [quiz.category.slug, category?.parentSlug].filter(
      (value): value is string => Boolean(value)
    )

    for (const listingSlug of listingSlugs) {
      categoryQuizCounts.set(listingSlug, (categoryQuizCounts.get(listingSlug) ?? 0) + 1)
      const previous = categoryLastModified.get(listingSlug)
      if (!previous || quiz.updatedAt > previous) {
        categoryLastModified.set(listingSlug, quiz.updatedAt)
      }
    }
  }
  const indexableCollections = quizCollections.filter((collection) => {
    const matchingCount = indexableQuizzes.filter(
      (quiz) =>
        (!collection.categorySlugs || collection.categorySlugs.includes(quiz.category.slug)) &&
        (!collection.difficulties || collection.difficulties.includes(quiz.difficulty))
    ).length
    return isQuizListingIndexable(matchingCount)
  })

  const blogPosts = getAllBlogPosts()

  return [
    {
      url: absoluteUrl('/'),
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'daily',
      priority: 1,
    },
    ...(latestPlay._max.createdAt
      ? [
          {
            url: absoluteUrl('/leaderboard'),
            lastModified: latestPlay._max.createdAt,
            changeFrequency: 'hourly' as const,
            priority: 0.6,
          },
        ]
      : []),
    ...(isQuizListingIndexable(indexableQuizzes.length)
      ? [
          {
            url: absoluteUrl('/categories'),
            lastModified: latestQuizUpdate ?? STATIC_LAST_MODIFIED,
            changeFrequency: 'daily' as const,
            priority: 0.9,
          },
        ]
      : []),
    ...(isQuizListingIndexable(indexableQuizzes.length)
      ? [
          {
            url: absoluteUrl('/popular'),
            lastModified: latestQuizUpdate ?? STATIC_LAST_MODIFIED,
            changeFrequency: 'daily' as const,
            priority: 0.8,
          },
        ]
      : []),
    ...(latestPlay._max.createdAt
      ? [
          {
            url: absoluteUrl('/trending'),
            lastModified: latestPlay._max.createdAt,
            changeFrequency: 'daily' as const,
            priority: 0.8,
          },
        ]
      : []),
    ...(latestDaily
      ? [
          {
            url: absoluteUrl('/daily'),
            lastModified: latestDaily.createdAt,
            changeFrequency: 'daily' as const,
            priority: 0.7,
          },
        ]
      : []),
    ...(badgeCount > 0
      ? [
          {
            url: absoluteUrl('/badges'),
            lastModified: STATIC_LAST_MODIFIED,
            changeFrequency: 'weekly' as const,
            priority: 0.7,
          },
        ]
      : []),
    {
      url: absoluteUrl('/about'),
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: absoluteUrl('/about/accessibility'),
      lastModified: new Date('2026-07-16'),
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
      lastModified: new Date('2026-07-16'),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: absoluteUrl('/cookies'),
      lastModified: new Date('2026-07-16'),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: absoluteUrl('/terms'),
      lastModified: new Date('2026-07-16'),
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
    ...(isQuizListingIndexable(indexableQuizzes.length)
      ? [
          {
            url: absoluteUrl('/stats'),
            lastModified: latestPlay._max.createdAt ?? latestQuizUpdate ?? STATIC_LAST_MODIFIED,
            changeFrequency: 'weekly' as const,
            priority: 0.6,
          },
        ]
      : []),
    ...(indexableCollections.length > 0
      ? [
          {
            url: absoluteUrl('/collections'),
            lastModified: latestQuizUpdate ?? STATIC_LAST_MODIFIED,
            changeFrequency: 'weekly' as const,
            priority: 0.8,
          },
        ]
      : []),
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
    ...categories
      .filter((category) => isQuizListingIndexable(categoryQuizCounts.get(category.slug) ?? 0))
      .map((category) => ({
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
      user.username && indexableAuthorIds.has(user.id)
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
    ...publicPlaylists
      .filter((playlist) => playlist.items.some((item) => indexableQuizIds.has(item.quizId)))
      .map((playlist) => ({
        url: absoluteUrl(`/playlists/${playlist.slug}`),
        lastModified: playlist.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })),
  ]
}
