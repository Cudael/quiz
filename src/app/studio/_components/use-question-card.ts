'use client'

import * as React from 'react'
import type { DraftChoice, DraftQuestion } from '@/store/quiz-creator-store'

interface UseQuestionCardParams {
  question: DraftQuestion
  index: number
  quizId: string
  onUpdate: (updates: Partial<DraftQuestion>) => void
  onRemove: () => void
}

export function useQuestionCard({
  question,
  index,
  quizId,
  onUpdate,
  onRemove,
}: UseQuestionCardParams) {
  const [open, setOpen] = React.useState(question.dbId === null)
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false)
  const [showExplanation, setShowExplanation] = React.useState(!!question.explanation)

  const hasContent =
    question.prompt.trim() || question.choices.some((c) => c.text.trim() || c.imageUrl.trim())

  const handleDeleteClick = () => {
    if (hasContent) {
      setDeleteModalOpen(true)
    } else {
      onRemove()
    }
  }

  const handleConfirmDelete = () => {
    setDeleteModalOpen(false)
    onRemove()
  }

  const updateChoice = (localId: string, updates: Partial<DraftChoice>) => {
    onUpdate({
      choices: question.choices.map((c) => (c.localId === localId ? { ...c, ...updates } : c)),
    })
  }

  const addChoice = () => {
    onUpdate({
      choices: [
        ...question.choices,
        { localId: crypto.randomUUID(), text: '', imageUrl: '', isCorrect: false },
      ],
    })
  }

  const removeChoice = (localId: string) => {
    onUpdate({ choices: question.choices.filter((c) => c.localId !== localId) })
  }

  const setCorrect = (localId: string) => {
    onUpdate({
      choices: question.choices.map((c) => ({ ...c, isCorrect: c.localId === localId })),
    })
  }

  return {
    open,
    setOpen,
    deleteModalOpen,
    setDeleteModalOpen,
    showExplanation,
    setShowExplanation,
    handleDeleteClick,
    handleConfirmDelete,
    updateChoice,
    addChoice,
    removeChoice,
    setCorrect,
  }
}
