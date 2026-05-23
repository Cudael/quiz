import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PlayView } from '@/app/play/[id]/play-view'
import { usePlaySessionStore } from '@/store/play-session'

const { pushMock, addToastMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  addToastMock: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => ({ get: (key: string) => (key === 'mode' ? 'classic' : null) }),
}))

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    ...props
  }: {
    src: string
    alt: string
    loader?: unknown
    unoptimized?: boolean
    [key: string]: unknown
  }) => {
    const passthroughProps = { ...props }
    delete passthroughProps.loader
    delete passthroughProps.unoptimized
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...passthroughProps} />
  },
}))

vi.mock('framer-motion', () => {
  const MotionDiv = ({ children, ...props }: { children: ReactNode; [key: string]: unknown }) => {
    const passthroughProps = { ...props }
    delete passthroughProps.initial
    delete passthroughProps.animate
    delete passthroughProps.exit
    delete passthroughProps.transition
    return <div {...passthroughProps}>{children}</div>
  }

  return {
    motion: { div: MotionDiv },
    AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
    useReducedMotion: () => true,
  }
})

vi.mock('@/components/ui/toast', () => ({
  useToast: () => ({ addToast: addToastMock }),
}))

function createFetchResponse(body: unknown, ok = true) {
  return {
    ok,
    json: vi.fn().mockResolvedValue(body),
  }
}

describe('PlayView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    usePlaySessionStore.getState().reset()
  })

  it('renders question images and persists the sound toggle preference', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      createFetchResponse({
        quiz: {
          id: 'quiz-1',
          title: 'Planets',
          difficulty: 'MEDIUM',
          category: { name: 'Science', slug: 'science' },
        },
        questions: [
          {
            id: 'question-1',
            type: 'SINGLE',
            prompt: 'Which planet is closest to the sun?',
            imageUrl: 'https://cdn.example.com/mercury.png',
            timeLimitSec: 20,
            order: 1,
            choices: [
              { id: 'choice-1', text: 'Venus' },
              { id: 'choice-2', text: 'Mercury' },
            ],
          },
        ],
        playToken: 'play-token',
      })
    )
    vi.stubGlobal('fetch', fetchMock)

    const { unmount } = render(<PlayView quizId="quiz-1" />)

    expect(
      await screen.findByRole('img', {
        name: /question illustration: which planet is closest to the sun\?/i,
      })
    ).toHaveAttribute('src', 'https://cdn.example.com/mercury.png')

    fireEvent.click(screen.getByRole('button', { name: /mute sound/i }))
    expect(localStorage.getItem('quiz-sound-enabled')).toBe('false')

    unmount()

    fetchMock.mockResolvedValueOnce(
      createFetchResponse({
        quiz: {
          id: 'quiz-1',
          title: 'Planets',
          difficulty: 'MEDIUM',
          category: { name: 'Science', slug: 'science' },
        },
        questions: [
          {
            id: 'question-1',
            type: 'SINGLE',
            prompt: 'Which planet is closest to the sun?',
            imageUrl: 'https://cdn.example.com/mercury.png',
            timeLimitSec: 20,
            order: 1,
            choices: [
              { id: 'choice-1', text: 'Venus' },
              { id: 'choice-2', text: 'Mercury' },
            ],
          },
        ],
        playToken: 'play-token',
      })
    )

    render(<PlayView quizId="quiz-1" />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /unmute sound/i })).toBeInTheDocument()
    })
  })

  it('supports fill-in-the-blank answers and submits the matched choice id', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        createFetchResponse({
          quiz: {
            id: 'quiz-1',
            title: 'Capitals',
            difficulty: 'EASY',
            category: { name: 'Geography', slug: 'geography' },
          },
          questions: [
            {
              id: 'question-1',
              type: 'FILL_BLANK',
              prompt: 'The capital of France is {{blank}}.',
              imageUrl: null,
              timeLimitSec: 20,
              order: 1,
              choices: [{ id: 'choice-1', text: 'Paris' }],
            },
          ],
          playToken: 'play-token',
        })
      )
      .mockResolvedValueOnce(
        createFetchResponse({
          sessionId: 'session-1',
          xpEarned: 12,
          leveledUp: false,
          newLevel: 1,
          newlyAwardedBadges: [],
        })
      )
    vi.stubGlobal('fetch', fetchMock)

    render(<PlayView quizId="quiz-1" />)

    expect(await screen.findByText('The capital of France is _____.')).toBeInTheDocument()

    const input = screen.getByLabelText(/your answer/i)
    fireEvent.change(input, { target: { value: ' paris ' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    const finishButton = await screen.findByRole('button', { name: /finish/i })
    fireEvent.click(finishButton)

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    const submitOptions = fetchMock.mock.calls[1][1] as RequestInit
    const submitBody = JSON.parse(String(submitOptions.body))

    expect(submitBody.answers).toEqual([
      expect.objectContaining({
        questionId: 'question-1',
        choiceIds: ['choice-1'],
        textAnswer: ' paris ',
      }),
    ])
    expect(pushMock).toHaveBeenCalledWith(
      expect.stringContaining('/play/quiz-1/results?session=session-1')
    )
  })

  it('supports numeric keyboard shortcuts for answer selection and submission', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        createFetchResponse({
          quiz: {
            id: 'quiz-1',
            title: 'Planets',
            difficulty: 'MEDIUM',
            category: { name: 'Science', slug: 'science' },
          },
          questions: [
            {
              id: 'question-1',
              type: 'SINGLE',
              prompt: 'Which planet is closest to the sun?',
              imageUrl: null,
              timeLimitSec: 20,
              order: 1,
              choices: [
                { id: 'choice-1', text: 'Venus' },
                { id: 'choice-2', text: 'Mercury' },
              ],
            },
          ],
          playToken: 'play-token',
        })
      )
      .mockResolvedValueOnce(
        createFetchResponse({
          sessionId: 'session-2',
          xpEarned: 20,
          leveledUp: false,
          newLevel: 1,
          newlyAwardedBadges: [],
        })
      )
    vi.stubGlobal('fetch', fetchMock)

    render(<PlayView quizId="quiz-1" />)

    const mercuryChoice = await screen.findByRole('button', { name: /choice 2: mercury/i })
    fireEvent.keyDown(window, { key: '2' })

    await waitFor(() => {
      expect(mercuryChoice).toHaveAttribute('aria-pressed', 'true')
    })

    fireEvent.keyDown(window, { key: 'Enter' })

    const finishButton = await screen.findByRole('button', { name: /finish/i })
    fireEvent.click(finishButton)

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    const submitOptions = fetchMock.mock.calls[1][1] as RequestInit
    const submitBody = JSON.parse(String(submitOptions.body))
    expect(submitBody.answers[0].choiceIds).toEqual(['choice-2'])
  })
})
