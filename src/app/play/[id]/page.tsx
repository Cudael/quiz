import type { Metadata } from 'next'
import { Suspense } from 'react'
import { PlayView } from './play-view'

export const metadata: Metadata = {
  robots: { index: false },
}

export default async function PlayPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ mode?: string }>
}) {
  const { id } = await params
  const { mode } = await searchParams
  const normalizedMode =
    mode === 'daily'
      ? 'DAILY'
      : mode === 'practice'
        ? 'PRACTICE'
        : mode === 'blitz'
          ? 'BLITZ'
          : undefined

  return (
    <Suspense>
      <PlayView quizId={id} mode={normalizedMode} />
    </Suspense>
  )
}
