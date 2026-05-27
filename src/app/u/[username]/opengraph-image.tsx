import { ImageResponse } from 'next/og'
import { prisma } from '@/server/prisma'

export const alt = 'Profile card'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const runtime = 'nodejs'

export function renderUserOgCard(data: {
  name: string
  username: string
  level: number
  xp: number
  badges: number
}) {
  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        padding: 60,
        justifyContent: 'space-between',
        background: 'linear-gradient(120deg, #111827 0%, #312e81 100%)',
        color: '#fff',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 60, fontWeight: 800 }}>{data.name}</div>
        <div style={{ fontSize: 30, opacity: 0.85 }}>@{data.username}</div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          fontSize: 30,
          textAlign: 'right',
        }}
      >
        <div>Level {data.level}</div>
        <div>{data.xp.toLocaleString()} XP</div>
        <div>{data.badges} badges</div>
      </div>
    </div>
  )
}

export default async function Image({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      name: true,
      username: true,
      xp: true,
      level: true,
      badges: { select: { badgeId: true } },
    },
  })

  return new ImageResponse(
    renderUserOgCard({
      name: user?.name ?? 'BusQuiz Player',
      username: user?.username ?? username,
      level: user?.level ?? 1,
      xp: user?.xp ?? 0,
      badges: user?.badges.length ?? 0,
    }),
    size
  )
}
