import type { Metadata } from 'next'
import { headers } from 'next/headers'
import './globals.css'
import { THEME_INIT_SCRIPT } from '@/lib/theme'
import { ThemeProvider } from '@/components/theme/theme-provider'
import { ToastProvider } from '@/components/ui/toast'
import { AuthProvider } from '@/components/auth/auth-provider'
import { AppShell } from '@/components/layout/app-shell'
import { absoluteUrl, siteConfig } from '@/lib/site'

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl()),
  title: siteConfig.title,
  description: siteConfig.description,
  manifest: '/manifest.webmanifest',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = (await headers()).get('x-nonce') ?? undefined
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Apply theme class before hydration to prevent flash of incorrect theme. */}
        {/* Safe: THEME_INIT_SCRIPT is a static compile-time string with no user-controlled input. */}
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="font-sans antialiased">
        <AuthProvider>
          <ThemeProvider defaultTheme="system">
            <ToastProvider>
              <AppShell>{children}</AppShell>
            </ToastProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
