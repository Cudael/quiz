import * as React from 'react'
import { cn } from '@/lib/utils'

/** Accent square shown next to the eyebrow label — the page's color signature. */
const ACCENT_CLASSES = {
  foreground: 'bg-foreground',
  purple: 'bg-quiz-purple',
  orange: 'bg-quiz-orange',
  green: 'bg-quiz-green',
  blue: 'bg-quiz-blue',
  yellow: 'bg-quiz-yellow',
  pink: 'bg-quiz-pink',
} as const

interface PageHeaderProps {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  back?: React.ReactNode
  /** Small uppercase kicker label rendered above the title. */
  eyebrow?: React.ReactNode
  /** Color of the square marker next to the eyebrow. */
  accent?: keyof typeof ACCENT_CLASSES
  className?: string
}

export function PageHeader({
  title,
  description,
  actions,
  back,
  eyebrow,
  accent = 'foreground',
  className,
}: PageHeaderProps) {
  return (
    <header className={cn('mb-8', className)}>
      {back && <div className="mb-4">{back}</div>}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          {eyebrow && (
            <p className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              <span aria-hidden className={cn('h-2 w-2 shrink-0', ACCENT_CLASSES[accent])} />
              {eyebrow}
            </p>
          )}
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">{title}</h1>
          {description && <p className="mt-2 text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  )
}
