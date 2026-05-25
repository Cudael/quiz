import { beforeEach, describe, expect, it } from 'vitest'
import { usePlaySessionStore } from '@/store/play-session'

beforeEach(() => {
  usePlaySessionStore.getState().reset()
})

describe('usePlaySessionStore — initial state', () => {
  it('starts idle with no quizId', () => {
    const state = usePlaySessionStore.getState()
    expect(state.status).toBe('idle')
    expect(state.quizId).toBeNull()
    expect(state.score).toBe(0)
    expect(state.streak).toBe(0)
    expect(state.currentQuestionIndex).toBe(0)
    expect(state.globalTimerMs).toBeNull()
  })
})

describe('start', () => {
  it('sets quizId, mode, and status to playing', () => {
    usePlaySessionStore.getState().start('quiz-1', 'classic')
    const state = usePlaySessionStore.getState()
    expect(state.quizId).toBe('quiz-1')
    expect(state.mode).toBe('classic')
    expect(state.status).toBe('playing')
  })

  it('sets globalTimerMs for timed mode', () => {
    usePlaySessionStore.getState().start('quiz-1', 'timed')
    expect(usePlaySessionStore.getState().globalTimerMs).toBe(60_000)
  })

  it('leaves globalTimerMs null for classic mode', () => {
    usePlaySessionStore.getState().start('quiz-1', 'classic')
    expect(usePlaySessionStore.getState().globalTimerMs).toBeNull()
  })

  it('resets score and streak when starting fresh', () => {
    usePlaySessionStore.getState().addScore(50)
    usePlaySessionStore.getState().incrementStreak()
    usePlaySessionStore.getState().start('quiz-2', 'classic')
    const state = usePlaySessionStore.getState()
    expect(state.score).toBe(0)
    expect(state.streak).toBe(0)
  })
})

describe('answer', () => {
  it('stores an answer record', () => {
    usePlaySessionStore.getState().answer('q1', ['c1'], 1500)
    const answers = usePlaySessionStore.getState().answers
    expect(answers['q1']).toEqual({ choiceIds: ['c1'], timeTakenMs: 1500, textAnswer: undefined })
  })

  it('stores textAnswer when provided', () => {
    usePlaySessionStore.getState().answer('q2', [], 800, 'Paris')
    expect(usePlaySessionStore.getState().answers['q2'].textAnswer).toBe('Paris')
  })
})

describe('score and streak', () => {
  it('addScore accumulates points', () => {
    usePlaySessionStore.getState().addScore(10)
    usePlaySessionStore.getState().addScore(20)
    expect(usePlaySessionStore.getState().score).toBe(30)
  })

  it('incrementStreak increases streak', () => {
    usePlaySessionStore.getState().incrementStreak()
    usePlaySessionStore.getState().incrementStreak()
    expect(usePlaySessionStore.getState().streak).toBe(2)
  })

  it('resetStreak sets streak to 0', () => {
    usePlaySessionStore.getState().incrementStreak()
    usePlaySessionStore.getState().resetStreak()
    expect(usePlaySessionStore.getState().streak).toBe(0)
  })
})

describe('lifelines', () => {
  it('useLifeline marks the lifeline as used', () => {
    usePlaySessionStore.getState().useLifeline('fiftyFifty')
    expect(usePlaySessionStore.getState().lifelinesUsed.fiftyFifty).toBe(true)
    expect(usePlaySessionStore.getState().lifelinesUsed.skip).toBe(false)
  })
})

describe('nextQuestion', () => {
  it('increments currentQuestionIndex and clears extraTimeSec', () => {
    usePlaySessionStore.getState().addExtraTime(10)
    usePlaySessionStore.getState().nextQuestion()
    const state = usePlaySessionStore.getState()
    expect(state.currentQuestionIndex).toBe(1)
    expect(state.extraTimeSec).toBe(0)
  })
})

describe('global timer', () => {
  it('setGlobalTimer sets the timer', () => {
    usePlaySessionStore.getState().setGlobalTimer(30_000)
    expect(usePlaySessionStore.getState().globalTimerMs).toBe(30_000)
  })

  it('tickGlobalTimer decrements the timer', () => {
    usePlaySessionStore.getState().setGlobalTimer(5_000)
    usePlaySessionStore.getState().tickGlobalTimer(1_000)
    expect(usePlaySessionStore.getState().globalTimerMs).toBe(4_000)
  })

  it('tickGlobalTimer clamps to 0, not negative', () => {
    usePlaySessionStore.getState().setGlobalTimer(500)
    usePlaySessionStore.getState().tickGlobalTimer(2_000)
    expect(usePlaySessionStore.getState().globalTimerMs).toBe(0)
  })

  it('tickGlobalTimer is a no-op when timer is null', () => {
    usePlaySessionStore.getState().tickGlobalTimer(1_000)
    expect(usePlaySessionStore.getState().globalTimerMs).toBeNull()
  })
})

describe('extra time', () => {
  it('addExtraTime accumulates', () => {
    usePlaySessionStore.getState().addExtraTime(5)
    usePlaySessionStore.getState().addExtraTime(3)
    expect(usePlaySessionStore.getState().extraTimeSec).toBe(8)
  })

  it('clearExtraTime resets to 0', () => {
    usePlaySessionStore.getState().addExtraTime(5)
    usePlaySessionStore.getState().clearExtraTime()
    expect(usePlaySessionStore.getState().extraTimeSec).toBe(0)
  })
})

describe('markSeen', () => {
  it('appends question IDs to seenQuestionIds', () => {
    usePlaySessionStore.getState().markSeen('q1')
    usePlaySessionStore.getState().markSeen('q2')
    expect(usePlaySessionStore.getState().seenQuestionIds).toEqual(['q1', 'q2'])
  })
})

describe('status transitions', () => {
  it('setStatus updates status', () => {
    usePlaySessionStore.getState().setStatus('submitting')
    expect(usePlaySessionStore.getState().status).toBe('submitting')
  })

  it('finish sets status to done', () => {
    usePlaySessionStore.getState().finish()
    expect(usePlaySessionStore.getState().status).toBe('done')
  })
})

describe('reset', () => {
  it('returns all fields to initial values', () => {
    usePlaySessionStore.getState().start('quiz-1', 'timed')
    usePlaySessionStore.getState().addScore(100)
    usePlaySessionStore.getState().incrementStreak()
    usePlaySessionStore.getState().reset()

    const state = usePlaySessionStore.getState()
    expect(state.quizId).toBeNull()
    expect(state.score).toBe(0)
    expect(state.streak).toBe(0)
    expect(state.status).toBe('idle')
    expect(state.globalTimerMs).toBeNull()
    expect(state.currentQuestionIndex).toBe(0)
    expect(state.answers).toEqual({})
  })
})
