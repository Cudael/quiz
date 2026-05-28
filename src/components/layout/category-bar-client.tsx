'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import * as LucideIcons from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CategoryBarItem {
  slug: string
  name: string
  icon: string
  color: string
  imageUrl?: string
}

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
    <nav
      aria-label="Popular categories"
      className="sticky top-[57px] z-30 w-full border-b border-border/30 bg-muted/40 shadow-[0_2px_8px_rgba(0,0,0,0.06)] backdrop-blur-sm"
    >
      <div className="flex gap-0 overflow-x-auto scrollbar-none">
        {categories.map((category) => {
          const isActive = pathname.startsWith(`/categories/${category.slug}`)
          return (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className={cn(
                'group relative flex min-w-[72px] flex-1 flex-col items-center justify-center gap-1 px-3 py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isActive
                  ? 'text-primary bg-primary/8'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg">
                {category.imageUrl ? (
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ background: `${category.color}30` }}
                  >
                    <DynamicIcon name={category.icon} className="h-4 w-4" />
                  </span>
                )}
              </span>
              <span className="w-full truncate text-center text-[11px] font-semibold leading-tight">
                {category.name}
              </span>
              <span
                className={cn(
                  'absolute bottom-0 inset-x-0 h-[2px] transition-opacity',
                  isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
                )}
                style={{ background: category.color }}
                aria-hidden="true"
              />
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
