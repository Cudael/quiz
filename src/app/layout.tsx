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
import { absoluteUrl, siteConfig } from '@/lib/site'
import { Analytics } from './analytics'

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
const CF_BEACON_TOKEN = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN

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
                gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
              `}
            </Script>
          </>
        )}

        {/* Cloudflare Web Analytics */}
        {CF_BEACON_TOKEN && (
          <Script
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={`{"token": "${CF_BEACON_TOKEN}"}`}
            strategy="afterInteractive"
            nonce={nonce}
          />
        )}

        <Suspense fallback={null}>
          <Analytics />
        </Suspense>

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
