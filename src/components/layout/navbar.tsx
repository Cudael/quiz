'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Brain, Menu } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet } from '@/components/ui/sheet'
import { AuthControls } from '@/components/auth/auth-controls'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/categories', label: 'Categories' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/studio', label: 'Create' },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-quiz-purple to-quiz-pink">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="bg-gradient-to-r from-quiz-purple-light to-quiz-pink bg-clip-text text-transparent">
            QuizArena
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'relative rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive(link.href)
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              )}
              aria-current={isActive(link.href) ? 'page' : undefined}
            >
              {link.label}
              {isActive(link.href) && (
                <span className="absolute inset-x-3 bottom-1 h-0.5 rounded-full bg-primary" />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <AuthControls />
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile navigation sheet */}
      <Sheet open={mobileOpen} onClose={() => setMobileOpen(false)} side="right" title="Menu">
        <nav className="flex flex-col gap-1 px-3 py-4" aria-label="Mobile navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive(link.href)
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              )}
              aria-current={isActive(link.href) ? 'page' : undefined}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </Sheet>
    </header>
  )
}
