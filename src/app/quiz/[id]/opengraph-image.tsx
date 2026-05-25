import { ImageResponse } from 'next/og'
import { prisma } from '@/server/prisma'

export const alt = 'Quiz card'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const runtime = 'nodejs'

export function renderQuizOgCard(data: {
  title: string
  category: string
  difficulty: string
  author: string
}) {
  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        padding: 60,
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: 'linear-gradient(130deg, #4f46e5 0%, #8b5cf6 55%, #ec4899 100%)',
        color: '#fff',
      }}
    >
      <div style={{ display: 'flex', gap: 12, fontSize: 26 }}>
        <span
          style={{ padding: '6px 14px', borderRadius: 999, background: 'rgba(255,255,255,0.2)' }}
        >
          {data.category}
        </span>
        <span
          style={{ padding: '6px 14px', borderRadius: 999, background: 'rgba(255,255,255,0.2)' }}
        >
          {data.difficulty}
        </span>
      </div>

      <div style={{ fontSize: 62, fontWeight: 800, lineHeight: 1.1 }}>{data.title}</div>

      <div style={{ fontSize: 28, opacity: 0.9 }}>by {data.author}</div>
    </div>
  )
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const quiz = await prisma.quiz.findUnique({
    where: { id, isPublished: true },
    select: {
      title: true,
      difficulty: true,
      category: { select: { name: true } },
      author: { select: { name: true } },
    },
  })

  const card = renderQuizOgCard({
    title: quiz?.title ?? 'QuizArena quiz',
    category: quiz?.category.name ?? 'Category',
    difficulty: quiz?.difficulty ?? 'MEDIUM',
    author: quiz?.author.name ?? 'QuizArena',
  })

  return new ImageResponse(card, size)
}
