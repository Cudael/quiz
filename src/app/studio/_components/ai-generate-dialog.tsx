'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'
import { generateQuizWithAi } from '@/app/studio/actions/ai-generate'

interface Category {
  id: string
  name: string
}

interface AiGenerateDialogProps {
  open: boolean
  onClose: () => void
  categories: Category[]
}

const DIFFICULTIES = [
  { value: 'EASY', label: 'Easy' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HARD', label: 'Hard' },
] as const

const COUNTS = [5, 10, 15, 20]

const FORMATS: { value: string; label: string; group: string }[] = [
  { value: 'TEXT_CHOICE', label: 'Text Choice', group: 'Standard' },
  { value: 'IMAGE_CHOICE', label: 'Image Choice', group: 'Image' },
  { value: 'MAP_CHOICE', label: 'Map Choice', group: 'Image' },
  { value: 'IMAGE_HOTSPOT', label: 'Image Hotspot', group: 'Image' },
  { value: 'IMAGE_REVEAL', label: 'Image Reveal', group: 'Image' },
  { value: 'AUDIO_CHOICE', label: 'Audio Choice', group: 'Media' },
  { value: 'MEMORY_FLASH', label: 'Memory Flash', group: 'Media' },
  { value: 'ORDER', label: 'Order / Ranking', group: 'Interactive' },
  { value: 'MATCH', label: 'Match Pairs', group: 'Interactive' },
  { value: 'CONNECTIONS', label: 'Connections', group: 'Interactive' },
  { value: 'ODD_ONE_OUT', label: 'Odd One Out', group: 'Special' },
  { value: 'VERSUS', label: 'Versus', group: 'Special' },
  { value: 'TYPE_ANSWER', label: 'Type Answer', group: 'Text' },
  { value: 'ANAGRAM', label: 'Anagram', group: 'Text' },
  { value: 'NUMBER_GUESS', label: 'Number Guess', group: 'Text' },
]

export function AiGenerateDialog({ open, onClose, categories }: AiGenerateDialogProps) {
  const router = useRouter()
  const { addToast } = useToast()
  const [generating, setGenerating] = React.useState(false)
  const [topic, setTopic] = React.useState('')
  const [categoryId, setCategoryId] = React.useState(categories[0]?.id ?? '')
  const [count, setCount] = React.useState(10)
  const [difficulty, setDifficulty] = React.useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM')
  const [format, setFormat] = React.useState('TEXT_CHOICE')

  async function handleGenerate() {
    if (!topic.trim() || !categoryId) return

    setGenerating(true)
    try {
      const fd = new FormData()
      fd.set('topic', topic.trim())
      fd.set('categoryId', categoryId)
      fd.set('count', String(count))
      fd.set('difficulty', difficulty)
      fd.set('format', format)

      const result = await generateQuizWithAi(fd)

      if (result.ok) {
        addToast('Quiz generated! Review and edit it below.', 'success')
        onClose()
        router.push(`/studio/quiz/${result.quizId}/edit`)
      } else {
        addToast(result.message, 'error')
      }
    } catch {
      addToast('Something went wrong. Please try again.', 'error')
    } finally {
      setGenerating(false)
    }
  }

  const formatLabel = FORMATS.find((f) => f.value === format)?.label ?? format

  return (
    <Modal open={open} onClose={onClose} title="Generate Quiz with AI" size="md">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="ai-topic" className="text-sm font-medium">
            Topic
          </label>
          <textarea
            id="ai-topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder='e.g., "World War II", "JavaScript basics", "Space exploration", "Famous painters"'
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label htmlFor="ai-category" className="text-sm font-medium">
              Category
            </label>
            <select
              id="ai-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="ai-format" className="text-sm font-medium">
              Format
            </label>
            <select
              id="ai-format"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {FORMATS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label htmlFor="ai-count" className="text-sm font-medium">
              Questions
            </label>
            <select
              id="ai-count"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {COUNTS.map((n) => (
                <option key={n} value={n}>
                  {n} questions
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <span className="text-sm font-medium">Difficulty</span>
            <div className="flex gap-1">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setDifficulty(d.value)}
                  className={`flex-1 rounded-md border px-2 py-2 text-xs font-semibold transition-colors ${
                    difficulty === d.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-400">
          <strong>Review before publishing:</strong> The AI will generate a{' '}
          <strong>{formatLabel}</strong> quiz with title, description, and {count} questions. For
          image-based formats, image fields will be left empty for you to fill in later. Please
          review all questions and answers for accuracy before publishing — AI-generated content may
          contain errors.
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={onClose} disabled={generating}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={generating || !topic.trim() || !categoryId}>
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {generating ? 'Generating...' : 'Generate Quiz'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
