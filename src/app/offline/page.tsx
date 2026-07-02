import type { Metadata } from 'next'
import Link from 'next/link'
import { WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Offline',
  robots: { index: false },
}

export default function OfflinePage() {
  return (
    <div className="container mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <WifiOff className="mb-4 h-12 w-12 text-muted-foreground" aria-hidden="true" />
      <h1 className="mb-2 text-2xl font-extrabold">You&apos;re offline</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        BusQuiz needs an internet connection to load new quizzes. Pages you visited recently may
        still be available — or try again once you&apos;re back online.
      </p>
      <Button asChild>
        <Link href="/">Try again</Link>
      </Button>
    </div>
  )
}
