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
  FileText,
  Sparkles,
  TrendingUp,
  Bookmark,
  Info,
  Shuffle,
  Star,
  X,
  LogIn,
  UserPlus,
  BarChart3,
  GraduationCap,
} from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import { Avatar } from '@/components/ui/avatar'
import { StreakFlame } from '@/components/ui/streak-flame'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface LeftMenuProps {
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

interface MenuSection {
  title: string
  items: MenuItem[]
}

const EXPLORE: MenuSection = {
  title: 'Explore',
  items: [
    { href: '/categories', label: 'Categories', icon: Layers, description: 'Browse by topic' },
    { href: '/popular', label: 'Popular', icon: Star, description: 'All-time favorites' },
    { href: '/trending', label: 'Trending', icon: TrendingUp, description: "What's hot now" },
    {
      href: '/collections',
      label: 'Collections',
      icon: Bookmark,
      description: 'Curated quiz sets',
    },
    {
      href: '/random-quiz',
      label: 'Random Quiz',
      icon: Shuffle,
      description: 'Surprise me!',
      highlighted: true,
    },
  ],
}

const PLAY: MenuSection = {
  title: 'Play & Compete',
  items: [
    { href: '/duel', label: 'Duel Mode', icon: Swords, description: '1v1 real-time battle' },
    {
      href: '/challenges',
      label: 'Challenges',
      icon: Flame,
      description: 'Daily, weekly, monthly',
    },
    {
      href: '/leaderboard',
      label: 'Leaderboard',
      icon: Trophy,
      description: 'Top players & scores',
    },
  ],
}

const CREATE_LEARN: MenuSection = {
  title: 'Create & Learn',
  items: [
    { href: '/studio', label: 'Quiz Studio', icon: PenLine, description: 'Build your own quiz' },
    { href: '/learn', label: 'Learn', icon: GraduationCap, description: 'Tips & study methods' },
    {
      href: '/trivia-facts',
      label: 'Trivia Facts',
      icon: Lightbulb,
      description: 'Fascinating facts',
    },
    { href: '/blog', label: 'Blog', icon: Newspaper, description: 'Articles & tutorials' },
  ],
}

const COMMUNITY: MenuSection = {
  title: 'Community',
  items: [
    { href: '/badges', label: 'Badges', icon: Sparkles, description: 'Unlock achievements' },
    { href: '/stats', label: 'Platform Stats', icon: BarChart3, description: 'Live numbers' },
  ],
}

const COMPANY: MenuSection = {
  title: 'BusQuiz',
  items: [
    { href: '/about', label: 'About', icon: Info },
    { href: '/contact', label: 'Contact', icon: MessageSquare },
    { href: '/feedback', label: 'Send Feedback', icon: Lightbulb },
    { href: '/privacy', label: 'Privacy', icon: FileText },
    { href: '/terms', label: 'Terms', icon: FileText },
  ],
}

const SECTIONS = [EXPLORE, PLAY, CREATE_LEARN, COMMUNITY, COMPANY]

export function LeftMenu({ open, onClose }: LeftMenuProps) {
  const pathname = usePathname()
  const { data: session, status } = useSession()

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(href + '/')
  }

  if (!open) return null

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className="fixed inset-y-0 left-0 z-50 flex w-[300px] max-w-[85vw] flex-col bg-card border-r border-border shadow-2xl animate-in slide-in-from-left duration-300"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Header */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border/50 px-4">
          <Link
            href="/"
            onClick={onClose}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
          >
            <Logo className="h-7 w-auto" />
          </Link>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* User section */}
        <div className="border-b border-border/30 px-4 py-4">
          {status === 'loading' ? null : session?.user ? (
            <Link
              href="/profile"
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 rounded-md p-2 -mx-2 transition-colors hover:bg-accent/50',
                isActive('/profile') && 'bg-primary/5'
              )}
            >
              <Avatar src={session.user.image} fallback={session.user.name || 'User'} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{session.user.name || 'Player'}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Level {session.user.level}</span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <StreakFlame value={session.user.streakDays} size="sm" />{' '}
                    {session.user.streakDays}d
                  </span>
                </div>
              </div>
            </Link>
          ) : (
            <div className="flex gap-2">
              <Button asChild variant="outline" className="flex-1 rounded-md" size="sm">
                <Link href="/sign-in" onClick={onClose}>
                  <LogIn className="mr-1.5 h-3.5 w-3.5" />
                  Sign In
                </Link>
              </Button>
              <Button asChild className="flex-1 rounded-md" size="sm">
                <Link href="/sign-up" onClick={onClose}>
                  <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                  Register
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Navigation sections */}
        <div className="flex-1 overflow-y-auto px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SECTIONS.map((section) => (
            <div key={section.title} className="mb-1">
              <p className="px-3 pt-3 pb-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isActive(item.href)
                  const Icon = item.icon

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-150',
                        active
                          ? 'bg-primary/8 text-primary font-bold'
                          : item.highlighted
                            ? 'text-quiz-orange hover:bg-quiz-orange/5 hover:text-quiz-orange'
                            : 'text-foreground/75 hover:bg-accent hover:text-foreground'
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors',
                          active
                            ? 'bg-primary/15 text-primary'
                            : item.highlighted
                              ? 'bg-quiz-orange/10 text-quiz-orange'
                              : 'bg-muted/50 text-muted-foreground'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <span className={item.highlighted ? 'font-bold' : ''}>{item.label}</span>
                        {item.description && (
                          <p className="truncate text-[11px] text-muted-foreground/60 leading-tight">
                            {item.description}
                          </p>
                        )}
                      </div>
                      {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-border/30 px-4 py-3">
          <p className="text-center text-[10px] text-muted-foreground/50">
            Made with ❤️ and trivia
          </p>
        </div>
      </div>
    </>
  )
}
