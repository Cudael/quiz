'use client'

import Link from 'next/link'
import { ArrowUp, Cookie, Instagram, Twitter } from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { openConsentSettings } from '@/lib/consent'

const EXPLORE_LINKS = [
  { href: '/categories', label: 'Categories' },
  { href: '/popular', label: 'Popular' },
  { href: '/trending', label: 'Trending' },
  { href: '/collections', label: 'Collections' },
  { href: '/random-quiz', label: 'Random Quiz' },
]

const PLAY_LINKS = [
  { href: '/duel', label: 'Duel Mode' },
  { href: '/challenges', label: 'Challenges' },
  { href: '/leaderboard', label: 'Leaderboard' },
]

const CREATE_LEARN_LINKS = [
  { href: '/studio', label: 'Quiz Studio' },
  { href: '/learn', label: 'Learn Hub' },
  { href: '/trivia-facts', label: 'Trivia Facts' },
  { href: '/blog', label: 'Blog & Articles' },
]

const COMMUNITY_LINKS = [
  { href: '/badges', label: 'Badges' },
  { href: '/stats', label: 'Platform Stats' },
]

const BUSQUIZ_LINKS = [
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact' },
  { href: '/feedback', label: 'Send Feedback (Sign in required)' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/cookies', label: 'Cookie Policy' },
  { href: '/terms', label: 'Terms of Service' },
]

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-surface-1">
      {/* Gradient top border */}
      <div className="h-px w-full bg-border opacity-50" />
      <div className="h-px w-full bg-border opacity-20" />

      <div className="container mx-auto px-4 py-12 md:py-16">
        {/* Main grid */}
        <div className="grid gap-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-7">
          {/* Brand — full width on mobile */}
          <div className="space-y-4 col-span-2 md:col-span-3 lg:col-span-2">
            <div className="flex items-center font-bold">
              <Logo className="h-10 w-auto" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Where curiosity meets competition. Compete, create, and climb the global leaderboard.
            </p>
            <div className="flex flex-row items-center gap-2">
              <a
                href="https://x.com/PlayBusQuiz"
                aria-label="Twitter / X"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border/60 bg-background/50 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                <Twitter className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://www.tiktok.com/@TheBusQuiz"
                aria-label="TikTok"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border/60 bg-background/50 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                <span className="inline-block h-3.5 w-3.5">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.23V2h-3.2v13.22a2.89 2.89 0 1 1-2-2.75V9.2a6.13 6.13 0 1 0 5.2 6.05V8.67a8.1 8.1 0 0 0 4.77 1.56V7.06c-.34 0-.67-.13-1-.37Z" />
                  </svg>
                </span>
              </a>
              <a
                href="https://www.instagram.com/BusQuiz"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border/60 bg-background/50 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                <Instagram className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div className="space-y-4 col-span-1">
            <p className="text-xs font-extrabold uppercase tracking-widest text-foreground">
              Explore
            </p>
            <nav className="flex flex-col gap-2.5" aria-label="Explore navigation">
              {EXPLORE_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:text-primary focus-visible:outline-none"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Play */}
          <div className="space-y-4 col-span-1">
            <p className="text-xs font-extrabold uppercase tracking-widest text-foreground">Play</p>
            <nav className="flex flex-col gap-2.5" aria-label="Play navigation">
              {PLAY_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:text-primary focus-visible:outline-none"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Create & Learn */}
          <div className="space-y-4 col-span-1">
            <p className="text-xs font-extrabold uppercase tracking-widest text-foreground">
              Create & Learn
            </p>
            <nav className="flex flex-col gap-2.5" aria-label="Create & Learn navigation">
              {CREATE_LEARN_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:text-primary focus-visible:outline-none"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Community */}
          <div className="space-y-4 col-span-1">
            <p className="text-xs font-extrabold uppercase tracking-widest text-foreground">
              Community
            </p>
            <nav className="flex flex-col gap-2.5" aria-label="Community navigation">
              {COMMUNITY_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:text-primary focus-visible:outline-none"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* BusQuiz / Company */}
          <div className="space-y-4 col-span-1">
            <p className="text-xs font-extrabold uppercase tracking-widest text-foreground">
              BusQuiz
            </p>
            <nav className="flex flex-col gap-2.5" aria-label="Company navigation">
              {BUSQUIZ_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:text-primary focus-visible:outline-none"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col gap-3 border-t border-border/40 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          {/* Hydration fix applied here via suppressHydrationWarning */}
          <span suppressHydrationWarning>
            © {new Date().getFullYear()} BusQuiz. All rights reserved.
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={openConsentSettings}
              className="inline-flex items-center gap-1.5 rounded-md border border-border/60 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              <Cookie className="h-3 w-3" />
              Cookie settings
            </button>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Scroll to top"
              className="inline-flex items-center gap-1.5 rounded-md border border-border/60 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              <ArrowUp className="h-3 w-3" />
              Back to top
            </button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  )
}
