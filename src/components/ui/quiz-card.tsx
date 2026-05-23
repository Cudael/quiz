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
  return `linear-gradient(135deg, rgba(${r}, ${g}, ${b}, 0.95) 0%, rgba(${r}, ${g}, ${b}, 0.55) 100%)`
}

interface QuizCardProps {
  quiz: QuizCardData
  className?: string
}

export function QuizCard({ quiz, className }: QuizCardProps) {
  const shouldReduceMotion = useReducedMotion()
  const [imageFailed, setImageFailed] = React.useState(false)
  const hasCoverImage = Boolean(quiz.coverImage) && !imageFailed

  return (
    <Link href={`/quiz/${quiz.id}`} className={cn('block', className)}>
      <motion.div
        whileHover={shouldReduceMotion ? undefined : { y: -4, scale: 1.01 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="relative h-52 overflow-hidden rounded-2xl border border-white/10 shadow-sm"
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />

        <div className="absolute right-3 top-3 flex flex-wrap justify-end gap-2">
          <Badge variant={getDifficultyVariant(quiz.difficulty)}>{quiz.difficulty}</Badge>
          <Badge
            variant="outline"
            className="border-white/25 text-primary-foreground"
            style={{ backgroundColor: 'rgb(0 0 0 / 0.45)' }}
          >
            {quiz.category.name}
          </Badge>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="line-clamp-2 text-lg font-extrabold text-primary-foreground">
            {quiz.title}
          </h3>
        </div>
      </motion.div>
    </Link>
  )
}

export function QuizCardFeatured({ quiz, className }: QuizCardProps) {
  const shouldReduceMotion = useReducedMotion()
  const [imageFailed, setImageFailed] = React.useState(false)
  const hasCoverImage = Boolean(quiz.coverImage) && !imageFailed

  return (
    <Link href={`/quiz/${quiz.id}`} className={cn('block h-72 w-full md:h-80', className)}>
      <motion.div
        whileHover={shouldReduceMotion ? undefined : { y: -4, scale: 1.01 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="relative h-full overflow-hidden rounded-3xl border border-white/10 shadow-sm"
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
            className="object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

        <div className="absolute right-4 top-4 flex flex-wrap justify-end gap-2">
          <Badge variant={getDifficultyVariant(quiz.difficulty)}>{quiz.difficulty}</Badge>
          <Badge
            variant="outline"
            className="border-white/25 text-primary-foreground"
            style={{ backgroundColor: 'rgb(0 0 0 / 0.45)' }}
          >
            {quiz.category.name}
          </Badge>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="line-clamp-2 text-2xl font-black text-primary-foreground md:text-3xl">
            {quiz.title}
          </h3>
          <span className="mt-4 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            Play now →
          </span>
        </div>
      </motion.div>
    </Link>
  )
}
