'use client'

import * as React from 'react'
import { PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { QuestionCard, makeDefaultChoices } from './question-card'
import { useQuizCreatorStore } from '@/store/quiz-creator-store'
import type { QuestionType } from '@/store/quiz-creator-store'

interface StepQuestionsProps {
  quizId: string
}

const QUESTION_TYPES: Array<{ type: QuestionType; label: string }> = [
  { type: 'SINGLE', label: 'Single choice' },
  { type: 'MULTIPLE', label: 'Multiple choice' },
  { type: 'TRUEFALSE', label: 'True / False' },
  { type: 'FILL_BLANK', label: 'Fill in the blank' },
]

export function StepQuestions({ quizId }: StepQuestionsProps) {
  const { questions, addQuestion, updateQuestion, removeQuestion, reorderQuestions } =
    useQuizCreatorStore()

  const [reorderMode, setReorderMode] = React.useState(false)
  const [showDropdown, setShowDropdown] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  const [dragFrom, setDragFrom] = React.useState<number | null>(null)
  const [dragOver, setDragOver] = React.useState<number | null>(null)

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleAddQuestion = (type: QuestionType) => {
    addQuestion({
      localId: crypto.randomUUID(),
      dbId: null,
      type,
      prompt: '',
      imageUrl: '',
      explanation: '',
      timeLimitSec: 20,
      choices: makeDefaultChoices(type),
    })
    setShowDropdown(false)
  }

  const handleDragStart = (index: number) => {
    setDragFrom(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOver(index)
  }

  const handleDrop = (index: number) => {
    if (dragFrom !== null && dragFrom !== index) {
      reorderQuestions(dragFrom, index)
    }
    setDragFrom(null)
    setDragOver(null)
  }

  const handleDragEnd = () => {
    setDragFrom(null)
    setDragOver(null)
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative" ref={dropdownRef}>
          <Button type="button" size="sm" onClick={() => setShowDropdown((v) => !v)}>
            <PlusCircle className="h-4 w-4" />
            Add question
          </Button>
          {showDropdown && (
            <div className="absolute left-0 top-full z-10 mt-1 w-52 rounded-lg border bg-card p-1 shadow-md">
              {QUESTION_TYPES.map(({ type, label }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleAddQuestion(type)}
                  className="w-full rounded px-3 py-2 text-left text-sm hover:bg-accent"
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        <Badge variant="secondary">
          {questions.length} question{questions.length !== 1 ? 's' : ''}
        </Badge>

        <Button
          type="button"
          variant={reorderMode ? 'default' : 'outline'}
          size="sm"
          className="ml-auto"
          onClick={() => setReorderMode((v) => !v)}
        >
          {reorderMode ? 'Done reordering' : 'Reorder'}
        </Button>
      </div>

      {/* Question list */}
      {questions.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-12 text-center">
          <PlusCircle className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No questions yet. Add your first question above.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((question, index) => (
            <div
              key={question.localId}
              draggable={reorderMode}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={() => handleDrop(index)}
              onDragEnd={handleDragEnd}
              className={dragOver === index ? 'opacity-50' : ''}
            >
              <QuestionCard
                question={question}
                index={index}
                quizId={quizId}
                reorderMode={reorderMode}
                onUpdate={(updates) => updateQuestion(question.localId, updates)}
                onRemove={() => removeQuestion(question.localId)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
