import type { Metadata } from 'next'
import { Suspense } from 'react'
import { PlayView } from './play-view'

export const metadata: Metadata = {
  robots: { index: false },
}

export default async function PlayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <Suspense>
      <PlayView quizId={id} />
    </Suspense>
  )
}
