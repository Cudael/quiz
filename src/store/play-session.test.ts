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
  })
})

describe('start', () => {
  it('sets quizId and status to playing', () => {
    usePlaySessionStore.getState().start('quiz-1')
    const state = usePlaySessionStore.getState()
    expect(state.quizId).toBe('quiz-1')
    expect(state.status).toBe('playing')
  })

  it('resets score and streak when starting fresh', () => {
    usePlaySessionStore.getState().addScore(50)
    usePlaySessionStore.getState().incrementStreak()
    usePlaySessionStore.getState().start('quiz-2')
    const state = usePlaySessionStore.getState()
    expect(state.score).toBe(0)
    expect(state.streak).toBe(0)
  })
})

describe('answer', () => {
  it('stores an answer record', () => {
    usePlaySessionStore.getState().answer('q1', ['c1'], 1500)
    const answers = usePlaySessionStore.getState().answers
    expect(answers['q1']).toEqual({ choiceIds: ['c1'], timeTakenMs: 1500 })
  })

  it('stores textAnswer when provided', () => {
    usePlaySessionStore.getState().answer('q2', [], 800, { textAnswer: 'Paris' })
    expect(usePlaySessionStore.getState().answers['q2'].textAnswer).toBe('Paris')
  })

  it('stores format-specific extras when provided', () => {
    usePlaySessionStore.getState().answer('q3', [], 900, {
      numberAnswer: 42,
      pairs: [{ leftId: 'l1', rightId: 'r1' }],
      groups: [['a', 'b']],
    })
    const record = usePlaySessionStore.getState().answers['q3']
    expect(record.numberAnswer).toBe(42)
    expect(record.pairs).toEqual([{ leftId: 'l1', rightId: 'r1' }])
    expect(record.groups).toEqual([['a', 'b']])
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

describe('nextQuestion', () => {
  it('increments currentQuestionIndex', () => {
    usePlaySessionStore.getState().nextQuestion()
    const state = usePlaySessionStore.getState()
    expect(state.currentQuestionIndex).toBe(1)
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
    usePlaySessionStore.getState().start('quiz-1')
    usePlaySessionStore.getState().addScore(100)
    usePlaySessionStore.getState().incrementStreak()
    usePlaySessionStore.getState().reset()

    const state = usePlaySessionStore.getState()
    expect(state.quizId).toBeNull()
    expect(state.score).toBe(0)
    expect(state.streak).toBe(0)
    expect(state.status).toBe('idle')
    expect(state.currentQuestionIndex).toBe(0)
    expect(state.answers).toEqual({})
  })
})
