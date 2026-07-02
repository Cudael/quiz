import type { Metadata } from 'next'
import Script from 'next/script'
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

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl()),
  title: {
    template: '%s | BusQuiz',
    default: 'BusQuiz — Play, Create & Compete',
  },
  description: siteConfig.description,
  manifest: '/manifest.webmanifest',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    type: 'website',
    siteName: 'BusQuiz',
    locale: 'en_US',
    images: ['/og-default.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    site: '@PlayBusQuiz',
    images: ['/og-default.png'],
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
        {/* Google Analytics */}
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
              nonce={nonce}
            />
            <Script id="ga4-init" strategy="afterInteractive" nonce={nonce}>
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}

        <Suspense fallback={null}>
          <Analytics />
        </Suspense>

        <ServiceWorkerRegistration />

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
