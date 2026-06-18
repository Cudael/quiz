'use client'

import { cn } from '@/lib/utils'
import { MAP_REGIONS } from '@/lib/map-regions'
import type { QuizFormat } from '@/store/quiz-creator-store'

function FormatPreview({ format }: { format: QuizFormat }) {
  if (format === 'TEXT_CHOICE') {
    return (
      <div className="flex h-[72px] flex-col gap-1.5 rounded-md bg-muted/40 p-2">
        <div className="h-2.5 w-3/4 rounded bg-muted-foreground/20" />
        <div className="mt-0.5 grid grid-cols-2 gap-1">
          <div className="h-6 rounded bg-muted-foreground/15" />
          <div className="h-6 rounded bg-quiz-green/25 ring-1 ring-quiz-green/40" />
          <div className="h-6 rounded bg-muted-foreground/15" />
          <div className="h-6 rounded bg-muted-foreground/15" />
        </div>
      </div>
    )
  }

  if (format === 'MAP_CHOICE') {
    return (
      <div className="flex h-[72px] items-center justify-center gap-2 rounded-md bg-muted/40 p-2">
        <div className="h-12 w-16 rounded bg-quiz-orange/20 ring-1 ring-quiz-orange/40 flex items-center justify-center">
          <svg
            className="h-6 w-6 text-quiz-orange/60"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
        </div>
        <div className="flex flex-col gap-1">
          <div className="h-4 w-16 rounded bg-muted-foreground/15" />
          <div className="h-3 w-12 rounded bg-muted-foreground/10" />
        </div>
      </div>
    )
  }

  // IMAGE_CHOICE
  return (
    <div className="flex h-[72px] items-center justify-center gap-1.5 rounded-md bg-muted/40 p-2">
      <div className="h-10 w-10 rounded bg-purple-400/30 ring-1 ring-purple-400/50" />
      <div className="h-10 w-10 rounded bg-muted-foreground/15" />
      <div className="h-10 w-10 rounded bg-muted-foreground/15" />
      <div className="h-10 w-10 rounded bg-muted-foreground/15" />
    </div>
  )
}

export interface QuizTemplate {
  id: string
  format: QuizFormat
  name: string
  color: string
  timeLimitSec: number
  questionCount: number
}

export const QUIZ_TEMPLATES: QuizTemplate[] = [
  {
    id: 'text-choice',
    format: 'TEXT_CHOICE',
    name: 'Text Choice',
    color: 'text-primary',
    timeLimitSec: 20,
    questionCount: 5,
  },
  {
    id: 'image-choice',
    format: 'IMAGE_CHOICE',
    name: 'Image Choice',
    color: 'text-purple-500',
    timeLimitSec: 30,
    questionCount: 5,
  },
  {
    id: 'map-choice',
    format: 'MAP_CHOICE',
    name: 'Map Quiz',
    color: 'text-quiz-orange',
    timeLimitSec: 20,
    questionCount: 0,
  },
]

interface RegionPickerProps {
  selectedRegionId: string | null
  onSelect: (regionId: string) => void
}

export function RegionPicker({ selectedRegionId, onSelect }: RegionPickerProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">Choose a continent</p>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        {MAP_REGIONS.map((region) => {
          const isSelected = selectedRegionId === region.id
          return (
            <button
              key={region.id}
              type="button"
              onClick={() => onSelect(region.id)}
              className={cn(
                'rounded-md border px-3 py-1.5 text-xs font-medium transition-all',
                isSelected
                  ? 'border-quiz-orange bg-quiz-orange/10 text-quiz-orange ring-1 ring-quiz-orange'
                  : 'border-border text-muted-foreground hover:border-quiz-orange/50 hover:text-foreground'
              )}
            >
              {region.name}
              <span className="ml-1 opacity-60">({region.countries.length})</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

interface TemplatePickerProps {
  selectedId: string | null
  selectedRegionId: string | null
  onSelect: (template: QuizTemplate) => void
  onRegionSelect: (regionId: string) => void
}

export function TemplatePicker({
  selectedId,
  selectedRegionId,
  onSelect,
  onRegionSelect,
}: TemplatePickerProps) {
  const selectedBorderByTemplateId: Record<string, string> = {
    'text-choice': 'border-primary ring-primary',
    'image-choice': 'border-purple-500 ring-purple-500',
    'map-choice': 'border-quiz-orange ring-quiz-orange',
  }

  const isMapSelected = selectedId === 'map-choice'

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {QUIZ_TEMPLATES.map((template) => {
          const isSelected = selectedId === template.id
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onSelect(template)}
              className={cn(
                'rounded-lg border p-2 text-left transition-all hover:border-primary/50',
                isSelected && 'ring-2',
                isSelected && selectedBorderByTemplateId[template.id]
              )}
            >
              <FormatPreview format={template.format} />
              <p className={cn('mt-2 text-xs font-semibold', template.color)}>{template.name}</p>
            </button>
          )
        })}
      </div>
      {isMapSelected && (
        <RegionPicker selectedRegionId={selectedRegionId} onSelect={onRegionSelect} />
      )}
    </div>
  )
}
