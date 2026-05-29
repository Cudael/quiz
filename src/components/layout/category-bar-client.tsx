'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import * as LucideIcons from 'lucide-react'
import { cn, withAlphaColor } from '@/lib/utils'

export interface CategoryBarItem {
  slug: string
  name: string
  icon: string
  color: string
  imageUrl?: string
  quizCount: number
}

const CATEGORY_ICON_BG_ALPHA = 0.19

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Icon = (LucideIcons as any)[name] as
    | React.ComponentType<{
        className?: string
        'aria-hidden'?: string
      }>
    | undefined
  if (!Icon) return null
  return <Icon className={className} aria-hidden="true" />
}

export function CategoryBarClient({ categories }: { categories: CategoryBarItem[] }) {
  const pathname = usePathname()

  if (categories.length === 0) return null

  return (
    <div className="w-full border-b border-border/20 py-3">
      <div className="container mx-auto px-4 md:px-6">
        <div
          role="navigation"
          aria-label="Popular categories"
          className="flex gap-3 overflow-x-auto scrollbar-none"
        >
          {categories.map((category) => {
            const isActive = pathname.startsWith(`/categories/${category.slug}`)
            return (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className={cn(
                  'group flex w-24 shrink-0 flex-col overflow-hidden rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isActive
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-border bg-card hover:border-border/80 hover:bg-accent/50'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="relative h-14 w-full overflow-hidden">
                  {category.imageUrl ? (
                    <Image
                      src={category.imageUrl}
                      alt={category.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  ) : (
                    <span
                      className="flex h-full w-full items-center justify-center"
                      style={{
                        backgroundColor: withAlphaColor(category.color, CATEGORY_ICON_BG_ALPHA),
                      }}
                    >
                      <DynamicIcon name={category.icon} className="h-7 w-7" />
                    </span>
                  )}
                </div>
                <div className="px-2 py-1.5">
                  <p className="truncate text-xs font-semibold leading-tight">{category.name}</p>
                  <p className="text-[10px] text-muted-foreground">{category.quizCount} quizzes</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
