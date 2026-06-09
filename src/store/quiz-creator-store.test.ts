import { beforeEach, describe, expect, it } from 'vitest'
import { useQuizCreatorStore } from '@/store/quiz-creator-store'
import type { DraftQuestion } from '@/store/quiz-creator-store'

function makeQuestion(localId: string): DraftQuestion {
  return {
    localId,
    dbId: null,
    type: 'SINGLE',
    prompt: `Question ${localId}`,
    imageUrl: '',
    explanation: '',
    timeLimitSec: 30,
    choices: [{ localId: `c-${localId}`, text: 'Answer', imageUrl: '', isCorrect: true }],
  }
}

beforeEach(() => {
  // Reset store to initial state by re-applying initial values through setMeta + setQuestions
  const store = useQuizCreatorStore.getState()
  store.setMeta({
    title: '',
    description: '',
    categoryId: '',
    difficulty: 'MEDIUM',
    imageUrl: '',
    defaultTimeLimitSec: null,
    quizFormat: 'TEXT_CHOICE',
    isPublished: false,
  })
  store.setQuestions([])
  store.setStep(1)
  store.setSaving(false)
})

describe('initial state', () => {
  it('starts with empty title and no questions', () => {
    const state = useQuizCreatorStore.getState()
    expect(state.title).toBe('')
    expect(state.questions).toHaveLength(0)
    expect(state.currentStep).toBe(1)
    expect(state.saving).toBe(false)
    expect(state.quizId).toBeNull()
    expect(state.quizFormat).toBe('TEXT_CHOICE')
  })
})

describe('setMeta', () => {
  it('updates title and description', () => {
    useQuizCreatorStore.getState().setMeta({ title: 'My Quiz', description: 'A fun quiz' })
    const state = useQuizCreatorStore.getState()
    expect(state.title).toBe('My Quiz')
    expect(state.description).toBe('A fun quiz')
  })

  it('updates difficulty', () => {
    useQuizCreatorStore.getState().setMeta({ difficulty: 'HARD' })
    expect(useQuizCreatorStore.getState().difficulty).toBe('HARD')
  })

  it('does not overwrite unrelated fields', () => {
    useQuizCreatorStore.getState().setMeta({ title: 'New Title' })
    expect(useQuizCreatorStore.getState().description).toBe('')
  })
})

describe('setQuizId', () => {
  it('sets the quiz id', () => {
    useQuizCreatorStore.getState().setQuizId('quiz-abc')
    expect(useQuizCreatorStore.getState().quizId).toBe('quiz-abc')
  })
})

describe('addQuestion / removeQuestion / updateQuestion', () => {
  it('addQuestion appends a question', () => {
    const q = makeQuestion('q1')
    useQuizCreatorStore.getState().addQuestion(q)
    expect(useQuizCreatorStore.getState().questions).toHaveLength(1)
    expect(useQuizCreatorStore.getState().questions[0].localId).toBe('q1')
  })

  it('removeQuestion removes by localId', () => {
    useQuizCreatorStore.getState().addQuestion(makeQuestion('q1'))
    useQuizCreatorStore.getState().addQuestion(makeQuestion('q2'))
    useQuizCreatorStore.getState().removeQuestion('q1')
    const questions = useQuizCreatorStore.getState().questions
    expect(questions).toHaveLength(1)
    expect(questions[0].localId).toBe('q2')
  })

  it('updateQuestion updates matching question', () => {
    useQuizCreatorStore.getState().addQuestion(makeQuestion('q1'))
    useQuizCreatorStore.getState().updateQuestion('q1', { prompt: 'Updated prompt' })
    expect(useQuizCreatorStore.getState().questions[0].prompt).toBe('Updated prompt')
  })

  it('updateQuestion leaves other questions unchanged', () => {
    useQuizCreatorStore.getState().addQuestion(makeQuestion('q1'))
    useQuizCreatorStore.getState().addQuestion(makeQuestion('q2'))
    useQuizCreatorStore.getState().updateQuestion('q1', { prompt: 'Changed' })
    expect(useQuizCreatorStore.getState().questions[1].prompt).toBe('Question q2')
  })
})

describe('reorderQuestions', () => {
  it('moves question from one index to another', () => {
    useQuizCreatorStore.getState().addQuestion(makeQuestion('q1'))
    useQuizCreatorStore.getState().addQuestion(makeQuestion('q2'))
    useQuizCreatorStore.getState().addQuestion(makeQuestion('q3'))
    useQuizCreatorStore.getState().reorderQuestions(0, 2)
    const ids = useQuizCreatorStore.getState().questions.map((q) => q.localId)
    expect(ids).toEqual(['q2', 'q3', 'q1'])
  })
})

describe('setStep', () => {
  it('updates currentStep', () => {
    useQuizCreatorStore.getState().setStep(3)
    expect(useQuizCreatorStore.getState().currentStep).toBe(3)
  })
})

describe('setQuizFormat', () => {
  it('updates quiz format', () => {
    useQuizCreatorStore.getState().setQuizFormat('IMAGE_CHOICE')
    expect(useQuizCreatorStore.getState().quizFormat).toBe('IMAGE_CHOICE')
  })
})

describe('applyTemplate', () => {
  it('sets selectedTemplateId, format, and replaces questions', () => {
    const questions = [makeQuestion('t1'), makeQuestion('t2')]
    useQuizCreatorStore.getState().applyTemplate('tmpl-1', 'IMAGE_CHOICE', questions)
    const state = useQuizCreatorStore.getState()
    expect(state.selectedTemplateId).toBe('tmpl-1')
    expect(state.quizFormat).toBe('IMAGE_CHOICE')
    expect(state.questions).toHaveLength(2)
    expect(state.questions[0].localId).toBe('t1')
  })
})

describe('setSaving / setLastSaved', () => {
  it('setSaving toggles saving flag', () => {
    useQuizCreatorStore.getState().setSaving(true)
    expect(useQuizCreatorStore.getState().saving).toBe(true)
    useQuizCreatorStore.getState().setSaving(false)
    expect(useQuizCreatorStore.getState().saving).toBe(false)
  })

  it('setLastSaved records the date', () => {
    const now = new Date()
    useQuizCreatorStore.getState().setLastSaved(now)
    expect(useQuizCreatorStore.getState().lastSavedAt).toBe(now)
  })
})
