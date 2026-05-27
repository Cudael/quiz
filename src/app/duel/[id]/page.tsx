import { Suspense } from 'react'
import { DuelView } from './duel-view'

export default async function DuelLobbyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <DuelView duelId={id} />
    </Suspense>
  )
}
