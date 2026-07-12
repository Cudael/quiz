import { ImageResponse } from 'next/og'
import { prisma } from '@/server/prisma'
import { OgCard } from '@/lib/og-card'

export const alt = 'Public BusQuiz playlist title and description'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const runtime = 'nodejs'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const playlist = await prisma.playlist.findUnique({
    where: { slug },
    select: { title: true, description: true, isPublic: true },
  })
  return new ImageResponse(
    <OgCard
      eyebrow="Quiz Playlist"
      title={playlist?.isPublic ? playlist.title : 'BusQuiz Playlist'}
      description={playlist?.isPublic ? (playlist.description ?? undefined) : undefined}
    />,
    size
  )
}
