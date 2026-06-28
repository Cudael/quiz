import { HomePageClient } from '@/components/home/home-page-client'
import { getHomePageData } from '@/server/home-page-data'

export async function HomePage() {
  const data = await getHomePageData()

  return <HomePageClient {...data} />
}
