'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface TooltipProps {
  content: React.ReactNode
  children: React.ReactElement
  side?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

export function Tooltip({ content, children, side = 'top', className }: TooltipProps) {
  const [visible, setVisible] = React.useState(false)
  const id = React.useId()

  const positionClasses: Record<string, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {React.cloneElement(children, {
        'aria-describedby': id,
      } as React.HTMLAttributes<HTMLElement>)}
      {visible && (
        <div
          id={id}
          role="tooltip"
          className={cn(
            'pointer-events-none absolute z-50 max-w-xs rounded-lg border border-border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md',
            positionClasses[side],
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  )
}
