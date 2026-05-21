'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CategoryTileProps {
  slug: string
  name: string
  icon: string
  color: string
  quizCount?: number
  description?: string
  className?: string
}

export function CategoryTile({
  slug,
  name,
  icon,
  color,
  quizCount,
  description,
  className,
}: CategoryTileProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.04, y: -4 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Link
        href={`/categories/${slug}`}
        className={cn(
          'block rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-shadow duration-200',
          className
        )}
        style={{ background: color }}
      >
        <div className="text-4xl mb-3" aria-hidden="true">
          {icon}
        </div>
        <h3 className="text-lg font-bold mb-1">{name}</h3>
        {description && <p className="text-sm text-white/80 mb-2 line-clamp-2">{description}</p>}
        {quizCount !== undefined && <p className="text-xs text-white/70">{quizCount} quizzes</p>}
      </Link>
    </motion.div>
  )
}
