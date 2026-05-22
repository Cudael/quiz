'use client'

import { useEffect } from 'react'

export default function GlobalError({
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
    <html lang="en">
      <body className="bg-background text-foreground">
        <main className="container mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-4 text-center">
          <div
            className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10 text-4xl"
            aria-hidden="true"
          >
            🚨
          </div>
          <h1 className="text-3xl font-bold">Something went wrong globally.</h1>
          <p className="mt-2 max-w-sm text-muted-foreground">
            Reload to continue your run. If it keeps happening, we&apos;ll keep improving.
          </p>
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="mt-6 rounded-lg border border-border px-4 py-2 font-medium hover:bg-muted"
          >
            Reload
          </button>
        </main>
      </body>
    </html>
  )
}
