import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageHeroProps {
  eyebrow: ReactNode
  title: ReactNode
  description: ReactNode
  icon?: ReactNode
  children?: ReactNode
  className?: string
}

export function PageHero({
  eyebrow,
  title,
  description,
  icon,
  children,
  className,
}: PageHeroProps) {
  return (
    <header className={cn('mx-auto mb-10 max-w-3xl text-center md:mb-12', className)}>
      <div className="mb-3 inline-flex items-center gap-2 rounded-sm border bg-card px-3 py-1 text-xs font-bold text-muted-foreground">
        {icon}
        {eyebrow}
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{title}</h1>
      <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
        {description}
      </p>
      {children ? <div className="mt-6">{children}</div> : null}
    </header>
  )
}
