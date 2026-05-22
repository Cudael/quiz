import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="container mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
      <div
        className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted text-4xl"
        aria-hidden="true"
      >
        🧩
      </div>
      <h1 className="text-4xl font-extrabold">404 — This quiz escaped the arena</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        Let&apos;s get you back to something fun. We&apos;ll pick a random published quiz for you.
      </p>
      <div className="mt-6 flex gap-3">
        <Button asChild>
          <Link href="/random-quiz">Try a random quiz</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/categories">Browse categories</Link>
        </Button>
      </div>
    </div>
  )
}
