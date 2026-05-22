'use client'

import { Navbar } from '@/components/layout/navbar'
import { SiteFooter } from '@/components/layout/site-footer'
import { GlobalHotkeysProvider } from '@/components/hotkeys/global-hotkeys'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <GlobalHotkeysProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-md focus:bg-card focus:px-3 focus:py-2 focus:text-sm focus:ring-2 focus:ring-ring"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main-content">{children}</main>
      <SiteFooter />
    </GlobalHotkeysProvider>
  )
}
