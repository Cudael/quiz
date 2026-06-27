'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  Layers,
  Flame,
  Swords,
  Trophy,
  PenLine,
  Lightbulb,
  Newspaper,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Bookmark,
  Info,
  Shuffle,
  Star,
  BarChart3,
  GraduationCap,
} from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { StreakFlame } from '@/components/ui/streak-flame'
import { cn } from '@/lib/utils'

interface NavDropdownProps {
  open: boolean
  onClose: () => void
}

interface MenuItem {
  href: string
  label: string
  icon: typeof Layers
  description?: string
  highlighted?: boolean
}

const EXPLORE_ITEMS: MenuItem[] = [
  { href: '/categories', label: 'Categories', icon: Layers, description: 'Browse by topic' },
  { href: '/popular', label: 'Popular', icon: Star, description: 'All-time favorites' },
  { href: '/trending', label: 'Trending', icon: TrendingUp, description: "What's hot now" },
  { href: '/collections', label: 'Collections', icon: Bookmark, description: 'Curated quiz sets' },
  {
    href: '/random-quiz',
    label: 'Random Quiz',
    icon: Shuffle,
    description: 'Surprise me!',
    highlighted: true,
  },
]

const PLAY_ITEMS: MenuItem[] = [
  { href: '/duel', label: 'Duel Mode', icon: Swords, description: '1v1 real-time battle' },
  { href: '/challenges', label: 'Challenges', icon: Flame, description: 'Daily, weekly, monthly' },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy, description: 'Top players & scores' },
]

const CREATE_LEARN_ITEMS: MenuItem[] = [
  { href: '/studio', label: 'Quiz Studio', icon: PenLine, description: 'Build your own quiz' },
  { href: '/learn', label: 'Learn', icon: GraduationCap, description: 'Tips & study methods' },
  {
    href: '/trivia-facts',
    label: 'Trivia Facts',
    icon: Lightbulb,
    description: 'Fascinating facts',
  },
  { href: '/blog', label: 'Blog', icon: Newspaper, description: 'Articles & tutorials' },
]

const COMMUNITY_ITEMS: MenuItem[] = [
  { href: '/badges', label: 'Badges', icon: Sparkles, description: 'Unlock achievements' },
  { href: '/stats', label: 'Platform Stats', icon: BarChart3, description: 'Live numbers' },
]

const COMPANY_ITEMS: MenuItem[] = [
  { href: '/about', label: 'About', icon: Info },
  { href: '/contact', label: 'Contact', icon: MessageSquare },
  { href: '/feedback', label: 'Send Feedback', icon: Lightbulb },
]

export function NavDropdown({ open, onClose }: NavDropdownProps) {
  const pathname = usePathname()
  const { data: session, status } = useSession()

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(href + '/')
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden="true" />

      {/* Dropdown panel */}
      <div className="fixed top-14 left-0 z-50 mt-1 w-[480px] max-w-[calc(100vw-1rem)] animate-in fade-in slide-in-from-top-2 duration-200">
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl ring-1 ring-black/5">
          <div className="grid grid-cols-2 gap-1 p-3">
            {/* Column 1: Explore + Play */}
            <div className="space-y-1">
              {[
                { title: 'Explore', items: EXPLORE_ITEMS },
                { title: 'Play & Compete', items: PLAY_ITEMS },
              ].map((section) => (
                <div key={section.title}>
                  <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    {section.title}
                  </p>
                  {section.items.map((item) => {
                    const active = isActive(item.href)
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                          active
                            ? 'bg-primary/8 text-primary'
                            : item.highlighted
                              ? 'text-quiz-orange hover:bg-quiz-orange/5'
                              : 'text-foreground/70 hover:bg-accent hover:text-foreground'
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-3.5 w-3.5 shrink-0',
                            active ? 'text-primary' : 'text-muted-foreground'
                          )}
                        />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              ))}
            </div>

            {/* Column 2: Create & Learn + Community + Company */}
            <div className="space-y-1">
              {[
                { title: 'Create & Learn', items: CREATE_LEARN_ITEMS },
                { title: 'Community', items: COMMUNITY_ITEMS },
                { title: 'BusQuiz', items: COMPANY_ITEMS },
              ].map((section) => (
                <div key={section.title}>
                  <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    {section.title}
                  </p>
                  {section.items.map((item) => {
                    const active = isActive(item.href)
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                          active
                            ? 'bg-primary/8 text-primary'
                            : 'text-foreground/70 hover:bg-accent hover:text-foreground'
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-3.5 w-3.5 shrink-0',
                            active ? 'text-primary' : 'text-muted-foreground'
                          )}
                        />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              ))}

              {/* Signed-in user quick link */}
              {status === 'loading' ? (
                <div className="mt-2 px-3 py-2">
                  <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                </div>
              ) : session?.user ? (
                <Link
                  href="/profile"
                  onClick={onClose}
                  className="mt-2 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 hover:bg-accent hover:text-foreground transition-colors"
                >
                  <Avatar src={session.user.image} fallback={session.user.name || 'U'} size="sm" />
                  <div className="min-w-0">
                    <span className="truncate text-xs font-bold">
                      {session.user.name || 'Player'}
                    </span>
                    <span className="ml-2 text-[10px] text-muted-foreground">
                      Lv.{session.user.level} ·{' '}
                      <StreakFlame value={session.user.streakDays} size="sm" />
                    </span>
                  </div>
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
