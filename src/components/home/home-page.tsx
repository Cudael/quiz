import { HomePageClient } from '@/components/home/home-page-client'
import { getHomePageData } from '@/server/home-page-data'

export { HomePageSkeleton } from '@/components/home/home-page-skeleton'

export async function HomePage() {
  const data = await getHomePageData()

  return <HomePageClient {...data} />
}
