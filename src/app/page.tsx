import type { Metadata } from 'next'
import { Suspense } from 'react'
import { HomePage as HomePageContent, HomePageSkeleton } from '@/components/home/home-page'
import { CategoryBar } from '@/components/layout/category-bar'
import { absoluteUrl } from '@/lib/site'
import { serializeJsonLd } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Free Online Quiz & Trivia Platform',
  description:
    'Test your knowledge across hundreds of categories. Create quizzes, compete on leaderboards, and earn badges.',
  openGraph: {
    title: 'Free Online Quiz & Trivia Platform',
    description:
      'Test your knowledge across hundreds of categories. Create quizzes, compete on leaderboards, and earn badges.',
    url: absoluteUrl('/'),
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Online Quiz & Trivia Platform',
    description:
      'Test your knowledge across hundreds of categories. Create quizzes, compete on leaderboards, and earn badges.',
  },
}

export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'BusQuiz',
    url: absoluteUrl('/'),
    description:
      'Test your knowledge across hundreds of categories. Create quizzes, compete on leaderboards, and earn badges.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${absoluteUrl('/categories')}?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <Suspense fallback={null}>
        <CategoryBar />
      </Suspense>
      <Suspense fallback={<HomePageSkeleton />}>
        <HomePageContent />
      </Suspense>
    </>
  )
}
