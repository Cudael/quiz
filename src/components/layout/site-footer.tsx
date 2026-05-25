'use client'

import Link from 'next/link'
import { Brain, Github } from 'lucide-react'
import { ThemeToggle } from '@/components/theme/theme-toggle'

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border/40 bg-surface-1">
      <div className="container mx-auto px-4 py-10">
        {/* Main grid */}
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-bold">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-quiz-purple to-quiz-pink shadow-sm">
                <Brain className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="bg-gradient-to-r from-quiz-purple-light to-quiz-pink bg-clip-text text-transparent text-lg tracking-tight">
                QuizArena
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Compete, create, and climb the global quiz leaderboard. Your ultimate destination for trivia.
            </p>
          </div>

          {/* Quick links */}
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-foreground">
              Explore
            </p>
            <nav className="flex flex-col gap-2.5" aria-label="Footer navigation">
              {[
                { href: '/categories', label: 'Categories' },
                { href: '/leaderboard', label: 'Leaderboard' },
                { href: '/studio', label: 'Quiz Studio' },
                { href: '/play', label: 'Play Now' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md w-fit"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Meta / Tools */}
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-foreground">
              More
            </p>
            <div className="flex flex-col gap-2.5">
              <Link
                href="https://github.com/Cudael/quiz"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md w-fit"
              >
                <Github className="h-4 w-4" />
                GitHub
              </Link>
              <Link
                href="/about/accessibility"
                className="text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md w-fit"
              >
                Accessibility
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex items-center justify-between border-t border-border/40 pt-6 text-xs text-muted-foreground">
          {/* Hydration fix applied here via suppressHydrationWarning */}
          <span suppressHydrationWarning>© {new Date().getFullYear()} QuizArena. All rights reserved.</span>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  )
}
