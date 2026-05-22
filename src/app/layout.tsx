import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { ToastProvider } from '@/components/ui/toast'
import { AuthProvider } from '@/components/auth-provider'
import { AppShell } from '@/components/app-shell'
import { absoluteUrl, siteConfig } from '@/lib/site'

const themeInitScript = `(function(){try{var stored=localStorage.getItem('theme');var systemDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var theme=stored==='light'||stored==='dark'||stored==='system'?stored:'system';var resolved=theme==='system'?(systemDark?'dark':'light'):theme;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);root.style.colorScheme=resolved;}catch(_e){}})();`

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl()),
  title: siteConfig.title,
  description: siteConfig.description,
  manifest: '/manifest.webmanifest',
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Script id="theme-init" strategy="beforeInteractive">
        {themeInitScript}
      </Script>
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
