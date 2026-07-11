'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import type React from 'react'
import { categoryIcons, ArrowRight, Search } from '@/lib/category-icons'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { EmptyState } from '@/components/ui/empty-state'

interface SubcategoryData {
  slug: string
  name: string
  description: string
  icon: string
  color: string
  quizCount: number
  totalPlays: number
  popularQuizzes: {
    id: string
    title: string
    coverImage: string | null
    difficulty: 'EASY' | 'MEDIUM' | 'HARD'
    playCount: number
  }[]
}

export interface ParentCategoryData {
  slug: string
  name: string
  description: string
  icon: string
  color: string
  quizCount: number
  totalPlays: number
  subcategories: SubcategoryData[]
  popularQuizzes: SubcategoryData['popularQuizzes']
}

interface CategoryBrowserProps {
  parentCategories: ParentCategoryData[]
  totalQuizzes: number
  totalCategories: number
}

function DynamicIcon({
  name,
  className,
  style,
}: {
  name: string
  className?: string
  style?: React.CSSProperties
}) {
  const Icon = categoryIcons[name]
  if (!Icon) return null
  return <Icon className={className} style={style} aria-hidden="true" />
}

function SubcategoryCard({ sub }: { sub: SubcategoryData }) {
  return (
    <Link
      href={`/categories/${sub.slug}`}
      className="group flex items-start gap-3 rounded-md border border-border/80 bg-card/70 p-3 transition-all duration-200 hover:border-transparent hover:bg-card hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: sub.color + '22' }}
      >
        <DynamicIcon
          name={sub.icon}
          className="h-4 w-4"
          style={{ color: sub.color } as React.CSSProperties}
        />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
          {sub.name}
        </p>
        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{sub.description}</p>
        <p className="mt-1 text-xs font-medium text-muted-foreground">
          {sub.quizCount} {sub.quizCount === 1 ? 'quiz' : 'quizzes'}
        </p>
      </div>
    </Link>
  )
}

function ParentSection({ parent }: { parent: ParentCategoryData }) {
  return (
    <section aria-labelledby={`cat-${parent.slug}`}>
      <div className="rounded-md border border-border/70 bg-card/60 p-5">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <span
              className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-md"
              style={{ backgroundColor: parent.color + '22' }}
            >
              <DynamicIcon
                name={parent.icon}
                className="h-5 w-5"
                style={{ color: parent.color } as React.CSSProperties}
              />
            </span>
            <div className="min-w-0">
              <h2
                id={`cat-${parent.slug}`}
                className="text-lg font-bold leading-tight text-foreground"
              >
                <Link
                  href={`/categories/${parent.slug}`}
                  className="transition-colors hover:text-primary"
                >
                  {parent.name}
                </Link>
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{parent.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-sm border border-border bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
              {parent.quizCount} {parent.quizCount === 1 ? 'quiz' : 'quizzes'}
            </span>
            <Link
              href={`/categories/${parent.slug}`}
              className="inline-flex items-center text-sm font-semibold text-primary transition-colors hover:text-primary/80"
            >
              Browse all
              <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {parent.subcategories.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {parent.subcategories.map((sub) => (
              <SubcategoryCard key={sub.slug} sub={sub} />
            ))}
          </div>
        ) : (
          <p className="rounded-md border border-dashed border-border px-4 py-5 text-center text-sm text-muted-foreground">
            No subcategories yet
          </p>
        )}
      </div>
    </section>
  )
}

export function CategoryBrowser({ parentCategories }: CategoryBrowserProps) {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
  }, [])

  const filtered = useMemo(() => {
    if (!debouncedSearch) return parentCategories
    const q = debouncedSearch.toLowerCase()
    return parentCategories
      .map((parent) => {
        const parentMatches =
          parent.name.toLowerCase().includes(q) || parent.description.toLowerCase().includes(q)
        const matchingSubcats = parent.subcategories.filter(
          (sub) => sub.name.toLowerCase().includes(q) || sub.description.toLowerCase().includes(q)
        )
        if (!parentMatches && matchingSubcats.length === 0) return null
        return {
          ...parent,
          subcategories: parentMatches ? parent.subcategories : matchingSubcats,
        }
      })
      .filter(Boolean) as ParentCategoryData[]
  }, [parentCategories, debouncedSearch])

  return (
    <div>
      {/* Search */}
      <div className="mb-10 max-w-lg">
        <label htmlFor="route-categories-search" className="sr-only">
          Search categories
        </label>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="route-categories-search"
            type="search"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search categories…"
            data-global-search="true"
            className="w-full rounded-md border border-input bg-background py-2.5 pl-10 pr-4 text-base focus:outline-none focus:ring-2 focus:ring-ring md:text-sm"
          />
        </div>
      </div>

      {/* Category sections */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No categories found"
          description="Try a different search term."
          action={{
            label: 'Clear search',
            onClick: () => setSearch(''),
          }}
        />
      ) : (
        <motion.div layout className="space-y-10">
          <AnimatePresence>
            {filtered.map((parent) => (
              <motion.div
                key={parent.slug}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <ParentSection parent={parent} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
