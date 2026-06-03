'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

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
}

function getDifficultyVariant(difficulty: QuizCardData['difficulty']) {
  if (difficulty === 'EASY') return 'success'
  if (difficulty === 'MEDIUM') return 'warning'
  return 'destructive'
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

/** Arcade-style play button used across all card sizes */
function ArcadePlayButton({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  }
  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }
  return (
    <div
      className={cn(
        sizes[size],
        'flex items-center justify-center rounded-full',
        'bg-primary',
        'shadow-[0_4px_0_0_hsl(var(--primary)/0.5),0_0_0_3px_hsl(var(--primary)/0.2)]',
        'transition-all duration-150',
        'group-hover:shadow-[0_2px_0_0_hsl(var(--primary)/0.5),0_0_0_3px_hsl(var(--primary)/0.3)] group-hover:translate-y-[2px]',
      )}
      aria-hidden="true"
    >
      {/* Triangle play icon — pure CSS for perfect centering */}
      <span
        className={cn(
          'block translate-x-[1px]',
          size === 'sm' && 'border-y-[5px] border-l-[9px] border-y-transparent border-l-white',
          size === 'md' && 'border-y-[6px] border-l-[11px] border-y-transparent border-l-white',
          size === 'lg' && 'border-y-[7px] border-l-[13px] border-y-transparent border-l-white',
        )}
      />
    </div>
  )
}

interface QuizCardProps {
  quiz: QuizCardData
  className?: string
}

export function QuizCardHorizontal({ quiz, className }: QuizCardProps) {
  const [imageFailed, setImageFailed] = React.useState(false)
  const hasCoverImage = Boolean(quiz.coverImage) && !imageFailed

  return (
    <Link href={`/quiz/${quiz.id}`} className={cn('group block shrink-0 w-52', className)}>
      <div className="overflow-hidden rounded-2xl border border-border/40 shadow-sm transition-shadow duration-200 group-hover:shadow-md">
        {/* Image area — fixed height */}
        <div className="relative h-28 w-full">
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
              sizes="208px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImageFailed(true)}
            />
          ) : null}
          {/* Category pill over image */}
          <div className="absolute left-2 top-2">
            <span
              className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider backdrop-blur-md"
              style={{
                backgroundColor: `${quiz.category.color}44`,
                color: '#fff',
                border: `1px solid ${quiz.category.color}66`,
              }}
            >
              {quiz.category.name}
            </span>
          </div>
        </div>

        {/* White info bar — fixed height so long titles don't push the card */}
        <div className="flex h-16 items-center justify-between gap-2 bg-card px-3">
          <div className="min-w-0 flex-1 overflow-hidden">
            <h3 className="line-clamp-2 text-xs font-bold leading-tight text-foreground">
              {quiz.title}
            </h3>
            {quiz.playCount !== undefined ? (
              <p className="mt-0.5 truncate text-[10px] font-medium text-muted-foreground">
                {formatPlayCount(quiz.playCount)} plays
              </p>
            ) : null}
          </div>
          <div className="shrink-0">
            <ArcadePlayButton size="sm" />
          </div>
        </div>

        {/* Difficulty strip */}
        <div className="border-t border-border/30 bg-card px-3 pb-2 pt-1">
          <Badge
            variant={getDifficultyVariant(quiz.difficulty)}
            className="h-4 px-1.5 py-0 text-[9px]"
          >
            {quiz.difficulty}
          </Badge>
        </div>
      </div>
    </Link>
  )
}

