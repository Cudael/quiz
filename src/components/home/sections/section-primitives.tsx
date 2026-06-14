'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export function AnimatedCounter({ value, duration = 1.5 }: { value: number; duration?: number }) {
  const shouldReduce = useReducedMotion()
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (shouldReduce) return
    const startTime = performance.now()
    let rafId: number
    function update() {
      const elapsed = performance.now() - startTime
      const progress = Math.min(elapsed / (duration * 1000), 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(value * eased))
      if (progress < 1) {
        rafId = requestAnimationFrame(update)
      }
    }
    rafId = requestAnimationFrame(update)
    return () => cancelAnimationFrame(rafId)
  }, [value, duration, shouldReduce])

  return <>{(shouldReduce ? value : count).toLocaleString()}</>
}

export function Divider() {
  return <div className="border-t border-border/30" />
}

export function SectionHeader({
  title,
  subtitle,
  href,
}: {
  title: string
  subtitle?: string
  href: string
}) {
  return (
    <div className="mb-3 flex items-end justify-between">
      <div>
        <h2 className="text-2xl font-black tracking-tight">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      <Link
        href={href}
        className="flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md px-1 transition-colors"
      >
        See all <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  )
}
