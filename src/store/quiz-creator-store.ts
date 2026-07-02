import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DraftChoice {
  localId: string
  text: string
  imageUrl: string
  isCorrect: boolean
  meta?: Record<string, unknown>
}

export interface HotspotZone {
  id: string
  name: string
  x: number
  y: number
  radius: number
}

export type QuestionType =
  | 'SINGLE'
  | 'HOTSPOT'
  | 'ORDER'
  | 'MATCH'
  | 'NUMBER_GUESS'
  | 'GROUPS'
  | 'FILL_BLANK'
export type QuizFormat =
  | 'TEXT_CHOICE'
  | 'IMAGE_CHOICE'
  | 'IMAGE_HOTSPOT'
  | 'ORDER'
  | 'MATCH'
  | 'ODD_ONE_OUT'
  | 'TYPE_ANSWER'
  | 'NUMBER_GUESS'
  | 'IMAGE_REVEAL'
  | 'AUDIO_CHOICE'
  | 'VERSUS'
  | 'CONNECTIONS'
  | 'ANAGRAM'
  | 'MEMORY_FLASH'
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD'

export interface DraftQuestion {
  localId: string
  dbId: string | null
  type: QuestionType
  prompt: string
  imageUrl: string
  explanation: string
  timeLimitSec: number
  choices: DraftChoice[]
  meta?: Record<string, unknown>
}

export interface QuizCreatorState {
  quizId: string | null
  title: string
  description: string
  categoryId: string
  difficulty: Difficulty
  imageUrl: string
  sharedImageUrl: string
  defaultTimeLimitSec: number | null
  isPublished: boolean
  questions: DraftQuestion[]
  currentStep: 1 | 2 | 3 | 4
  selectedTemplateId: string | null
  quizFormat: QuizFormat
  saving: boolean
  lastSavedAt: Date | null
}

export interface QuizCreatorActions {
  setMeta: (
    meta: Partial<
      Pick<
        QuizCreatorState,
        | 'title'
        | 'description'
        | 'categoryId'
        | 'difficulty'
        | 'imageUrl'
        | 'sharedImageUrl'
        | 'defaultTimeLimitSec'
        | 'isPublished'
        | 'quizFormat'
      >
    >
  ) => void
  setQuizId: (quizId: string) => void
  setQuestions: (questions: DraftQuestion[]) => void
  addQuestion: (question: DraftQuestion) => void
  updateQuestion: (localId: string, updates: Partial<DraftQuestion>) => void
  removeQuestion: (localId: string) => void
  reorderQuestions: (from: number, to: number) => void
  setStep: (step: 1 | 2 | 3 | 4) => void
  setQuizFormat: (format: QuizFormat) => void
  setSharedImageUrl: (url: string) => void
  applyTemplate: (
    id: string,
    format: QuizFormat,
    questions: DraftQuestion[],
    options?: { replaceQuestions?: boolean }
  ) => void
  setSaving: (saving: boolean) => void
  setLastSaved: (at: Date) => void
  reset: () => void
}

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const initialState: QuizCreatorState = {
  quizId: null,
  title: '',
  description: '',
  categoryId: '',
  difficulty: 'MEDIUM',
  imageUrl: '',
  sharedImageUrl: '',
  defaultTimeLimitSec: null,
  isPublished: false,
  questions: [],
  currentStep: 1,
  selectedTemplateId: null,
  quizFormat: 'TEXT_CHOICE',
  saving: false,
  lastSavedAt: null,
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

const PERSIST_KEY = 'quiz-creator-draft'

export const useQuizCreatorStore = create<QuizCreatorState & QuizCreatorActions>()(
  persist(
    (set) => ({
      ...initialState,

      setMeta: (meta) => set((state) => ({ ...state, ...meta })),

      setQuizId: (quizId) => set({ quizId }),

      setQuestions: (questions) => set({ questions }),

      addQuestion: (question) => set((state) => ({ questions: [...state.questions, question] })),

      updateQuestion: (localId, updates) =>
        set((state) => ({
          questions: state.questions.map((q) => (q.localId === localId ? { ...q, ...updates } : q)),
        })),

      removeQuestion: (localId) =>
        set((state) => ({
          questions: state.questions.filter((q) => q.localId !== localId),
        })),

      reorderQuestions: (from, to) =>
        set((state) => {
          const questions = [...state.questions]
          const [moved] = questions.splice(from, 1)
          questions.splice(to, 0, moved)
          return { questions }
        }),

      setStep: (step) => set({ currentStep: step }),

      setQuizFormat: (format) => set({ quizFormat: format }),

      setSharedImageUrl: (url) => set({ sharedImageUrl: url }),

      applyTemplate: (id, format, questions, options) =>
        set((state) => {
          const replaceQuestions = options?.replaceQuestions ?? state.questions.length === 0
          return {
            selectedTemplateId: id,
            quizFormat: format,
            questions: replaceQuestions ? questions : state.questions,
          }
        }),

      setSaving: (saving) => set({ saving }),

      setLastSaved: (at) => set({ lastSavedAt: at }),

      reset: () => {
        set(initialState)
        useQuizCreatorStore.persist.clearStorage()
      },
    }),
    {
      name: PERSIST_KEY,
      partialize: (state) => ({
        quizId: state.quizId,
        title: state.title,
        description: state.description,
        categoryId: state.categoryId,
        difficulty: state.difficulty,
        imageUrl: state.imageUrl,
        sharedImageUrl: state.sharedImageUrl,
        defaultTimeLimitSec: state.defaultTimeLimitSec,
        isPublished: state.isPublished,
        questions: state.questions,
        currentStep: state.currentStep,
        selectedTemplateId: state.selectedTemplateId,
        quizFormat: state.quizFormat,
      }),
    }
  )
)
