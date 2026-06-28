'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="container mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <div
        className="mb-4 flex h-20 w-20 items-center justify-center rounded-md bg-destructive/10 text-4xl"
        aria-hidden="true"
      >
        ⚠️
      </div>
      <h1 className="text-3xl font-bold">Oops — a quiz gremlin appeared.</h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        Please reload and we&apos;ll get you back in the game.
      </p>
      <Button className="mt-6" onClick={() => unstable_retry()}>
        Reload
      </Button>
    </div>
  )
}
