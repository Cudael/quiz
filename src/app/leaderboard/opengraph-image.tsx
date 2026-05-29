import { ImageResponse } from 'next/og'
import { getLeaderboardTopPlayerNames } from '@/server/leaderboard'

export const alt = 'Leaderboard card'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const runtime = 'nodejs'
// Cache the OG image for 1 hour; leaderboard top names change infrequently.
export const revalidate = 3600

export function renderLeaderboardOgCard(topPlayers: string[]) {
  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        padding: 60,
        flexDirection: 'column',
        background: 'linear-gradient(140deg, #0f172a 0%, #1e1b4b 50%, #7c3aed 100%)',
        color: '#fff',
      }}
    >
      <div style={{ fontSize: 62, fontWeight: 800, marginBottom: 24 }}>BusQuiz Leaderboard</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, fontSize: 36 }}>
        {(topPlayers.length ? topPlayers : ['No players yet']).map((name, index) => (
          <div key={`${name}-${index}`} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span>{index === 0 ? '#1' : index === 1 ? '#2' : index === 2 ? '#3' : '#'}</span>
            <span>{name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default async function Image() {
  let topPlayers: string[] = []

  try {
    topPlayers = await getLeaderboardTopPlayerNames()
  } catch {
    topPlayers = []
  }

  return new ImageResponse(renderLeaderboardOgCard(topPlayers), size)
}
