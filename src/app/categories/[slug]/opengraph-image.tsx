import { ImageResponse } from 'next/og'
import { prisma } from '@/server/prisma'
import { OgCard } from '@/lib/og-card'

export const alt = 'BusQuiz category title and description'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const runtime = 'nodejs'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const category = await prisma.category.findUnique({
    where: { slug },
    select: { name: true, description: true },
  })
  return new ImageResponse(
    <OgCard
      eyebrow="Quiz Category"
      title={`${category?.name ?? 'Trivia'} Quizzes`}
      description={category?.description}
    />,
    size
  )
}
