import type { ReactNode } from 'react'
import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import {
  BarChart3,
  BookOpen,
  FileSearch,
  Flag,
  LayoutDashboard,
  Lightbulb,
  MessageSquare,
  ScrollText,
  Tag,
  Upload,
  Users,
} from 'lucide-react'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'
import { AdminNavLink } from './_components/admin-nav-link'
import { AdminMobileNav } from './_components/admin-mobile-nav'

const PATHNAME_HEADER = 'x-quiz-pathname'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const [session, headerStore, pendingReports, pendingSuggestions, pendingFeedback] =
    await Promise.all([
      auth(),
      headers(),
      prisma.report.count({ where: { status: 'PENDING' } }),
      prisma.categorySuggestion.count({ where: { status: 'PENDING' } }),
      prisma.feedback.count({ where: { status: 'PENDING' } }),
    ])

  const pathname = headerStore.get(PATHNAME_HEADER)

  if (!session?.user?.id) {
    redirect('/sign-in')
  }

  if (session.user.role !== 'ADMIN' && pathname !== '/admin/forbidden') {
    redirect('/admin/forbidden')
  }

  const displayName = session.user.username ?? 'Admin'

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-card">
        <div className="border-b border-border px-5 py-6">
          <p className="text-lg font-bold tracking-tight">⚡ Admin</p>
          <p className="mt-1 text-sm text-muted-foreground">Dashboard & moderation tools</p>
        </div>

        <nav className="flex-1 space-y-6 px-4 py-6">
          <div className="space-y-2">
            <p className="px-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Overview
            </p>
            <AdminNavLink href="/admin/dashboard">
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </AdminNavLink>
          </div>

          <div className="space-y-2">
            <p className="px-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Content
            </p>
            <AdminNavLink href="/admin/quizzes">
              <BookOpen className="h-4 w-4" />
              <span>Quizzes</span>
            </AdminNavLink>
            <AdminNavLink href="/admin/quizzes/import">
              <Upload className="h-4 w-4" />
              <span>Bulk Import</span>
            </AdminNavLink>
            <AdminNavLink href="/admin/quizzes/review-drafts">
              <FileSearch className="h-4 w-4" />
              <span>Review Drafts</span>
            </AdminNavLink>
            <AdminNavLink href="/admin/categories">
              <Tag className="h-4 w-4" />
              <span>Categories</span>
            </AdminNavLink>
          </div>

          <div className="space-y-2">
            <p className="px-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Community
            </p>
            <AdminNavLink href="/admin/users">
              <Users className="h-4 w-4" />
              <span>Users</span>
            </AdminNavLink>
            <AdminNavLink href="/admin/reports" badge={pendingReports}>
              <Flag className="h-4 w-4" />
              <span>Reports</span>
            </AdminNavLink>
            <AdminNavLink href="/admin/suggestions" badge={pendingSuggestions}>
              <Lightbulb className="h-4 w-4" />
              <span>Suggestions</span>
            </AdminNavLink>
            <AdminNavLink href="/admin/feedback" badge={pendingFeedback}>
              <MessageSquare className="h-4 w-4" />
              <span>Feedback</span>
            </AdminNavLink>
          </div>

          <div className="space-y-2">
            <p className="px-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              System
            </p>
            <AdminNavLink href="/admin/audit-log">
              <ScrollText className="h-4 w-4" />
              <span>Audit Log</span>
            </AdminNavLink>
            <AdminNavLink href="/admin/statistics">
              <BarChart3 className="h-4 w-4" />
              <span>Statistics</span>
            </AdminNavLink>
          </div>
        </nav>

        <div className="border-t border-border px-5 py-4">
          <p className="text-sm font-medium">{displayName}</p>
          <Link
            className="mt-1 inline-block text-sm text-muted-foreground transition-colors hover:text-foreground"
            href="/"
          >
            ← Back to site
          </Link>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between border-b border-border bg-card px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚡</span>
            <p className="text-sm font-bold">Admin</p>
          </div>
          <AdminMobileNav
            pendingReports={pendingReports}
            pendingSuggestions={pendingSuggestions}
            pendingFeedback={pendingFeedback}
          />
        </header>

        <main className="flex-1">
          <div className="px-4 py-6 md:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
