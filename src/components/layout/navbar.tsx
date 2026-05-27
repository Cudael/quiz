'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Swords, Zap } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Sheet } from '@/components/ui/sheet'
import { AuthControls } from '@/components/auth/auth-controls'
import { NotificationBell } from '@/components/notifications/notification-bell'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/categories', label: 'Categories' },
  { href: '/duel', label: 'Duel', icon: Swords, highlighted: true },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/studio', label: 'Create' },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Gradient line at very top */}
      <div className="h-[1px] w-full bg-gradient-to-r from-quiz-purple via-quiz-pink to-quiz-orange opacity-60" />
      <div className="bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 border-b border-border/40 shadow-sm">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 md:px-6">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
          >
            <Image
              src="/logo.png"
              alt="BusQuiz logo"
              width={151}
              height={36}
              priority
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
            {navLinks.map((link) => {
              const active = isActive(link.href)

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    active
                      ? 'text-primary bg-primary/8'
                      : link.highlighted
                        ? 'text-quiz-pink font-bold hover:text-quiz-pink/80 hover:bg-quiz-pink/10'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  {link.icon ? <link.icon className="mr-1 inline-flex h-3.5 w-3.5" /> : null}
                  {link.label}
                  {active && (
                    <span className="absolute inset-x-3 bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-quiz-purple to-quiz-pink" />
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            {session?.user ? <NotificationBell /> : null}
            <AuthControls />
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-xl"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile navigation sheet */}
      <Sheet open={mobileOpen} onClose={() => setMobileOpen(false)} side="right" title="Menu">
        <nav className="flex flex-col gap-1.5 px-2 py-6" aria-label="Mobile navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center rounded-xl px-4 py-3 text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                isActive(link.href)
                  ? 'bg-primary/10 text-primary border-l-4 border-quiz-purple'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground border-l-4 border-transparent'
              )}
              aria-current={isActive(link.href) ? 'page' : undefined}
              onClick={() => setMobileOpen(false)}
            >
              {link.icon ? <link.icon className="mr-2 h-4 w-4" /> : null}
              {link.label}
            </Link>
          ))}
          <div className="mt-3 px-2">
            <Button asChild size="lg" variant="gradient" className="w-full rounded-xl font-bold">
              <Link href="/random-quiz" onClick={() => setMobileOpen(false)}>
                <Zap className="h-4 w-4" />
                Play Now
              </Link>
            </Button>
          </div>
        </nav>
      </Sheet>
    </header>
  )
}
