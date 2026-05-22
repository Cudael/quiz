import * as React from 'react'
import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Renders as a circle (e.g. for avatars). Defaults to false (rectangle).
   */
  circle?: boolean
}

export function Skeleton({ className, circle = false, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse bg-muted', circle ? 'rounded-full' : 'rounded-md', className)}
      {...props}
    />
  )
}
