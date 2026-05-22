'use client'

import Link from 'next/link'
import { Brain, Keyboard, Github } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SoundControls } from '@/components/sound/sound-controls'
import { useShortcutsModal } from '@/components/hotkeys/global-hotkeys'

export function SiteFooter() {
  const { openShortcuts } = useShortcutsModal()

  return (
    <footer className="mt-16 border-t border-border/40 bg-surface-1">
      <div className="container mx-auto px-4 py-10">
        {/* Main grid */}
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-quiz-purple to-quiz-pink">
                <Brain className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="bg-gradient-to-r from-quiz-purple-light to-quiz-pink bg-clip-text text-transparent">
                QuizArena
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Compete, create, and climb the global quiz leaderboard.
            </p>
          </div>

          {/* Quick links */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Explore
            </p>
            <nav className="flex flex-col gap-2" aria-label="Footer navigation">
              {[
                { href: '/categories', label: 'Categories' },
                { href: '/leaderboard', label: 'Leaderboard' },
                { href: '/studio', label: 'Quiz Studio' },
                { href: '/play', label: 'Play Now' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Meta / Tools */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              More
            </p>
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-auto justify-start px-0 py-0 text-sm text-muted-foreground hover:text-foreground"
                asChild
              >
                <Link href="https://github.com/Cudael/quiz" target="_blank" rel="noreferrer">
                  <Github className="mr-2 h-4 w-4" />
                  GitHub
                </Link>
              </Button>
              <SoundControls />
              <Button
                variant="ghost"
                size="sm"
                className="h-auto justify-start px-0 py-0 text-sm text-muted-foreground hover:text-foreground"
                onClick={openShortcuts}
                aria-label="Open keyboard shortcuts"
              >
                <Keyboard className="mr-2 h-4 w-4" />
                Keyboard shortcuts
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto justify-start px-0 py-0 text-sm text-muted-foreground hover:text-foreground"
                asChild
              >
                <Link href="/about/accessibility">Accessibility</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 border-t border-border/40 pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} QuizArena. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
