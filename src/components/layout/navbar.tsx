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
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link 
          href="/" 
          className="flex items-center gap-2 font-bold text-xl transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-quiz-purple to-quiz-pink shadow-sm">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="bg-gradient-to-r from-quiz-purple-light to-quiz-pink bg-clip-text text-transparent tracking-tight">
            QuizArena
          </span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'relative rounded-md px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                isActive(link.href)
                  ? 'text-foreground bg-accent/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              )}
              aria-current={isActive(link.href) ? 'page' : undefined}
            >
              {link.label}
              {isActive(link.href) && (
                <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-t-full bg-gradient-to-r from-quiz-purple to-quiz-pink" />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
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
        <nav className="flex flex-col gap-2 px-2 py-6" aria-label="Mobile navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center rounded-lg px-4 py-3 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                isActive(link.href)
                  ? 'bg-accent/50 text-foreground border-l-4 border-quiz-purple'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground border-l-4 border-transparent'
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
