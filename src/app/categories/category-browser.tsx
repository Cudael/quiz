'use client'

import { useState, useMemo, useCallback } from 'react'
import type React from 'react'
import * as LucideIcons from 'lucide-react'
import { Search } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { QuizCard } from '@/components/ui/quiz-card'
import type { ParentCategoryData, SubcategoryData } from './page'

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Icon = (LucideIcons as any)[name] as
    | React.ComponentType<{
        className?: string
        style?: React.CSSProperties
        'aria-hidden'?: string
      }>
    | undefined
  if (!Icon) return null
  return <Icon className={className} style={style} aria-hidden="true" />
}

function SubcategoryCard({ sub }: { sub: SubcategoryData }) {
  return (
    <Link
      href={`/categories/${sub.slug}`}
      className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-transparent hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span
        className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: sub.color + '22' }}
      >
        <DynamicIcon
          name={sub.icon}
          className="h-5 w-5"
          style={{ color: sub.color } as React.CSSProperties}
        />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary">
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
      <div className="mb-4 flex items-center gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: parent.color + '22' }}
        >
          <DynamicIcon
            name={parent.icon}
            className="h-6 w-6"
            style={{ color: parent.color } as React.CSSProperties}
          />
        </span>
        <div>
          <h2 id={`cat-${parent.slug}`} className="text-lg font-bold leading-tight text-foreground">
            <Link
              href={`/categories/${parent.slug}`}
              className="hover:text-primary transition-colors"
            >
              {parent.name}
            </Link>
          </h2>
          <p className="text-xs text-muted-foreground">
            {parent.description}
            {parent.quizCount > 0 && (
              <span className="ml-2 font-medium">
                · {parent.quizCount} {parent.quizCount === 1 ? 'quiz' : 'quizzes'}
              </span>
            )}
          </p>
        </div>
      </div>

      {parent.subcategories.length > 0 || parent.featuredQuizzes.length > 0 ? (
        <div className="space-y-4">
          {parent.featuredQuizzes.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {parent.featuredQuizzes.map((quiz) => (
                <QuizCard key={quiz.id} quiz={quiz} />
              ))}
            </div>
          ) : null}

          {parent.subcategories.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {parent.subcategories.map((sub) => (
                <SubcategoryCard key={sub.slug} sub={sub} />
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          No subcategories yet
        </p>
      )}
    </section>
  )
}

export function CategoryBrowser({ parentCategories }: CategoryBrowserProps) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'most-quizzes' | 'az' | 'za'>('most-quizzes')

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const matches = parentCategories
      .map((parent) => {
        if (!q) {
          return parent
        }

        const parentMatches = parent.name.toLowerCase().includes(q)
        const matchingSubcats = parent.subcategories.filter((sub) =>
          sub.name.toLowerCase().includes(q)
        )
        if (!parentMatches && matchingSubcats.length === 0) return null
        return {
          ...parent,
          subcategories: parentMatches ? parent.subcategories : matchingSubcats,
        }
      })
      .filter(Boolean) as ParentCategoryData[]

    const compare = (a: ParentCategoryData, b: ParentCategoryData) => {
      if (sort === 'az') return a.name.localeCompare(b.name)
      if (sort === 'za') return b.name.localeCompare(a.name)
      return b.quizCount - a.quizCount || a.name.localeCompare(b.name)
    }

    return [...matches].sort(compare)
  }, [parentCategories, search, sort])

  return (
    <div>
      {/* Search */}
      <div className="mb-10 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
        <div>
          <label htmlFor="route-categories-search" className="sr-only">
            Search categories
          </label>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="route-categories-search"
              type="search"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search categories…"
              className="pl-10"
            />
          </div>
        </div>

        <div>
          <label htmlFor="route-categories-sort" className="sr-only">
            Sort categories
          </label>
          <select
            id="route-categories-sort"
            value={sort}
            onChange={(event) => setSort(event.target.value as 'most-quizzes' | 'az' | 'za')}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="az">A–Z</option>
            <option value="za">Z–A</option>
            <option value="most-quizzes">Most Quizzes</option>
          </select>
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
