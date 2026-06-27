'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Award, BookOpenCheck, Library, Settings, Trophy, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const PROFILE_LINKS: Array<{ href: string; label: string; icon: LucideIcon; exact?: boolean }> = [
  { href: '/profile', label: 'Overview', icon: Trophy, exact: true },
  { href: '/profile/completed', label: 'Completed', icon: BookOpenCheck },
  { href: '/profile/quizzes', label: 'My Quizzes', icon: Library },
  { href: '/profile/badges', label: 'Badges', icon: Award },
  { href: '/profile/settings', label: 'Settings', icon: Settings },
]

export function ProfileSidebar() {
  const pathname = usePathname()

  return (
    <nav
      className="flex gap-1.5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label="Profile navigation"
    >
      {PROFILE_LINKS.map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href)
        const Icon = link.icon

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-all border border-transparent shadow-sm active:scale-95 duration-150',
              active
                ? 'bg-primary/8 text-primary border-primary/20 bg-primary/5'
                : 'text-muted-foreground bg-card hover:bg-accent hover:text-foreground hover:border-border/50'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
