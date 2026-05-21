'use client'

import Link from 'next/link'
import { LogOut, UserCircle2 } from 'lucide-react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

export function AuthControls() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />
  }

  if (!session?.user) {
    return (
      <Button size="sm" variant="outline" onClick={() => signIn()}>
        Sign in
      </Button>
    )
  }

  const name = session.user.name || 'User'

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="ghost" asChild>
        <Link href="/studio">Studio</Link>
      </Button>
      <div className="hidden items-center gap-2 rounded-md border border-border px-2 py-1 md:flex">
        <Avatar src={session.user.image} fallback={name} size="sm" />
        <span className="max-w-28 truncate text-xs font-medium">{name}</span>
      </div>
      <Button size="icon" variant="ghost" onClick={() => signOut({ callbackUrl: '/' })}>
        <LogOut className="h-4 w-4" />
        <span className="sr-only">Sign out</span>
      </Button>
      <Button size="icon" variant="ghost" asChild className="md:hidden">
        <Link href="/studio">
          <UserCircle2 className="h-4 w-4" />
          <span className="sr-only">Open studio</span>
        </Link>
      </Button>
    </div>
  )
}
