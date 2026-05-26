'use client'

import { Flame } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface StreakFlameProps {
  value: number
  best?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClass = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-7 w-7',
}

const labelSize = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
}

export function StreakFlame({ value, best, size = 'md', className }: StreakFlameProps) {
  const pulse = Math.min(1.6, 1 + value / 25)
  const isHot = value >= 3

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <motion.span
        animate={isHot ? { scale: [1, pulse, 1], opacity: [0.85, 1, 0.85] } : {}}
        transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        className="relative inline-flex"
      >
        <Flame
          className={cn(
            sizeClass[size],
            'drop-shadow-sm',
            value > 0 ? 'text-orange-400' : 'text-muted-foreground'
          )}
        />
        {/* Glow ring for hot streaks */}
        {value >= 7 && (
          <span
            className="absolute inset-0 rounded-full blur-sm"
            style={{ background: 'rgba(249, 115, 22, 0.35)' }}
            aria-hidden="true"
          />
        )}
      </motion.span>
      <span className={cn(labelSize[size], 'text-muted-foreground')}>
        current: <span className="font-black text-foreground">{value} days</span>
        {typeof best === 'number' && (
          <span className="ml-1.5 font-medium">
            {' '}
            · best: <span className="font-bold text-foreground">{best} days</span>
          </span>
        )}
      </span>
    </div>
  )
}
