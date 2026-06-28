'use client'

import { CircleDot, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { QuestionType } from '@/store/quiz-creator-store'

interface QuestionTypeIconProps {
  type: QuestionType
  className?: string
  showLabel?: boolean
}

const TYPE_CONFIG: Record<
  QuestionType,
  { icon: React.ComponentType<{ className?: string }>; label: string; colorClass: string }
> = {
  SINGLE: { icon: CircleDot, label: 'Single', colorClass: 'text-quiz-purple' },
  HOTSPOT: { icon: Target, label: 'Hotspot', colorClass: 'text-quiz-orange' },
}

export function QuestionTypeIcon({ type, className, showLabel = false }: QuestionTypeIconProps) {
  const { icon: Icon, label, colorClass } = TYPE_CONFIG[type]

  return (
    <span className={cn('inline-flex items-center gap-1', colorClass, className)}>
      <Icon className="h-4 w-4" />
      {showLabel && <span className="text-xs font-medium">{label}</span>}
    </span>
  )
}