export function QuizCard({ quiz, className }: QuizCardProps) {
  const shouldReduceMotion = useReducedMotion()
  const [imageFailed, setImageFailed] = React.useState(false)
  const [spotlight, setSpotlight] = React.useState({ x: 0, y: 0, visible: false })
  const hasCoverImage = Boolean(quiz.coverImage) && !imageFailed

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (shouldReduceMotion) return
    const rect = e.currentTarget.getBoundingClientRect()
    setSpotlight({ x: e.clientX - rect.left, y: e.clientY - rect.top, visible: true })
  }

  function handleMouseLeave() {
    setSpotlight((prev) => ({ ...prev, visible: false }))
  }

  return (
    <Link href={`/quiz/${quiz.id}`} className={cn('group block', className)}>
      <motion.div
        whileHover={shouldReduceMotion ? undefined : { y: -3, scale: 1.01 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="overflow-hidden rounded-2xl border border-border/50 shadow-md transition-shadow duration-300 group-hover:shadow-xl group-hover:shadow-quiz-purple/10"
      >
        {/* Image area — fixed height, no text overlay */}
        <div
          className="relative h-40 w-full"
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
              className="object-cover transition-transform duration-500 group-hover:scale-105"
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
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md"
              style={{
                backgroundColor: `${quiz.category.color}44`,
                color: '#fff',
                border: `1px solid ${quiz.category.color}66`,
              }}
            >
              {quiz.category.name}
            </span>
          </div>

          {/* Arcade play button — centered, appears on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <ArcadePlayButton size="lg" />
          </div>
        </div>

        {/* White info bar — fixed height to prevent title-length layout shifts */}
        <div className="flex h-[72px] items-center justify-between gap-2 bg-card px-3">
          <div className="min-w-0 flex-1 overflow-hidden">
            <h3 className="line-clamp-2 text-sm font-black leading-tight text-foreground">
              {quiz.title}
            </h3>
            {quiz.playCount !== undefined ? (
              <p className="mt-0.5 truncate text-[11px] font-medium text-muted-foreground">
                🎮 {formatPlayCount(quiz.playCount)} plays
              </p>
            ) : null}
          </div>
          <div className="shrink-0">
            <ArcadePlayButton size="md" />
          </div>
        </div>

        {/* Difficulty strip */}
        <div className="border-t border-border/30 bg-card px-3 pb-2.5 pt-1.5">
          <Badge
            variant={getDifficultyVariant(quiz.difficulty)}
            className="h-4 px-1.5 py-0 text-[10px]"
          >
            {quiz.difficulty}
          </Badge>
        </div>
      </motion.div>
    </Link>
  )
}

export function QuizCardFeatured({ quiz, className }: QuizCardProps) {
  const shouldReduceMotion = useReducedMotion()
  const [imageFailed, setImageFailed] = React.useState(false)
  const [spotlight, setSpotlight] = React.useState({ x: 0, y: 0, visible: false })
  const hasCoverImage = Boolean(quiz.coverImage) && !imageFailed

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (shouldReduceMotion) return
    const rect = e.currentTarget.getBoundingClientRect()
    setSpotlight({ x: e.clientX - rect.left, y: e.clientY - rect.top, visible: true })
  }

  function handleMouseLeave() {
    setSpotlight((prev) => ({ ...prev, visible: false }))
  }

  return (
    <Link href={`/quiz/${quiz.id}`} className={cn('group block w-full', className)}>
      <motion.div
        whileHover={shouldReduceMotion ? undefined : { y: -3, scale: 1.005 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="overflow-hidden rounded-3xl border border-border/50 shadow-xl transition-shadow duration-300 group-hover:shadow-2xl group-hover:shadow-quiz-purple/20"
      >
        {/* Image area */}
        <div
          className="relative h-52 w-full md:h-60"
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
              sizes="100vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              onError={() => setImageFailed(true)}
            />
          ) : null}

          {/* Spotlight */}
          {spotlight.visible && (
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: `radial-gradient(circle 300px at ${spotlight.x}px ${spotlight.y}px, rgba(255,255,255,0.07), transparent 80%)`,
              }}
            />
          )}

          {/* Featured badge */}
          <div className="absolute left-5 top-5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-amber-950 shadow-lg shadow-amber-500/30">
              ★ Featured
            </span>
          </div>

          {/* Category pill */}
          <div className="absolute right-5 top-5">
            <span
              className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold backdrop-blur-md"
              style={{
                backgroundColor: `${quiz.category.color}44`,
                color: '#fff',
                border: `1px solid ${quiz.category.color}66`,
              }}
            >
              {quiz.category.name}
            </span>
          </div>

          {/* Centered arcade play button on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <ArcadePlayButton size="lg" />
          </div>
        </div>

        {/* White info bar — fixed height */}
        <div className="flex h-20 items-center justify-between gap-3 bg-card px-5">
          <div className="min-w-0 flex-1 overflow-hidden">
            <h3 className="line-clamp-2 text-base font-black leading-tight text-foreground md:text-lg">
              {quiz.title}
            </h3>
            {quiz.playCount !== undefined ? (
              <p className="mt-0.5 truncate text-xs font-semibold text-muted-foreground">
                🎮 {formatPlayCount(quiz.playCount)} plays
              </p>
            ) : null}
          </div>
          <div className="shrink-0">
            <ArcadePlayButton size="lg" />
          </div>
        </div>

        {/* Difficulty strip */}
        <div className="border-t border-border/30 bg-card px-5 pb-3 pt-2">
          <Badge
            variant={getDifficultyVariant(quiz.difficulty)}
            className="h-4 px-1.5 py-0 text-[10px]"
          >
            {quiz.difficulty}
          </Badge>
        </div>
      </motion.div>
    </Link>
  )
}
