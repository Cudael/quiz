'use client'

import * as React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null
  alt?: string
  fallback?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-xl',
}

const fallbackColors = [
  'from-quiz-purple to-quiz-pink',
  'from-quiz-blue to-quiz-purple',
  'from-quiz-green to-quiz-blue',
  'from-quiz-pink to-quiz-yellow',
  'from-quiz-purple to-quiz-green',
] as const

function colorClassFor(value: string) {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 2147483647
  }
  return fallbackColors[Math.abs(hash) % fallbackColors.length]
}

export function Avatar({ src, alt, fallback, size = 'md', className, ...props }: AvatarProps) {
  const [imgError, setImgError] = React.useState(false)
  const colorClass = colorClassFor((fallback ?? alt ?? '?').toLowerCase())
  const initials = fallback
    ? fallback
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?'

  return (
    <div
      className={cn(
        'relative flex shrink-0 overflow-hidden rounded-full bg-gradient-to-br',
        colorClass,
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {src && !imgError ? (
        <Image
          src={src}
          alt={alt ?? fallback ?? 'Avatar'}
          fill
          unoptimized
          sizes={size === 'sm' ? '32px' : size === 'md' ? '40px' : size === 'lg' ? '48px' : '64px'}
          className="object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center font-bold text-primary-foreground">
          {initials}
        </span>
      )}
    </div>
  )
}
