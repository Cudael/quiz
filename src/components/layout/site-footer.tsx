'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowUp, Instagram, Twitter } from 'lucide-react'
import { ThemeToggle } from '@/components/theme/theme-toggle'

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-surface-1">
      {/* Gradient top border */}
      <div className="h-px w-full bg-border opacity-50" />
      <div className="h-px w-full bg-border opacity-20" />

      <div className="container mx-auto px-4 py-12 md:py-16">
        {/* Main grid */}
        <div className="grid gap-8 grid-cols-2 md:grid-cols-4">
          {/* Brand — full width on mobile */}
          <div className="space-y-4 col-span-2 md:col-span-2">
            <div className="flex items-center font-bold">
              <Image src="/logo.svg" alt="BusQuiz logo" width={168} height={40} />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Where curiosity meets competition. And occasionally, humble pie. Compete, create, and
              climb the global leaderboard.
            </p>
            <p className="mt-1 text-xs italic text-muted-foreground/70">
              Made with love and trivia ❤️
            </p>
            <div className="flex flex-row items-center gap-2">
              <a
                href="https://x.com/PlayBusQuiz"
                aria-label="Twitter / X"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-background/50 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                <Twitter className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://www.tiktok.com/@TheBusQuiz"
                aria-label="TikTok"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-background/50 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
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
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-background/50 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                <Instagram className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-4">
            <p className="text-xs font-black uppercase tracking-widest text-foreground">Explore</p>
            <nav className="flex flex-col gap-2.5" aria-label="Footer navigation">
              {[
                { href: '/categories', label: 'Browse Categories' },
                { href: '/collections', label: 'Collections' },
                { href: '/studio', label: 'Quiz Studio' },
                { href: '/random-quiz', label: 'Play Now' },
                { href: '/blog', label: 'Blog' },
                { href: '/about', label: 'About' },
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/terms', label: 'Terms of Service' },
                { href: '/contact', label: 'Contact' },
                { href: '/feedback', label: 'Feedback' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={link.href === '/about' ? false : undefined}
                  className="text-sm text-foreground/70 transition-colors hover:text-primary focus-visible:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md w-fit"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Meta / Tools */}
          <div className="space-y-4">
            <p className="text-xs font-black uppercase tracking-widest text-foreground">
              Community
            </p>
            <div className="flex flex-col gap-2.5">
              <Link
                href="/leaderboard"
                prefetch={false}
                className="text-sm text-foreground/70 transition-colors hover:text-primary focus-visible:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md w-fit"
              >
                Leaderboard
              </Link>
              <Link
                href="/duel"
                className="text-sm text-foreground/70 transition-colors hover:text-primary focus-visible:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md w-fit"
              >
                Duel
              </Link>
              <Link
                href="/about/accessibility"
                className="text-sm text-foreground/70 transition-colors hover:text-primary focus-visible:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md w-fit"
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
            © {new Date().getFullYear()} BusQuiz. All rights reserved.
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Scroll to top"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
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
