import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { ToastProvider } from '@/components/ui/toast'
import { Navbar } from '@/components/navbar'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'QuizMaster — Play, Create & Compete',
  description:
    'Test your knowledge across hundreds of categories. Create quizzes, compete on leaderboards, and earn badges.',
  openGraph: {
    title: 'QuizMaster — Play, Create & Compete',
    description: 'Test your knowledge across hundreds of categories.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider defaultTheme="dark">
          <ToastProvider>
            <Navbar />
            <main>{children}</main>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
