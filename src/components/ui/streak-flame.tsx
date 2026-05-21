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

export function StreakFlame({ value, best, size = 'md', className }: StreakFlameProps) {
  const pulse = Math.min(1.8, 1 + value / 30)

  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      <motion.span
        animate={{ scale: [1, pulse, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ repeat: Infinity, duration: 1.2 }}
        className="inline-flex"
      >
        <Flame
          className={cn(sizeClass[size], value > 0 ? 'text-orange-400' : 'text-muted-foreground')}
        />
      </motion.span>
      <span className="text-xs text-muted-foreground">
        current: <span className="font-semibold text-foreground">{value} days</span>
        {typeof best === 'number' && (
          <>
            {' '}
            • best: <span className="font-semibold text-foreground">{best} days</span>
          </>
        )}
      </span>
    </div>
  )
}
