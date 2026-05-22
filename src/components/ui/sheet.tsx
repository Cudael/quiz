'use client'

import * as React from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'

interface SheetProps {
  open: boolean
  onClose: () => void
  side?: 'left' | 'right'
  title?: string
  children: React.ReactNode
  className?: string
}

const slideVariants = {
  left: {
    initial: { x: '-100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
  },
  right: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 },
  },
}

export function Sheet({ open, onClose, side = 'right', title, children, className }: SheetProps) {
  const reduceMotion = useReducedMotion()
  const panelRef = React.useRef<HTMLDivElement | null>(null)
  const restoreFocusRef = React.useRef<HTMLElement | null>(null)

  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !panelRef.current) return
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement
      if (e.shiftKey && active === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }

    if (open) {
      restoreFocusRef.current = document.activeElement as HTMLElement | null
      document.addEventListener('keydown', handleEsc)
      document.addEventListener('keydown', handleTab)
      document.body.style.overflow = 'hidden'
      requestAnimationFrame(() => {
        panelRef.current
          ?.querySelector<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
          ?.focus()
      })
    }
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.removeEventListener('keydown', handleTab)
      document.body.style.overflow = ''
      const el = restoreFocusRef.current
      if (el && document.body.contains(el)) {
        el.focus()
      }
    }
  }, [open, onClose])

  const variants = slideVariants[side]

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
          aria-label={title ?? 'Menu'}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            initial={reduceMotion ? { opacity: 0 } : variants.initial}
            animate={reduceMotion ? { opacity: 1 } : variants.animate}
            exit={reduceMotion ? { opacity: 0 } : variants.exit}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className={cn(
              'relative z-10 flex h-full w-72 max-w-[90vw] flex-col bg-card shadow-lg',
              side === 'right' ? 'ml-auto' : 'mr-auto',
              className
            )}
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              {title && <p className="font-semibold">{title}</p>}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label="Close menu"
                className="ml-auto"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
