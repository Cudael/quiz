'use client'

import * as React from 'react'
import { addQuestion, updateQuestion } from '@/app/studio/actions/question-actions'
import { getPendingFile, uploadFileToStorage, clearPendingUpload } from './use-image-upload'
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
  const [deleteCount, setDeleteCount] = React.useState(0)
  const [saveState, setSaveState] = React.useState<'idle' | 'saving' | 'saved'>('idle')
  const [showExplanation, setShowExplanation] = React.useState(!!question.explanation)

  const handleDeleteClick = () => {
    if (deleteCount === 0) {
      setDeleteCount(1)
      setTimeout(() => setDeleteCount(0), 2000)
    } else {
      onRemove()
    }
  }

  const handleSave = async () => {
    setSaveState('saving')

    try {
      // Upload any pending (blob) images before saving
      let resolvedImageUrl = question.imageUrl
      if (resolvedImageUrl && resolvedImageUrl.startsWith('blob:')) {
        const file = getPendingFile(resolvedImageUrl)
        if (!file) {
          setSaveState('idle')
          return
        }
        try {
          resolvedImageUrl = await uploadFileToStorage(file)
          clearPendingUpload(question.imageUrl)
          onUpdate({ imageUrl: resolvedImageUrl })
        } catch {
          setSaveState('idle')
          return
        }
      }

      const resolvedChoices: Array<{
        text: string
        imageUrl?: string
        isCorrect: boolean
        meta?: Record<string, unknown>
      }> = []
      for (const c of question.choices) {
        let choiceImageUrl = c.imageUrl
        if (choiceImageUrl && choiceImageUrl.startsWith('blob:')) {
          const file = getPendingFile(choiceImageUrl)
          if (!file) {
            setSaveState('idle')
            return
          }
          try {
            choiceImageUrl = await uploadFileToStorage(file)
            clearPendingUpload(c.imageUrl)
          } catch {
            setSaveState('idle')
            return
          }
        }
        resolvedChoices.push({
          text: c.text,
          imageUrl: choiceImageUrl || undefined,
          isCorrect: c.isCorrect,
          ...(c.meta ? { meta: c.meta } : {}),
        })
      }

      const formData = new FormData()
      formData.set('quizId', quizId)
      formData.set('type', question.type)
      formData.set('prompt', question.prompt)
      formData.set('imageUrl', resolvedImageUrl)
      formData.set('explanation', question.explanation)
      formData.set('timeLimitSec', String(question.timeLimitSec))
      formData.set('order', String(index))
      formData.set('choices', JSON.stringify(resolvedChoices))

      let result
      if (question.dbId) {
        formData.set('questionId', question.dbId)
        result = await updateQuestion(formData)
      } else {
        result = await addQuestion(formData)
      }

      if (result.ok) {
        if ('questionId' in result) {
          onUpdate({ dbId: result.questionId })
        }
        setSaveState('saved')
        setTimeout(() => setSaveState('idle'), 2000)
      } else {
        setSaveState('idle')
      }
    } catch {
      setSaveState('idle')
    }
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
    deleteCount,
    saveState,
    showExplanation,
    setShowExplanation,
    handleDeleteClick,
    handleSave,
    updateChoice,
    addChoice,
    removeChoice,
    setCorrect,
  }
}
