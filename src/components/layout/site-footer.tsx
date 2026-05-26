'use client'

import Link from 'next/link'
import { Brain, Github, Zap } from 'lucide-react'
import { ThemeToggle } from '@/components/theme/theme-toggle'

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-surface-1">
      {/* Gradient top border */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-quiz-purple to-transparent opacity-50" />
      <div className="h-px w-full bg-gradient-to-r from-transparent via-quiz-pink to-transparent opacity-30" />

      <div className="container mx-auto px-4 py-12 md:py-16">
        {/* Main grid */}
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2 font-bold">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-quiz-purple to-quiz-pink shadow-md shadow-quiz-purple/25">
                <Brain className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="bg-gradient-to-r from-quiz-purple to-quiz-pink bg-clip-text text-transparent text-xl font-black tracking-tight">
                QuizArena
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              The ultimate destination for quiz lovers and knowledge seekers. Compete, create, and
              climb the global leaderboard.
            </p>
            <div className="flex items-center gap-1.5 rounded-full border border-quiz-purple/20 bg-quiz-purple/5 px-3 py-1.5 w-fit">
              <Zap className="h-3.5 w-3.5 text-quiz-purple" />
              <span className="text-xs font-semibold text-quiz-purple">Free to play, forever</span>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-4">
            <p className="text-xs font-black uppercase tracking-widest text-foreground">Explore</p>
            <nav className="flex flex-col gap-2.5" aria-label="Footer navigation">
              {[
                { href: '/categories', label: 'Browse Categories' },
                { href: '/leaderboard', label: 'Leaderboard' },
                { href: '/studio', label: 'Quiz Studio' },
                { href: '/random-quiz', label: 'Play Now' },
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
            <p className="text-xs font-black uppercase tracking-widest text-foreground">More</p>
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
          <span suppressHydrationWarning>
            © {new Date().getFullYear()} QuizArena. Made with ❤️ for curious minds.
          </span>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  )
}
