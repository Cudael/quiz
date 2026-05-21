import Link from 'next/link'
import { ShieldX } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AdminForbiddenPage() {
  return (
    <div className="container mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <ShieldX className="mb-4 h-12 w-12 text-destructive" />
      <h1 className="text-3xl font-bold">403 — Forbidden</h1>
      <p className="mt-3 text-muted-foreground">
        You do not have permission to access admin moderation tools.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  )
}
