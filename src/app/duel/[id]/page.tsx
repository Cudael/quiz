import { Suspense } from 'react'
import { DuelView } from './duel-view'

export default async function DuelLobbyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <Suspense>
      <DuelView duelId={id} />
    </Suspense>
  )
}
