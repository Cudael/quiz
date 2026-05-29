import type { Metadata } from 'next'
import { Suspense } from 'react'
import { HomePage as HomePageContent, HomePageSkeleton } from '@/components/home/home-page'
import { CategoryBar } from '@/components/layout/category-bar'
import { absoluteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'BusQuiz — Play, Create & Compete',
  description:
    'Test your knowledge across hundreds of categories. Create quizzes, compete on leaderboards, and earn badges.',
  openGraph: {
    title: 'BusQuiz — Play, Create & Compete',
    description:
      'Test your knowledge across hundreds of categories. Create quizzes, compete on leaderboards, and earn badges.',
    url: absoluteUrl('/'),
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BusQuiz — Play, Create & Compete',
    description:
      'Test your knowledge across hundreds of categories. Create quizzes, compete on leaderboards, and earn badges.',
  },
}

export default function HomePage() {
  return (
    <>
      <Suspense fallback={null}>
        <CategoryBar />
      </Suspense>
      <Suspense fallback={<HomePageSkeleton />}>
        <HomePageContent />
      </Suspense>
    </>
  )
}
