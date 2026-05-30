'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { Play } from 'lucide-react'
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
        <div className="relative h-36 w-full">
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
        </div>
        <div className="flex items-start justify-between gap-2 bg-card p-3">
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-sm font-bold leading-tight text-foreground">
              {quiz.title}
            </h3>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {quiz.playCount !== undefined ? (
                <>
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {formatPlayCount(quiz.playCount)} plays
                  </span>
                  <span className="text-[11px] text-muted-foreground">•</span>
                </>
              ) : null}
              <Badge
                variant={getDifficultyVariant(quiz.difficulty)}
                className="h-4 px-1.5 py-0 text-[10px]"
              >
                {quiz.difficulty}
              </Badge>
            </div>
          </div>
          <div className="shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary shadow-sm shadow-primary/30 transition-transform duration-200 group-hover:scale-110">
              <Play
                className="h-3.5 w-3.5 translate-x-0.5 text-primary-foreground"
                fill="currentColor"
              />
            </div>
          </div>
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
        className="relative h-60 rounded-2xl border border-border/50 shadow-md transition-shadow duration-300 group-hover:shadow-xl group-hover:shadow-quiz-purple/10"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Inner clip wrapper — kept separate from the transform element so
            border-radius clipping never breaks during the scale animation */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          {/* Background */}
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

          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

          {/* Spotlight hover */}
          {spotlight.visible && (
            <div
              className="pointer-events-none absolute inset-0 transition-opacity duration-200"
              style={{
                background: `radial-gradient(circle 180px at ${spotlight.x}px ${spotlight.y}px, rgba(255,255,255,0.08), transparent 80%)`,
              }}
            />
          )}
        </div>

        {/* Category pill */}
        <div className="absolute left-3 top-3">
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md"
            style={{
              backgroundColor: `${quiz.category.color}33`,
              color: quiz.category.color,
              border: `1px solid ${quiz.category.color}55`,
            }}
          >
            {quiz.category.name}
          </span>
        </div>

        {/* Play button on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-foreground/90 shadow-lg backdrop-blur-sm">
            <Play className="h-5 w-5 translate-x-0.5 text-quiz-purple" fill="currentColor" />
          </div>
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="line-clamp-2 text-base font-black leading-tight text-primary-foreground">
            {quiz.title}
          </h3>
          <div className="mt-2 flex items-center gap-2">
            {quiz.playCount !== undefined ? (
              <span className="text-xs font-semibold text-primary-foreground/70">
                🎮 {formatPlayCount(quiz.playCount)}
              </span>
            ) : null}
            <Badge
              variant={getDifficultyVariant(quiz.difficulty)}
              className="ml-auto text-[10px] py-0.5"
            >
              {quiz.difficulty}
            </Badge>
          </div>
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
    <Link href={`/quiz/${quiz.id}`} className={cn('group block h-64 w-full md:h-72', className)}>
      <motion.div
        whileHover={shouldReduceMotion ? undefined : { y: -3, scale: 1.005 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative h-full rounded-3xl border border-border/50 shadow-xl transition-shadow duration-300 group-hover:shadow-2xl group-hover:shadow-quiz-purple/20"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Inner clip wrapper — kept separate from the transform element */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          {/* Background */}
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/5" />

          {/* Spotlight */}
          {spotlight.visible && (
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: `radial-gradient(circle 300px at ${spotlight.x}px ${spotlight.y}px, rgba(255,255,255,0.07), transparent 80%)`,
              }}
            />
          )}
        </div>

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
              backgroundColor: `${quiz.category.color}33`,
              color: quiz.category.color,
              border: `1px solid ${quiz.category.color}55`,
            }}
          >
            {quiz.category.name}
          </span>
        </div>

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="line-clamp-2 text-2xl font-black leading-tight text-primary-foreground md:text-3xl">
            {quiz.title}
          </h3>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/40 transition-all duration-200 group-hover:bg-primary/90 group-hover:shadow-xl group-hover:shadow-primary/50">
              <Play className="h-4 w-4 translate-x-0.5" fill="currentColor" />
              Play Now
            </div>
            {quiz.playCount !== undefined ? (
              <span className="text-sm font-semibold text-primary-foreground/70">
                🎮 {formatPlayCount(quiz.playCount)} plays
              </span>
            ) : null}
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
