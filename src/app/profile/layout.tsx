import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Award, Settings, Trophy } from 'lucide-react'
import { auth } from '@/server/auth'

export const metadata: Metadata = {
  title: { default: 'My Profile', template: '%s | BusQuiz' },
  robots: { index: false },
}

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/sign-in?callbackUrl=/profile')
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar */}
        <aside className="shrink-0 lg:w-56">
          <nav className="space-y-1 lg:sticky lg:top-20">
            <SidebarLink href="/profile" icon={Trophy}>
              Overview
            </SidebarLink>
            <SidebarLink href="/profile/badges" icon={Award}>
              Badges
            </SidebarLink>
            <SidebarLink href="/profile/settings" icon={Settings}>
              Settings
            </SidebarLink>
          </nav>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}

function SidebarLink({
  href,
  icon: Icon,
  children,
}: {
  href: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground aria-[current]:bg-quiz-purple/10 aria-[current]:text-quiz-purple aria-[current]:font-semibold"
    >
      <Icon className="h-4 w-4 shrink-0" />
      {children}
    </Link>
  )
}
