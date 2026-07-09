'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Swords } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Logo } from '@/components/ui/logo'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { NavDropdown } from '@/components/layout/nav-dropdown'
import { AuthControls } from '@/components/auth/auth-controls'
import { NotificationBell } from '@/components/notifications/notification-bell'
import { cn } from '@/lib/utils'

type NavLink = {
  href: string
  label: string
  icon?: typeof Swords
  highlighted?: boolean
  prefetch?: boolean
}

const navLinks: NavLink[] = [
  { href: '/categories', label: 'Categories' },
  { href: '/duel', label: 'Duel', icon: Swords, highlighted: true },
  { href: '/leaderboard', label: 'Leaderboard', prefetch: false },
  { href: '/studio', label: 'Create' },
]

export function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const pathname = usePathname()
  const { data: session, status } = useSession()

  const closeDropdown = useCallback(() => {
    setDropdownOpen(false)
    menuButtonRef.current?.focus()
  }, [])

  // The header uses `backdrop-blur`, which makes it a containing block for
  // `position: fixed` descendants — a fixed click-catcher inside it would only
  // cover the navbar bar, not the rest of the page. Detect outside clicks directly.
  useEffect(() => {
    if (!dropdownOpen) return

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node
      if (panelRef.current?.contains(target) || menuButtonRef.current?.contains(target)) {
        return
      }
      setDropdownOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [dropdownOpen])

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 border-b border-border/40 shadow-sm">
      <div className="container mx-auto relative flex h-14 items-center justify-between px-4 md:px-6">
        {/* Left: hamburger + Logo */}
        <div className="flex items-center gap-1">
          <Button
            ref={menuButtonRef}
            variant="ghost"
            size="icon"
            className="rounded-md"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-label="Open navigation menu"
            aria-expanded={dropdownOpen}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link
            href="/"
            className="flex items-center transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
          >
            <Logo className="h-9 w-auto" />
          </Link>
        </div>

        <div className="hidden flex-1 items-center justify-center gap-4 px-4 md:flex">
          <nav className="flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map((link) => {
              const active = isActive(link.href)

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={link.prefetch}
                  className={cn(
                    'relative rounded-md px-4 py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    active
                      ? 'text-primary bg-primary/8'
                      : link.highlighted
                        ? 'text-primary font-bold hover:text-primary/80 hover:bg-primary/5'
                        : 'text-foreground/80 hover:text-foreground hover:bg-accent/50'
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  {link.icon ? <link.icon className="mr-1 inline-flex h-3.5 w-3.5" /> : null}
                  {link.label}
                  {active && (
                    <span className="absolute inset-x-3 bottom-0.5 h-0.5 rounded-full bg-primary" />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {status === 'loading' ? (
            <div className="h-8 w-8 animate-pulse rounded-md bg-muted" aria-hidden="true" />
          ) : session?.user ? (
            <NotificationBell />
          ) : null}
          <AuthControls />
        </div>

        <NavDropdown open={dropdownOpen} onClose={closeDropdown} panelRef={panelRef} />
      </div>
    </header>
  )
}
