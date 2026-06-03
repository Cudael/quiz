'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import type React from 'react'
import * as LucideIcons from 'lucide-react'
import { ArrowRight, Search } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { EmptyState } from '@/components/ui/empty-state'
import { QuizCardHorizontal } from '@/components/ui/quiz-card'
import type { QuizCardData } from '@/components/ui/quiz-card'
import type { ParentCategoryData } from './page'

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

function ParentSection({ parent }: { parent: ParentCategoryData }) {
  return (
    <section aria-labelledby={`cat-${parent.slug}`}>
      <div className="rounded-2xl border border-border/70 bg-card/60 p-5">
        {/* Parent header */}
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <span
              className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
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
            <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
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

        {/* Popular quizzes for this parent category (if any direct quizzes) */}
        {parent.popularQuizzes.length > 0 ? (
          <div className="mb-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Popular in {parent.name}
            </p>
            <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {parent.popularQuizzes.map((quiz) => {
                const quizCard: QuizCardData = {
                  id: quiz.id,
                  title: quiz.title,
                  coverImage: quiz.coverImage,
                  difficulty: quiz.difficulty,
                  category: { name: parent.name, color: parent.color },
                  playCount: quiz.playCount,
                }
                return (
                  <QuizCardHorizontal
                    key={quiz.id}
                    quiz={quizCard}
                    className="w-48 shrink-0"
                  />
                )
              })}
            </div>
          </div>
        ) : null}

        {/* Subcategories */}
        {parent.subcategories.length > 0 ? (
          <div className="space-y-6 border-t border-border/40 pt-5">
            {parent.subcategories.map((sub) => {
              const subQuizCards: QuizCardData[] = sub.popularQuizzes.map((quiz) => ({
                id: quiz.id,
                title: quiz.title,
                coverImage: quiz.coverImage,
                difficulty: quiz.difficulty,
                category: { name: sub.name, color: sub.color },
                playCount: quiz.playCount,
              }))

              return (
                <div key={sub.slug}>
                  {/* Subcategory header */}
                  <div className="mb-2 flex items-center gap-3">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: sub.color + '22' }}
                    >
                      <DynamicIcon
                        name={sub.icon}
                        className="h-4 w-4"
                        style={{ color: sub.color } as React.CSSProperties}
                      />
                    </span>
                    <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                      <div>
                        <Link
                          href={`/categories/${sub.slug}`}
                          className="text-sm font-bold text-foreground transition-colors hover:text-primary"
                        >
                          {sub.name}
                        </Link>
                        <p className="text-[11px] text-muted-foreground">
                          {sub.quizCount} {sub.quizCount === 1 ? 'quiz' : 'quizzes'}
                        </p>
                      </div>
                      <Link
                        href={`/categories/${sub.slug}`}
                        className="shrink-0 text-xs font-semibold text-primary transition-colors hover:text-primary/80"
                      >
                        See all →
                      </Link>
                    </div>
                  </div>

                  {/* Subcategory quiz scroller */}
                  {subQuizCards.length > 0 ? (
                    <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      {subQuizCards.map((quiz) => (
                        <QuizCardHorizontal
                          key={quiz.id}
                          quiz={quiz}
                          className="w-48 shrink-0"
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs italic text-muted-foreground">No quizzes yet.</p>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-border px-4 py-5 text-center text-sm text-muted-foreground">
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
            className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
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
