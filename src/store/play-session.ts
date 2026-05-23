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

export type PlayMode = 'classic' | 'timed' | 'survival' | 'daily'

export interface Lifelines {
  fiftyFifty: boolean
  skip: boolean
  extraTime: boolean
}

export interface PlaySessionState {
  quizId: string | null
  mode: PlayMode
  currentQuestionIndex: number
  answers: Record<string, AnswerRecord>
  score: number
  streak: number
  lifelinesUsed: Lifelines
  status: PlayStatus
  /** Survival: set of question IDs already seen (for /api/survival next) */
  seenQuestionIds: string[]
  /** Timed mode: global ms remaining */
  globalTimerMs: number | null
  /** Extra time bonus applied to current question */
  extraTimeSec: number
}

export interface PlaySessionActions {
  start: (quizId: string, mode: PlayMode) => void
  answer: (
    questionId: string,
    choiceIds: string[],
    timeTakenMs: number,
    textAnswer?: string
  ) => void
  addScore: (points: number) => void
  incrementStreak: () => void
  resetStreak: () => void
  useLifeline: (lifeline: keyof Lifelines) => void
  nextQuestion: () => void
  setGlobalTimer: (ms: number) => void
  tickGlobalTimer: (deltaMs: number) => void
  addExtraTime: (sec: number) => void
  clearExtraTime: () => void
  markSeen: (questionId: string) => void
  setStatus: (status: PlayStatus) => void
  finish: () => void
  reset: () => void
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

const initialState: PlaySessionState = {
  quizId: null,
  mode: 'classic',
  currentQuestionIndex: 0,
  answers: {},
  score: 0,
  streak: 0,
  lifelinesUsed: { fiftyFifty: false, skip: false, extraTime: false },
  status: 'idle',
  seenQuestionIds: [],
  globalTimerMs: null,
  extraTimeSec: 0,
}

export const usePlaySessionStore = create<PlaySessionState & PlaySessionActions>((set) => ({
  ...initialState,

  start: (quizId, mode) =>
    set({
      ...initialState,
      quizId,
      mode,
      status: 'playing',
      globalTimerMs: mode === 'timed' ? 60_000 : null,
    }),

  answer: (questionId, choiceIds, timeTakenMs, textAnswer) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: { choiceIds, timeTakenMs, textAnswer } },
    })),

  addScore: (points) => set((state) => ({ score: state.score + points })),

  incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),

  resetStreak: () => set({ streak: 0 }),

  useLifeline: (lifeline) =>
    set((state) => ({
      lifelinesUsed: { ...state.lifelinesUsed, [lifeline]: true },
    })),

  nextQuestion: () =>
    set((state) => ({
      currentQuestionIndex: state.currentQuestionIndex + 1,
      extraTimeSec: 0,
    })),

  setGlobalTimer: (ms) => set({ globalTimerMs: ms }),

  tickGlobalTimer: (deltaMs) =>
    set((state) => ({
      globalTimerMs:
        state.globalTimerMs !== null ? Math.max(0, state.globalTimerMs - deltaMs) : null,
    })),

  addExtraTime: (sec) => set((state) => ({ extraTimeSec: state.extraTimeSec + sec })),

  clearExtraTime: () => set({ extraTimeSec: 0 }),

  markSeen: (questionId) =>
    set((state) => ({
      seenQuestionIds: [...state.seenQuestionIds, questionId],
    })),

  setStatus: (status) => set({ status }),

  finish: () => set({ status: 'done' }),

  reset: () => set(initialState),
}))
