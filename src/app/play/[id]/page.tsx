import type { Metadata } from 'next'
import { Suspense } from 'react'
import { PlayView } from './play-view'

export const metadata: Metadata = {
  robots: { index: false },
}

export default async function PlayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <PlayView quizId={id} />
    </Suspense>
  )
}
