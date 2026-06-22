'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Award, BookOpenCheck, Library, Settings, Trophy, type LucideIcon } from 'lucide-react'

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
    <nav className="space-y-1 lg:sticky lg:top-20" aria-label="Profile navigation">
      {PROFILE_LINKS.map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href)
        const Icon = link.icon

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? 'page' : undefined}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground aria-[current=page]:bg-quiz-purple/10 aria-[current=page]:font-semibold aria-[current=page]:text-quiz-purple"
          >
            <Icon className="h-4 w-4 shrink-0" />
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
