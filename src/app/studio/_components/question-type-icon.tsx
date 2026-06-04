'use client'

import {
  CircleDot,
  CheckSquare,
  ToggleLeft,
  PenLine,
  ArrowDownUp,
  Link2,
  Rows2,
  MapPin,
} from 'lucide-react'
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
  MULTIPLE: { icon: CheckSquare, label: 'Multiple', colorClass: 'text-quiz-blue' },
  TRUEFALSE: { icon: ToggleLeft, label: 'True/False', colorClass: 'text-quiz-green' },
  FILL_BLANK: { icon: PenLine, label: 'Fill Blank', colorClass: 'text-quiz-orange' },
  ORDERING: { icon: ArrowDownUp, label: 'Ordering', colorClass: 'text-blue-500' },
  MATCHING: { icon: Link2, label: 'Matching', colorClass: 'text-purple-500' },
  CATEGORIZE: { icon: Rows2, label: 'Categorize', colorClass: 'text-orange-500' },
  LABEL: { icon: MapPin, label: 'Label', colorClass: 'text-green-500' },
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
