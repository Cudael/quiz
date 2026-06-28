import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { DuelView } from './duel-view'

function DuelSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <Skeleton className="h-8 w-40" />
      <div className="rounded-xl border border-border/40 p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-3/4" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-14 rounded-xl" />
          <Skeleton className="h-14 rounded-xl" />
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  )
}

export default async function DuelLobbyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <Suspense fallback={<DuelSkeleton />}>
      <DuelView duelId={id} />
    </Suspense>
  )
}
