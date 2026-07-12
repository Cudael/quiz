import { ImageResponse } from 'next/og'
import { getQuizCollection } from '@/content/collections'
import { OgCard } from '@/lib/og-card'

export const alt = 'Curated BusQuiz collection title and description'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const collection = getQuizCollection(slug)
  return new ImageResponse(
    <OgCard
      eyebrow="Curated Quiz Collection"
      title={collection?.title ?? 'BusQuiz Collection'}
      description={collection?.description}
    />,
    size
  )
}
