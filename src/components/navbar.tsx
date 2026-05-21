'use client'

import Link from 'next/link'
import { Brain, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './ui/button'
import { ThemeToggle } from './theme-toggle'
import { AuthControls } from './auth-controls'

const navLinks = [
  { href: '/categories', label: 'Categories' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/studio', label: 'Create' },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-quiz-purple to-quiz-pink">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-quiz-purple-light to-quiz-pink bg-clip-text text-transparent">
            QuizMaster
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <AuthControls />
          <Button variant="gradient" size="sm" asChild className="hidden md:flex">
            <Link href="/play">Play Now</Link>
          </Button>
          <button
            className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border/40 bg-background/95 backdrop-blur-xl md:hidden"
          >
            <nav
              className="container mx-auto flex flex-col gap-1 px-4 py-4"
              aria-label="Mobile navigation"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-2 pt-2 border-t border-border/40">
                <Button variant="gradient" className="w-full" asChild>
                  <Link href="/play" onClick={() => setMobileOpen(false)}>
                    Play Now 🎮
                  </Link>
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
