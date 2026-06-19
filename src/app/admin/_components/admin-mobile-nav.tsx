'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  BarChart3,
  BookOpen,
  Flag,
  LayoutDashboard,
  Lightbulb,
  MessageSquare,
  Menu,
  ScrollText,
  Tag,
  Users,
} from 'lucide-react'
import { Sheet } from '@/components/ui/sheet'
import { AdminNavLink } from './admin-nav-link'

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [{ href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' }],
  },
  {
    label: 'Content',
    items: [
      { href: '/admin/quizzes', icon: BookOpen, label: 'Quizzes' },
      { href: '/admin/categories', icon: Tag, label: 'Categories' },
    ],
  },
  {
    label: 'Community',
    items: [
      { href: '/admin/users', icon: Users, label: 'Users' },
      { href: '/admin/reports', icon: Flag, label: 'Reports' },
      { href: '/admin/suggestions', icon: Lightbulb, label: 'Suggestions' },
      { href: '/admin/feedback', icon: MessageSquare, label: 'Feedback' },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/admin/audit-log', icon: ScrollText, label: 'Audit Log' },
      { href: '/admin/statistics', icon: BarChart3, label: 'Statistics' },
    ],
  },
]

interface AdminMobileNavProps {
  pendingReports?: number
  pendingSuggestions?: number
  pendingFeedback?: number
}

export function AdminMobileNav({
  pendingReports = 0,
  pendingSuggestions = 0,
  pendingFeedback = 0,
}: AdminMobileNavProps) {
  const [open, setOpen] = useState(false)

  const badgeMap: Record<string, number> = {
    '/admin/reports': pendingReports,
    '/admin/suggestions': pendingSuggestions,
    '/admin/feedback': pendingFeedback,
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open admin menu"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background transition-colors hover:bg-accent"
      >
        <Menu className="h-5 w-5" />
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} side="left" title="Admin Menu">
        <nav className="space-y-6 px-4 py-4">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="space-y-2">
              <p className="px-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {section.label}
              </p>
              {section.items.map((item) => (
                <AdminNavLink
                  key={item.href}
                  href={item.href}
                  badge={badgeMap[item.href]}
                  onClick={() => setOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </AdminNavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="border-t border-border px-4 py-4">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Back to site
          </Link>
        </div>
      </Sheet>
    </>
  )
}
