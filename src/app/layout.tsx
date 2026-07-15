import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { Suspense } from 'react'
import './globals.css'
import { THEME_INIT_SCRIPT } from '@/lib/theme'
import { ThemeProvider } from '@/components/theme/theme-provider'
import { ToastProvider } from '@/components/ui/toast'
import { AuthProvider } from '@/components/auth/auth-provider'
import { AppShell } from '@/components/layout/app-shell'
import { ServiceWorkerRegistration } from '@/components/pwa/service-worker-registration'
import { absoluteUrl, siteConfig } from '@/lib/site'
import { Analytics } from './analytics'
import { ConsentManager } from '@/components/privacy/consent-manager'
import { normalizeAdSensePublisherId } from '@/lib/adsense'

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
const ADSENSE_PUBLISHER_ID = normalizeAdSensePublisherId(process.env.GOOGLE_ADSENSE_PUBLISHER_ID)

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl()),
  title: {
    template: '%s | BusQuiz',
    default: 'BusQuiz — Play, Create & Compete',
  },
  description: siteConfig.description,
  manifest: '/manifest.webmanifest',
  ...(ADSENSE_PUBLISHER_ID ? { other: { 'google-adsense-account': ADSENSE_PUBLISHER_ID } } : {}),
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    type: 'website',
    siteName: 'BusQuiz',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    site: '@PlayBusQuiz',
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
      <body className="font-sans antialiased overflow-x-hidden">
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>

        <ServiceWorkerRegistration />

        <AuthProvider>
          <ThemeProvider defaultTheme="system">
            <ToastProvider>
              <AppShell>{children}</AppShell>
              <ConsentManager measurementId={GA_MEASUREMENT_ID} nonce={nonce} />
            </ToastProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
