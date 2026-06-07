'use client'

import Link from 'next/link'
import * as LucideIcons from 'lucide-react'
import type { HomeFeaturedCategory } from '../home-page-client.types'
import { cn } from '@/lib/utils'

function CategoryIcon({
  name,
  className,
  style,
}: {
  name: string
  className?: string
  style?: React.CSSProperties
}) {
  const Icon = (
    LucideIcons as unknown as Record<
      string,
      React.ComponentType<{ className?: string; style?: React.CSSProperties }>
    >
  )[name]
  if (Icon) return <Icon className={className} style={style} />
  return <span className={cn('text-xs font-black', className)}>{name.slice(0, 2)}</span>
}

export function CategoryTiles({ categories }: { categories: HomeFeaturedCategory[] }) {
  if (categories.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-accent/20 p-8 text-center text-sm text-muted-foreground">
        Categories will appear here soon.
      </div>
    )
  }

  return (
    <section>
      <div className="mb-3 flex items-end justify-between">
        <h2 className="text-xl font-black tracking-tight">Categories</h2>
        <Link
          href="/categories"
          className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          See all →
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/categories/${category.slug}`}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-border/40 bg-card p-3 text-center transition-all hover:border-primary/30 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${category.color}18` }}
            >
              <CategoryIcon
                name={category.icon}
                className="h-5 w-5"
                style={{ color: category.color }}
              />
            </div>
            <span className="max-w-full truncate text-xs font-semibold">{category.name}</span>
            <span className="text-[10px] text-muted-foreground tabular-nums">
              {category.quizCount} {category.quizCount === 1 ? 'quiz' : 'quizzes'}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
