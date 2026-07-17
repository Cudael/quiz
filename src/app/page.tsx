import type { Metadata } from 'next'
import { Suspense } from 'react'
import { HomePage as HomePageContent } from '@/components/home/home-page'
import { CategoryBar } from '@/components/layout/category-bar'
import { absoluteUrl } from '@/lib/site'
import { serializeJsonLd } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'BusQuiz — Free Online Quiz & Trivia Platform',
  description:
    'Play free quizzes across a growing range of topics. Create quizzes, compete on leaderboards, and earn badges.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'BusQuiz — Free Online Quiz & Trivia Platform',
    description:
      'Play free quizzes across a growing range of topics. Create quizzes, compete on leaderboards, and earn badges.',
    url: absoluteUrl('/'),
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BusQuiz social preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BusQuiz — Free Online Quiz & Trivia Platform',
    description:
      'Play free quizzes across a growing range of topics. Create quizzes, compete on leaderboards, and earn badges.',
    images: ['/og-image.png'],
  },
}

export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': absoluteUrl('/#organization'),
        name: 'BusQuiz',
        url: absoluteUrl('/'),
        logo: {
          '@type': 'ImageObject',
          url: absoluteUrl('/google-logo.png'),
        },
        sameAs: ['https://x.com/PlayBusQuiz'],
      },
      {
        '@type': 'WebSite',
        '@id': absoluteUrl('/#website'),
        name: 'BusQuiz',
        url: absoluteUrl('/'),
        publisher: { '@id': absoluteUrl('/#organization') },
        description:
          'Play free quizzes across a growing range of topics. Create quizzes, compete on leaderboards, and earn badges.',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${absoluteUrl('/categories')}?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
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
      <Suspense>
        <HomePageContent />
      </Suspense>
    </>
  )
}
