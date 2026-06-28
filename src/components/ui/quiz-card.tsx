'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { getQuizPath } from '@/lib/quiz-url'

export interface QuizCardData {
  id: string
  title: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  coverImage?: string | null
  category: {
    name: string
    color: string
  }
  playCount?: number
  avgScore?: number
  avgRating?: number
  ratingCount?: number
  authorName?: string
  completed?: boolean
}

const DIFFICULTY_CONFIG = {
  EASY: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30',
  MEDIUM: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30',
  HARD: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30',
}

function getFallbackGradient(color: string) {
  const hex = color.trim().replace('#', '')
  const normalizedHex =
    hex.length === 3
      ? hex
          .split('')
          .map((char) => `${char}${char}`)
          .join('')
      : hex

  if (!/^[0-9a-fA-F]{6}$/.test(normalizedHex)) {
    return 'var(--background-image-card-gradient)'
  }

  const r = Number.parseInt(normalizedHex.slice(0, 2), 16)
  const g = Number.parseInt(normalizedHex.slice(2, 4), 16)
  const b = Number.parseInt(normalizedHex.slice(4, 6), 16)
  return `linear-gradient(135deg, rgba(${r}, ${g}, ${b}, 0.95) 0%, rgba(${r}, ${g}, ${b}, 0.6) 100%)`
}

