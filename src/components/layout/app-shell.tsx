'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { SiteFooter } from '@/components/layout/site-footer'
import { EmailVerificationBanner } from '@/components/auth/email-verification-banner'
import { UsernameOnboarding } from '@/components/auth/username-onboarding'

export function AppShell({
  children,
  categoryBar,
}: {
  children: React.ReactNode
  categoryBar?: React.ReactNode
}) {
  const pathname = usePathname()

  // Embed routes render bare content designed for iframes — no site chrome.
  if (pathname?.startsWith('/embed')) {
    return <main id="main-content">{children}</main>
  }

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-md focus:bg-card focus:px-3 focus:py-2 focus:text-sm focus:ring-2 focus:ring-ring"
      >
        Skip to content
      </a>
      <Navbar />
      <EmailVerificationBanner />
      <UsernameOnboarding />
      {categoryBar ? <div className="border-t border-transparent" aria-hidden="true" /> : null}
      {categoryBar}
      <main id="main-content">{children}</main>
      <SiteFooter />
    </>
  )
}
