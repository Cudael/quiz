import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { useSessionMock, updateMock } = vi.hoisted(() => ({
  useSessionMock: vi.fn(),
  updateMock: vi.fn(),
}))

vi.mock('next-auth/react', () => ({
  useSession: useSessionMock,
}))

import { UsernameOnboarding } from './username-onboarding'

function authenticatedSession(username: string | null) {
  useSessionMock.mockReturnValue({
    status: 'authenticated',
    data: { user: { id: 'user-1', username } },
    update: updateMock,
  })
}

describe('UsernameOnboarding', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    updateMock.mockClear()
  })

  it('prompts an authenticated user without a username', async () => {
    authenticatedSession(null)

    render(<UsernameOnboarding />)

    expect(await screen.findByText('Choose your username')).toBeInTheDocument()
  })

  it('stays hidden when the user already has a username', () => {
    authenticatedSession('quiz-fan')

    render(<UsernameOnboarding />)

    expect(screen.queryByText('Choose your username')).not.toBeInTheDocument()
  })

  it('stays hidden for signed-out visitors', () => {
    useSessionMock.mockReturnValue({ status: 'unauthenticated', data: null, update: updateMock })

    render(<UsernameOnboarding />)

    expect(screen.queryByText('Choose your username')).not.toBeInTheDocument()
  })

  it('saves the username and refreshes the session', async () => {
    authenticatedSession(null)
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }))

    render(<UsernameOnboarding />)

    fireEvent.change(await screen.findByLabelText('Username'), {
      target: { value: 'quiz-fan' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save username' }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/profile/username', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username: 'quiz-fan' }),
      })
    })
    await waitFor(() => {
      expect(updateMock).toHaveBeenCalledOnce()
    })
  })

  it('shows a taken-username error', async () => {
    authenticatedSession(null)
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: 'That username is already taken.' }), { status: 400 })
    )

    render(<UsernameOnboarding />)

    fireEvent.change(await screen.findByLabelText('Username'), {
      target: { value: 'quiz-fan' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save username' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('That username is already taken.')
    expect(updateMock).not.toHaveBeenCalled()
  })

  it('cannot be dismissed before a username is chosen', async () => {
    authenticatedSession(null)

    render(<UsernameOnboarding />)

    expect(await screen.findByText('Choose your username')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Close modal' })).not.toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(screen.getByText('Choose your username')).toBeInTheDocument()
  })
})
