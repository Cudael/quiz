import { ImageResponse } from 'next/og'
import { siteConfig } from '@/lib/site'

export const alt = `${siteConfig.name} social card`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export function renderDefaultOgCard() {
  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        padding: 64,
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, #6d28d9 0%, #ec4899 100%)',
        color: '#fff',
      }}
    >
      <div style={{ fontSize: 28, opacity: 0.9 }}>QuizArena</div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.1 }}>Play. Learn. Climb.</div>
        <div style={{ fontSize: 34, marginTop: 16, opacity: 0.9 }}>
          Quizzes, streaks, badges, and leaderboard glory.
        </div>
      </div>
    </div>
  )
}

export default function Image() {
  return new ImageResponse(renderDefaultOgCard(), size)
}
