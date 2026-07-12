import { ImageResponse } from 'next/og'
import { getBlogPost } from '@/content/blog-posts'
import { OgCard } from '@/lib/og-card'

export const alt = 'BusQuiz blog article title and description'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getBlogPost(slug)
  return new ImageResponse(
    <OgCard
      eyebrow="BusQuiz Blog"
      title={post?.title ?? 'BusQuiz Blog'}
      description={post?.description}
    />,
    size
  )
}
