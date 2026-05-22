'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal } from 'lucide-react'
import { CategoryTile } from '@/components/ui/category-tile'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ReportQuizForm } from '@/app/quiz/report-quiz-form'
import { copy } from '@/lib/copy'

type Difficulty = 'ALL' | 'EASY' | 'MEDIUM' | 'HARD'
type SortOption = 'popular' | 'newest' | 'hardest'

interface QuizSummary {
  id: string
  title: string
  difficulty: string
  playCount: number
  createdAt: string
}

interface CategoryWithQuizzes {
  id: string
  slug: string
  name: string
  icon: string
  color: string
  description: string
  createdAt: string
  quizzes: QuizSummary[]
}

interface CategoryBrowserProps {
  categories: CategoryWithQuizzes[]
}

const difficultyColor: Record<string, 'success' | 'warning' | 'destructive'> = {
  EASY: 'success',
  MEDIUM: 'warning',
  HARD: 'destructive',
}

export function CategoryBrowser({ categories }: CategoryBrowserProps) {
  const [search, setSearch] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty>('ALL')
  const [sort, setSort] = useState<SortOption>('popular')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce search input with useEffect for proper cleanup
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
  }, [])

  const filtered = useMemo(() => {
    let cats = categories.map((cat) => ({
      ...cat,
      quizzes: cat.quizzes.filter((q) => {
        const matchesDiff = difficulty === 'ALL' || q.difficulty === difficulty
        const matchesSearch =
          !debouncedSearch ||
          cat.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          q.title.toLowerCase().includes(debouncedSearch.toLowerCase())
        return matchesDiff && matchesSearch
      }),
    }))

    // Filter out categories with no quizzes (after search/difficulty filter)
    if (debouncedSearch || difficulty !== 'ALL') {
      cats = cats.filter((c) => c.quizzes.length > 0)
    }

    // Sort
    switch (sort) {
      case 'popular':
        cats = cats.sort(
          (a, b) =>
            b.quizzes.reduce((s, q) => s + q.playCount, 0) -
            a.quizzes.reduce((s, q) => s + q.playCount, 0)
        )
        break
      case 'newest':
        cats = cats.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        break
      case 'hardest':
        cats = cats.sort(
          (a, b) =>
            b.quizzes.filter((q) => q.difficulty === 'HARD').length -
            a.quizzes.filter((q) => q.difficulty === 'HARD').length
        )
        break
    }

    return cats
  }, [categories, debouncedSearch, difficulty, sort])

  return (
    <div>
      {/* Filters */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search categories or quizzes…"
            data-global-search="true"
            className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Difficulty filter */}
        <div className="flex items-center gap-1">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground mr-1" />
          {(['ALL', 'EASY', 'MEDIUM', 'HARD'] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-semibold transition-colors',
                difficulty === d
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="popular">Most Popular</option>
          <option value="newest">Newest</option>
          <option value="hardest">Hardest</option>
        </select>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          <p className="text-5xl mb-4" aria-hidden="true">
            🔍
          </p>
          <p className="text-lg font-semibold">No categories found</p>
          <p className="text-sm">{copy.emptyStates.noCategoryResults}</p>
        </div>
      ) : (
        <motion.div layout className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filtered.map((cat) => (
              <motion.div
                key={cat.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <CategoryTile
                  slug={cat.slug}
                  name={cat.name}
                  icon={cat.icon}
                  color={cat.color}
                  description={cat.description}
                  quizCount={cat.quizzes.length}
                />

                {/* Quiz list */}
                {cat.quizzes.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {cat.quizzes.slice(0, 3).map((quiz) => (
                      <article
                        key={quiz.id}
                        className="space-y-2 rounded-lg border border-border bg-card p-2"
                      >
                        <Link
                          href={`/quiz/${quiz.id}`}
                          className="flex items-center justify-between rounded-lg px-1 py-1 text-sm hover:bg-accent transition-colors"
                        >
                          <span className="truncate font-medium">{quiz.title}</span>
                          <Badge
                            variant={difficultyColor[quiz.difficulty] ?? 'outline'}
                            className="ml-2 shrink-0"
                          >
                            {quiz.difficulty}
                          </Badge>
                        </Link>
                        <div className="px-1">
                          <ReportQuizForm quizId={quiz.id} />
                        </div>
                      </article>
                    ))}
                    {cat.quizzes.length > 3 && (
                      <p className="text-xs text-muted-foreground text-center">
                        +{cat.quizzes.length - 3} more
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
