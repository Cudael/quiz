'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CategoryTileProps {
  slug: string
  name: string
  icon: string
  color: string
  imageUrl?: string
  quizCount?: number
  description?: string
  className?: string
}

export const CategoryTile = React.memo(function CategoryTile({
  slug,
  name,
  color,
  imageUrl,
  quizCount,
  description,
  className,
}: CategoryTileProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Link
        href={`/categories/${slug}`}
        className={cn(
          'block overflow-hidden rounded-2xl text-white shadow-lg hover:shadow-xl transition-shadow duration-200',
          className
        )}
      >
        {imageUrl ? (
          <div className="relative h-32 w-full" aria-hidden="true">
            <Image
              src={imageUrl}
              alt=""
              fill
              unoptimized
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            <div className="absolute inset-0 bg-black/30" aria-hidden="true" />
          </div>
        ) : null}
        <div className="p-5" style={{ background: color }}>
          <h3 className="text-lg font-bold mb-1">{name}</h3>
          {description && <p className="text-sm text-white/80 mb-2 line-clamp-2">{description}</p>}
          {quizCount !== undefined && <p className="text-xs text-white/70">{quizCount} quizzes</p>}
        </div>
      </Link>
    </motion.div>
  )
})