function formatPlayCount(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`
  }
  return count.toString()
}

/** Blob URLs and data URLs that don't start with http/https are never valid
 *  across page loads — treat them as missing so we fall back to the gradient. */
function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url) return false
  return url.startsWith('http://') || url.startsWith('https://')
}

/** Arcade-style play button used across all card sizes */
function ArcadePlayButton({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  }
  return (
    <div
      className={cn(
        sizes[size],
        'flex items-center justify-center rounded-full',
        'bg-foreground',
        'shadow-[0_4px_0_0_hsl(var(--foreground)/0.35),0_0_0_3px_hsl(var(--foreground)/0.15)]',
        'transition-all duration-150',
        'group-hover:shadow-[0_2px_0_0_hsl(var(--foreground)/0.35),0_0_0_3px_hsl(var(--foreground)/0.2)] group-hover:translate-y-[2px]'
      )}
      aria-hidden="true"
    >
      {/* Triangle play icon — pure CSS for perfect centering */}
      <span
        className={cn(
          'block translate-x-[1px]',
          size === 'sm' && 'border-y-[5px] border-l-[9px] border-y-transparent border-l-background',
          size === 'md' &&
            'border-y-[6px] border-l-[11px] border-y-transparent border-l-background',
          size === 'lg' && 'border-y-[7px] border-l-[13px] border-y-transparent border-l-background'
        )}
      />
    </div>
  )
}

interface QuizCardProps {
  quiz: QuizCardData
  className?: string
}

function PlayedBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/20 px-1.5 py-px text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
      ✓ Played
    </span>
  )
}

function DifficultyPill({
  difficulty,
  className,
}: {
  difficulty: QuizCardData['difficulty']
  className?: string
}) {
  return (
    <span
      className={cn(
        'absolute inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md',
        DIFFICULTY_CONFIG[difficulty],
        className
      )}
    >
      {difficulty}
    </span>
  )
}

export const QuizCardHorizontal = React.memo(function QuizCardHorizontal({
  quiz,
  className,
}: QuizCardProps) {
  const [imageFailed, setImageFailed] = React.useState(false)
  const hasCoverImage = isValidImageUrl(quiz.coverImage) && !imageFailed

  return (
    <Link href={getQuizPath(quiz)} className={cn('group block min-w-0 shrink-0 w-full', className)}>
      <div className="overflow-hidden rounded-md border border-border/40 shadow-sm transition-shadow duration-200 group-hover:shadow-md">
        {/* Square image area */}
        <div className="relative aspect-square w-full">
          <div
            className="absolute inset-0"
            style={{ backgroundImage: getFallbackGradient(quiz.category.color) }}
          />
          {hasCoverImage ? (
            <Image
              src={quiz.coverImage ?? ''}
              alt={`${quiz.title} cover image`}
              fill
              unoptimized
              sizes="176px"
              className="object-cover"
              onError={() => setImageFailed(true)}
            />
          ) : null}
          {/* Category pill over image */}
          <div className="absolute left-2 top-2">
            <span
              className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-md"
              style={{
                backgroundColor: `${quiz.category.color}44`,
                border: `1px solid ${quiz.category.color}66`,
              }}
            >
              {quiz.category.name}
            </span>
          </div>
        </div>

        {/* Info bar */}
        <div className="flex flex-col gap-1 bg-card px-3 py-2.5">
          <h3 className="line-clamp-1 w-full truncate text-sm font-bold leading-tight text-foreground">
            {quiz.title}
          </h3>
          <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
            {quiz.avgRating !== undefined && (
              <span className="shrink-0 text-quiz-yellow">★ {quiz.avgRating.toFixed(1)}</span>
            )}
            {quiz.authorName && <span className="truncate">· by {quiz.authorName}</span>}
            {quiz.playCount !== undefined && (
              <span className="shrink-0 tabular-nums">
                · {formatPlayCount(quiz.playCount)} plays
              </span>
            )}
            {quiz.completed && <PlayedBadge />}
          </div>
        </div>
      </div>
    </Link>
  )
})

export const QuizCard = React.memo(function QuizCard({ quiz, className }: QuizCardProps) {
  const shouldReduceMotion = useReducedMotion()
  const [imageFailed, setImageFailed] = React.useState(false)
  const [spotlight, setSpotlight] = React.useState({ x: 0, y: 0, visible: false })
  const hasCoverImage = isValidImageUrl(quiz.coverImage) && !imageFailed

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (shouldReduceMotion) return
    const rect = e.currentTarget.getBoundingClientRect()
    setSpotlight({ x: e.clientX - rect.left, y: e.clientY - rect.top, visible: true })
  }

  function handleMouseLeave() {
    setSpotlight((prev) => ({ ...prev, visible: false }))
  }

  return (
    <Link href={getQuizPath(quiz)} className={cn('group block', className)}>
      <motion.div className="rounded-md border border-border/50 shadow-md transition-shadow duration-300 group-hover:shadow-xl group-hover:shadow-quiz-purple/10">
        {/* Square image area */}
        <div
          className="relative aspect-square w-full overflow-hidden rounded-t-md"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div
            className="absolute inset-0"
            style={{ backgroundImage: getFallbackGradient(quiz.category.color) }}
          />
          {hasCoverImage ? (
            <Image
              src={quiz.coverImage ?? ''}
              alt={`${quiz.title} cover image`}
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, 256px"
              className="object-cover"
              onError={() => setImageFailed(true)}
            />
          ) : null}

          {/* Spotlight hover */}
          {spotlight.visible && (
            <div
              className="pointer-events-none absolute inset-0 transition-opacity duration-200"
              style={{
                background: `radial-gradient(circle 180px at ${spotlight.x}px ${spotlight.y}px, rgba(255,255,255,0.1), transparent 80%)`,
              }}
            />
          )}

          {/* Category pill */}
          <div className="absolute left-3 top-3">
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md"
              style={{
                backgroundColor: `${quiz.category.color}44`,
                border: `1px solid ${quiz.category.color}66`,
              }}
            >
              {quiz.category.name}
            </span>
          </div>

          <DifficultyPill difficulty={quiz.difficulty} className="bottom-3 right-3" />

          {/* Arcade play button — centered, appears on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <ArcadePlayButton size="lg" />
          </div>
        </div>

        {/* Info section — more vertical space */}
        <div className="flex flex-col gap-2 rounded-b-md bg-card px-4 py-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 flex-1 text-sm font-extrabold leading-tight text-foreground">
              {quiz.title}
            </h3>
            <div className="shrink-0">
              <ArcadePlayButton size="md" />
            </div>
          </div>
          {(quiz.avgRating !== undefined ||
            quiz.playCount !== undefined ||
            quiz.avgScore !== undefined) && (
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              {quiz.avgRating !== undefined && (
                <span className="text-quiz-yellow">★ {quiz.avgRating.toFixed(1)}</span>
              )}
              {quiz.playCount !== undefined && (
                <span>· 🎮 {formatPlayCount(quiz.playCount)} plays</span>
              )}
              {quiz.avgScore !== undefined && <span>· 📊 {Math.round(quiz.avgScore)}% avg</span>}
              {quiz.completed && <PlayedBadge />}
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  )
})

export const QuizCardFeatured = React.memo(function QuizCardFeatured({
  quiz,
  className,
}: QuizCardProps) {
  const [imageFailed, setImageFailed] = React.useState(false)
  const hasCoverImage = isValidImageUrl(quiz.coverImage) && !imageFailed

  return (
    <Link href={getQuizPath(quiz)} className={cn('group block min-w-0 w-full h-full', className)}>
      <div className="flex h-full flex-col overflow-hidden rounded-md border border-border/40 shadow-sm transition-shadow duration-200 group-hover:shadow-md">
        {/* Square image area */}
        <div className="relative aspect-square w-full">
          <div
            className="absolute inset-0"
            style={{ backgroundImage: getFallbackGradient(quiz.category.color) }}
          />
          {hasCoverImage ? (
            <Image
              src={quiz.coverImage ?? ''}
              alt={`${quiz.title} cover image`}
              fill
              unoptimized
              sizes="(max-width: 1024px) 50vw, 33vw"
              className="object-cover"
              onError={() => setImageFailed(true)}
            />
          ) : null}
          {/* Category pill over image */}
          <div className="absolute left-2 top-2">
            <span
              className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-md"
              style={{
                backgroundColor: `${quiz.category.color}44`,
                border: `1px solid ${quiz.category.color}66`,
              }}
            >
              {quiz.category.name}
            </span>
          </div>
        </div>

        {/* Info bar */}
        <div className="flex flex-col gap-1 bg-card px-3 py-2.5">
          <h3 className="line-clamp-1 w-full truncate text-sm font-bold leading-tight text-foreground">
            {quiz.title}
          </h3>
          <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
            {quiz.avgRating !== undefined && (
              <span className="shrink-0 text-quiz-yellow">★ {quiz.avgRating.toFixed(1)}</span>
            )}
            {quiz.authorName && <span className="truncate">· by {quiz.authorName}</span>}
            {quiz.playCount !== undefined && (
              <span className="shrink-0 tabular-nums">
                · {formatPlayCount(quiz.playCount)} plays
              </span>
            )}
            {quiz.completed && <PlayedBadge />}
          </div>
        </div>
      </div>
    </Link>
  )
})

/** Compact card for category rows — ~7 fit on a full-width screen */
export const QuizCardCompact = React.memo(function QuizCardCompact({
  quiz,
  className,
}: QuizCardProps) {
  return (
    <Link
      href={getQuizPath(quiz)}
      className={cn(
        'group flex w-36 shrink-0 flex-col overflow-hidden rounded-md border border-border/50 bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
        className
      )}
    >
      {/* Category color accent bar */}
      <div className="h-1 w-full shrink-0" style={{ backgroundColor: quiz.category.color }} />
      <div className="flex flex-1 flex-col gap-1 p-2.5">
        <h3 className="line-clamp-2 text-xs font-bold leading-tight text-foreground">
          {quiz.title}
        </h3>
        <div className="mt-auto flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
          {quiz.avgRating !== undefined && (
            <span className="text-quiz-yellow">★ {quiz.avgRating.toFixed(1)}</span>
          )}
          {quiz.playCount !== undefined && <span>· {formatPlayCount(quiz.playCount)} plays</span>}
          {quiz.completed && <PlayedBadge />}
          <span
            className="ml-auto rounded-sm px-1 py-px text-[9px] font-bold uppercase"
            style={{
              backgroundColor: `${quiz.category.color}22`,
              color: quiz.category.color,
            }}
          >
            {quiz.difficulty.toLowerCase()}
          </span>
        </div>
      </div>
    </Link>
  )
})
