'use client'

import Link from 'next/link'
import { ChevronDown, LogOut, UserCircle2 } from 'lucide-react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { LevelProgress } from '@/components/ui/level-progress'
import { StreakFlame } from '@/components/ui/streak-flame'

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
  const username = session.user.username ?? 'me'

  return (
    <div className="flex items-center gap-2">
      <div className="hidden min-w-32 md:block">
        <LevelProgress xp={session.user.xp} size="sm" />
      </div>
      <div className="hidden md:block">
        <StreakFlame value={session.user.streakDays} size="sm" />
      </div>

      <details className="relative hidden md:block">
        <summary className="list-none">
          <button
            className="flex items-center gap-2 rounded-md border border-border px-2 py-1 hover:bg-muted"
            type="button"
          >
            <Avatar src={session.user.image} fallback={name} size="sm" />
            <span className="max-w-20 truncate text-xs font-medium">{name}</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>
        </summary>

        <div className="absolute right-0 z-50 mt-2 w-44 rounded-md border border-border bg-background p-1 shadow-xl">
          <Link href="/me" className="block rounded px-2 py-1.5 text-sm hover:bg-muted">
            Profile (@{username})
          </Link>
          <Link href="/studio" className="block rounded px-2 py-1.5 text-sm hover:bg-muted">
            Studio
          </Link>
          {session.user.role === 'ADMIN' && (
            <Link href="/admin" className="block rounded px-2 py-1.5 text-sm hover:bg-muted">
              Admin
            </Link>
          )}
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-muted"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </details>

      <Button
        size="icon"
        variant="ghost"
        onClick={() => signOut({ callbackUrl: '/' })}
        className="md:hidden"
      >
        <LogOut className="h-4 w-4" />
        <span className="sr-only">Sign out</span>
      </Button>
      <Button size="icon" variant="ghost" asChild className="md:hidden">
        <Link href="/me">
          <UserCircle2 className="h-4 w-4" />
          <span className="sr-only">Open profile</span>
        </Link>
      </Button>
    </div>
  )
}
