import type { Metadata } from 'next'
import { HomePageClient } from '@/components/home-page-client'
import { absoluteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'QuizArena — Play, Create & Compete',
  description:
    'Test your knowledge across hundreds of categories. Create quizzes, compete on leaderboards, and earn badges.',
  openGraph: {
    title: 'QuizArena — Play, Create & Compete',
    description:
      'Test your knowledge across hundreds of categories. Create quizzes, compete on leaderboards, and earn badges.',
    url: absoluteUrl('/'),
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QuizArena — Play, Create & Compete',
    description:
      'Test your knowledge across hundreds of categories. Create quizzes, compete on leaderboards, and earn badges.',
  },
}

export default function HomePage() {
  return <HomePageClient />
}
