'use client'

import Link from 'next/link'
import { Keyboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SoundControls } from '@/components/sound-controls'
import { useShortcutsModal } from '@/components/global-hotkeys'

export function SiteFooter() {
  const { openShortcuts } = useShortcutsModal()

  return (
    <footer className="mt-16 border-t border-border/40 bg-background/80">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-5 text-sm text-muted-foreground">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="https://github.com/Cudael/quiz" target="_blank" rel="noreferrer">
              GitHub
            </Link>
          </Button>
          <SoundControls />
          <Button
            variant="ghost"
            size="sm"
            onClick={openShortcuts}
            aria-label="Open keyboard shortcuts"
          >
            <Keyboard className="h-4 w-4" />
            Shortcuts
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/about/accessibility">Accessibility</Link>
          </Button>
        </div>

        <p>© {new Date().getFullYear()} QuizArena</p>
      </div>
    </footer>
  )
}
