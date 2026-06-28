'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface AdminNavLinkProps {
  href: string
  children: ReactNode
  badge?: number
  onClick?: () => void
}

export function AdminNavLink({ href, children, badge, onClick }: AdminNavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors',
        isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
      )}
    >
      <span className="flex items-center gap-2">{children}</span>
      {badge && badge > 0 ? (
        <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-red-500/15 px-1.5 py-0.5 text-xs font-semibold text-red-400">
          {badge}
        </span>
      ) : null}
    </Link>
  )
}
