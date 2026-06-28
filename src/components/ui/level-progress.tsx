'use client'

import { motion } from 'framer-motion'
import { ProgressBar } from '@/components/ui/progress-bar'
import { xpForLevel, xpForNextLevel, xpProgress } from '@/domain/leveling'
import { cn } from '@/lib/utils'

interface LevelProgressProps {
  xp: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const ringSize = {
  sm: 52,
  md: 96,
  lg: 132,
}

export function LevelProgress({ xp, size = 'md', className }: LevelProgressProps) {
  const progress = xpProgress(xp)
  const width = ringSize[size]
  const stroke = size === 'sm' ? 5 : 8
  const radius = width / 2 - stroke
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - progress.pct / 100)
  const gradientId = `level-gradient-${size}`

  return (
    <div className={cn('w-full', className)}>
      <div className="mx-auto flex flex-col items-center gap-2">
        <div
          className="relative"
          style={{ width, height: width }}
          title={`xpForLevel(n) = 100 * (n-1) * n / 2\nTotal XP: ${xp.toLocaleString()}`}
          aria-label={`Level progress indicator: level ${progress.level}, total XP ${xp.toLocaleString()}`}
        >
          <svg width={width} height={width} className="-rotate-90">
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--color-quiz-purple)" />
                <stop offset="100%" stopColor="var(--color-quiz-pink)" />
              </linearGradient>
            </defs>
            {/* Track */}
            <circle
              cx={width / 2}
              cy={width / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={stroke}
              className="text-muted/30"
            />
            {/* Progress arc */}
            <motion.circle
              cx={width / 2}
              cy={width / 2}
              r={radius}
              fill="none"
              strokeWidth={stroke}
              strokeDasharray={circumference}
              strokeDashoffset={circumference}
              strokeLinecap="round"
              stroke={`url(#${gradientId})`}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className={cn(
                'font-black text-quiz-orange',
                size === 'sm' ? 'text-sm' : size === 'md' ? 'text-2xl' : 'text-3xl'
              )}
            >
              {progress.level}
            </span>
            {size !== 'sm' && (
              <span className="text-[11px] text-muted-foreground">
                {xp - xpForLevel(progress.level)} /{' '}
                {xpForNextLevel(progress.level) - xpForLevel(progress.level)} XP
              </span>
            )}
          </div>
        </div>

        <ProgressBar
          value={progress.intoLevel}
          max={progress.levelSpan}
          variant="gradient"
          size={size === 'sm' ? 'sm' : 'md'}
          animated
          className="w-full"
          data-testid="level-progress-bar"
        />
      </div>
    </div>
  )
}
