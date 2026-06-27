'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Layers,
  Swords,
  PenLine,
  Sparkles,
  Info,
  Twitter,
  Instagram,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavDropdownProps {
  open: boolean
  onClose: () => void
}

interface MenuSection {
  title: string
  icon: LucideIcon
  items: { href: string; label: string; highlighted?: boolean }[]
  footer?: { href: string; label: string }
}

const POPULAR_CATEGORIES = [
  { href: '/categories/science', label: 'Science' },
  { href: '/categories/history', label: 'History' },
  { href: '/categories/arts-culture', label: 'Arts & Culture' },
  { href: '/categories/geography', label: 'Geography' },
  { href: '/categories/sports', label: 'Sports' },
  { href: '/categories/technology', label: 'Technology' },
  { href: '/categories/music', label: 'Music' },
  { href: '/categories/movies', label: 'Movies' },
]

const SECTIONS: MenuSection[] = [
  {
    title: 'Categories',
    icon: Layers,
    items: POPULAR_CATEGORIES,
    footer: { href: '/categories', label: 'View all categories' },
  },
  {
    title: 'Explore',
    icon: Layers,
    items: [
      { href: '/popular', label: 'Popular' },
      { href: '/trending', label: 'Trending' },
      { href: '/collections', label: 'Collections' },
      { href: '/random-quiz', label: 'Random Quiz', highlighted: true },
    ],
  },
  {
    title: 'Play & Compete',
    icon: Swords,
    items: [
      { href: '/duel', label: 'Duel Mode' },
      { href: '/challenges', label: 'Challenges' },
      { href: '/leaderboard', label: 'Leaderboard' },
    ],
  },
  {
    title: 'Create & Learn',
    icon: PenLine,
    items: [
      { href: '/studio', label: 'Quiz Studio' },
      { href: '/learn', label: 'Learn' },
      { href: '/trivia-facts', label: 'Trivia Facts' },
      { href: '/blog', label: 'Blog' },
    ],
  },
  {
    title: 'Community',
    icon: Sparkles,
    items: [
      { href: '/badges', label: 'Badges' },
      { href: '/stats', label: 'Platform Stats' },
    ],
  },
  {
    title: 'BusQuiz',
    icon: Info,
    items: [
      { href: '/about', label: 'About' },
      { href: '/contact', label: 'Contact' },
      { href: '/feedback', label: 'Send Feedback' },
    ],
  },
]

const SOCIALS = [
  { href: 'https://x.com/PlayBusQuiz', label: 'Twitter / X', icon: Twitter },
  { href: 'https://www.instagram.com/BusQuiz', label: 'Instagram', icon: Instagram },
]

export function NavDropdown({ open, onClose }: NavDropdownProps) {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(href + '/')
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden="true" />

      {/* Container-width dropdown panel */}
      <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 w-full max-w-7xl px-4 md:px-6 animate-in fade-in slide-in-from-top-2 duration-200">
        <div className="rounded-b-2xl border-x border-b border-border/40 bg-card shadow-2xl">
          <div className="py-6">
            <div className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
              {SECTIONS.map((section) => {
                const SectionIcon = section.icon
                return (
                  <div key={section.title}>
                    <p className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground/70">
                      <SectionIcon className="h-3.5 w-3.5 shrink-0" />
                      {section.title}
                    </p>
                    <ul className="space-y-0.5">
                      {section.items.map((item) => {
                        const active = isActive(item.href)
                        return (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              onClick={onClose}
                              className={cn(
                                'block rounded-lg px-2 py-1.5 -mx-2 text-sm font-medium transition-colors',
                                active
                                  ? 'bg-primary/8 text-primary font-bold'
                                  : item.highlighted
                                    ? 'text-quiz-orange hover:bg-quiz-orange/5 hover:text-quiz-orange'
                                    : 'text-foreground/70 hover:bg-accent hover:text-foreground'
                              )}
                            >
                              {item.label}
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                    {section.footer && (
                      <Link
                        href={section.footer.href}
                        onClick={onClose}
                        className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
                      >
                        {section.footer.label}
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Social icons */}
            <div className="mt-6 flex items-center gap-4 border-t border-border/30 pt-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                Follow us
              </span>
              {SOCIALS.map((social) => {
                const SocialIcon = social.icon
                return (
                  <a
                    key={social.href}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/50 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary hover:bg-primary/5"
                  >
                    <SocialIcon className="h-3.5 w-3.5" />
                  </a>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
