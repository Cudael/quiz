import { create } from 'zustand'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DraftChoice {
  localId: string
  text: string
  isCorrect: boolean
}

export type QuestionType = 'SINGLE' | 'MULTIPLE' | 'TRUEFALSE' | 'FILL_BLANK'
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
}

export interface QuizCreatorState {
  quizId: string | null
  title: string
  description: string
  categoryId: string
  difficulty: Difficulty
  imageUrl: string
  defaultTimeLimitSec: number | null
  isPublished: boolean
  questions: DraftQuestion[]
  currentStep: 1 | 2 | 3 | 4
  selectedTemplateId: string | null
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
        | 'defaultTimeLimitSec'
        | 'isPublished'
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
  applyTemplate: (id: string, questions: DraftQuestion[]) => void
  setSaving: (saving: boolean) => void
  setLastSaved: (at: Date) => void
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
  defaultTimeLimitSec: null,
  isPublished: false,
  questions: [],
  currentStep: 1,
  selectedTemplateId: null,
  saving: false,
  lastSavedAt: null,
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useQuizCreatorStore = create<QuizCreatorState & QuizCreatorActions>((set) => ({
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

  applyTemplate: (id, questions) => set({ selectedTemplateId: id, questions }),

  setSaving: (saving) => set({ saving }),

  setLastSaved: (at) => set({ lastSavedAt: at }),
}))
