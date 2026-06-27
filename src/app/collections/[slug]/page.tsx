import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { QuizCardHorizontal, type QuizCardData } from '@/components/ui/quiz-card'
import { getDisplayAuthorName } from '@/lib/author-display'
import { absoluteUrl } from '@/lib/site'
import { serializeJsonLd } from '@/lib/seo'
import { getQuizPath } from '@/lib/quiz-url'
import { getQuizCollection, quizCollections } from '@/content/collections'
import { prisma } from '@/server/prisma'

export function generateStaticParams() {
  return quizCollections.map((collection) => ({ slug: collection.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const collection = getQuizCollection(slug)
  if (!collection) return { title: 'Collection not found | BusQuiz' }

  return {
    title: `${collection.title} | BusQuiz`,
    description: collection.description,
    alternates: { canonical: `/collections/${collection.slug}` },
    openGraph: {
      title: `${collection.title} | BusQuiz`,
      description: collection.description,
      url: absoluteUrl(`/collections/${collection.slug}`),
    },
  }
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const collection = getQuizCollection(slug)
  if (!collection) notFound()

  const orderBy =
    collection.sort === 'newest'
      ? { createdAt: 'desc' as const }
      : collection.sort === 'rating'
        ? { playCount: 'desc' as const }
        : { playCount: 'desc' as const }

  const quizzes = await prisma.quiz.findMany({
    where: {
      isPublished: true,
      ...(collection.difficulties ? { difficulty: { in: collection.difficulties } } : {}),
      ...(collection.categorySlugs ? { category: { slug: { in: collection.categorySlugs } } } : {}),
    },
    orderBy,
    take: 24,
    select: {
      id: true,
      title: true,
      coverImage: true,
      difficulty: true,
      playCount: true,
      avgScore: true,
      author: { select: { name: true, role: true } },
      category: { select: { name: true, color: true } },
      _count: { select: { ratings: true } },
      ratings: { select: { stars: true } },
    },
  })

  const quizCards: QuizCardData[] = quizzes.map((quiz) => {
    const ratingCount = quiz._count.ratings
    const avgRating =
      ratingCount > 0
        ? quiz.ratings.reduce((sum, rating) => sum + rating.stars, 0) / ratingCount
        : undefined

    return {
      id: quiz.id,
      title: quiz.title,
      coverImage: quiz.coverImage,
      difficulty: quiz.difficulty,
      category: quiz.category,
      playCount: quiz.playCount,
      avgScore: quiz.avgScore,
      avgRating,
      ratingCount,
      authorName: getDisplayAuthorName(quiz.author),
    }
  })

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: collection.title,
    description: collection.description,
    url: absoluteUrl(`/collections/${collection.slug}`),
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: quizzes.map((quiz, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: quiz.title,
        url: absoluteUrl(getQuizPath(quiz)),
      })),
    },
  }

  return (
    <div className="container mx-auto space-y-8 px-4 py-12 md:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <div>
        <Button variant="ghost" asChild className="mb-4 -ml-2">
          <Link href="/collections">
            <ArrowLeft className="mr-2 h-4 w-4" />
            All Collections
          </Link>
        </Button>
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">{collection.title}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{collection.description}</p>
      </div>

      {quizCards.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {quizCards.map((quiz) => (
            <QuizCardHorizontal key={quiz.id} quiz={quiz} className="w-full min-w-0" />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed bg-muted/30 p-10 text-center text-sm text-muted-foreground">
          No quizzes match this collection yet.
        </div>
      )}
    </div>
  )
}
