'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronDown, LogOut } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { StreakFlame } from '@/components/ui/streak-flame'
import { useTheme } from '@/components/theme/theme-provider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function AuthControls() {
  const { data: session, status } = useSession()
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  if (status === 'loading') {
    return null
  }

  if (!session?.user) {
    return (
      <div className="flex items-center gap-1 md:gap-2">
        <Link
          href="/sign-in"
          className="rounded-md px-2 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground md:px-3 md:text-sm"
        >
          Sign in
        </Link>
        <Button asChild size="sm" className="rounded-md text-xs md:text-sm">
          <Link href="/sign-up">Register</Link>
        </Button>
      </div>
    )
  }

  const name = session.user.name || 'User'
  const username = session.user.username ?? 'me'

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center gap-2 rounded-md border border-border px-1.5 py-1 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:px-2"
            type="button"
            aria-label="Open profile menu"
          >
            <Avatar src={session.user.image} fallback={name} size="sm" />
            <span className="hidden max-w-20 truncate text-xs font-medium md:block">{name}</span>
            <span className="hidden rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium md:inline-flex">
              Level {session.user.level}
            </span>
            <span className="hidden md:inline-flex">
              <StreakFlame value={session.user.streakDays} size="sm" />
            </span>
            <ChevronDown className="hidden h-3 w-3 text-muted-foreground md:block" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem onSelect={() => router.push('/profile')}>
            Profile (@{username})
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => router.push('/profile/settings')}>
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => router.push('/studio')}>Studio</DropdownMenuItem>
          {session.user.role === 'ADMIN' && (
            <DropdownMenuItem onSelect={() => router.push('/admin')}>Admin</DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Theme</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={theme}
                onValueChange={(value) => {
                  setTheme(value as 'light' | 'dark' | 'system')
                }}
              >
                <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem
            onSelect={async (event) => {
              event.preventDefault()
              await signOut({ redirectTo: '/' })
            }}
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
