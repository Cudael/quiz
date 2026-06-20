import { HomePageClient } from '@/components/home/home-page-client'
import { getHomePageData } from '@/server/home-page-data'
import { QuizOfTheDay } from '@/components/home/sections/quiz-of-the-day'
import { Suspense } from 'react'

export { HomePageSkeleton } from '@/components/home/home-page-skeleton'

export async function HomePage() {
  const data = await getHomePageData()

  return (
    <>
      <HomePageClient {...data} />
      <Suspense fallback={null}>
        <div className="container mx-auto px-4 md:px-6">
          <QuizOfTheDay />
        </div>
      </Suspense>
    </>
  )
}
