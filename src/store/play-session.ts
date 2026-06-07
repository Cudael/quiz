import { create } from 'zustand'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AnswerRecord {
  choiceIds: string[]
  timeTakenMs: number
  textAnswer?: string
}

export type PlayStatus = 'idle' | 'playing' | 'submitting' | 'done'

export interface PlaySessionState {
  quizId: string | null
  currentQuestionIndex: number
  answers: Record<string, AnswerRecord>
  score: number
  streak: number
  status: PlayStatus
}

export interface PlaySessionActions {
  start: (quizId: string) => void
  answer: (
    questionId: string,
    choiceIds: string[],
    timeTakenMs: number,
    textAnswer?: string
  ) => void
  addScore: (points: number) => void
  incrementStreak: () => void
  resetStreak: () => void
  nextQuestion: () => void
  setStatus: (status: PlayStatus) => void
  finish: () => void
  reset: () => void
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

const initialState: PlaySessionState = {
  quizId: null,
  currentQuestionIndex: 0,
  answers: {},
  score: 0,
  streak: 0,
  status: 'idle',
}

export const usePlaySessionStore = create<PlaySessionState & PlaySessionActions>((set) => ({
  ...initialState,

  start: (quizId) =>
    set({
      ...initialState,
      quizId,
      status: 'playing',
    }),

  answer: (questionId, choiceIds, timeTakenMs, textAnswer) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: { choiceIds, timeTakenMs, textAnswer } },
    })),

  addScore: (points) => set((state) => ({ score: state.score + points })),

  incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),

  resetStreak: () => set({ streak: 0 }),

  nextQuestion: () =>
    set((state) => ({
      currentQuestionIndex: state.currentQuestionIndex + 1,
    })),

  setStatus: (status) => set({ status }),

  finish: () => set({ status: 'done' }),

  reset: () => set(initialState),
}))
