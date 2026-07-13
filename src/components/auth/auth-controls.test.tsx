import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { useSessionMock, signOutActionMock, pushMock, useThemeMock } = vi.hoisted(() => ({
  useSessionMock: vi.fn(),
  signOutActionMock: vi.fn(),
  pushMock: vi.fn(),
  useThemeMock: vi.fn(),
}))

vi.mock('next-auth/react', () => ({
  useSession: useSessionMock,
}))

vi.mock('@/components/auth/sign-out-action', () => ({
  signOutAction: signOutActionMock,
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

vi.mock('@/components/theme/theme-provider', () => ({
  useTheme: useThemeMock,
}))

import { AuthControls } from '@/components/auth/auth-controls'

describe('AuthControls', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useThemeMock.mockReturnValue({ theme: 'system', setTheme: vi.fn() })
  })

  it('shows exactly one sign in button when signed out', () => {
    useSessionMock.mockReturnValue({ status: 'unauthenticated', data: null })

    render(<AuthControls />)

    expect(screen.getAllByRole('link', { name: 'Sign in' })).toHaveLength(1)
    expect(screen.queryByText('Sign up')).not.toBeInTheDocument()
  })

  it('opens and closes dropdown, and navigates from menu items', async () => {
    useSessionMock.mockReturnValue({
      status: 'authenticated',
      data: {
        user: {
          name: 'Player One',
          username: 'player-one',
          image: null,
          role: 'USER',
          level: 4,
          streakDays: 2,
          xp: 280,
        },
      },
    })

    render(<AuthControls />)

    const trigger = screen.getByRole('button', { name: 'Open profile menu' })
    fireEvent.pointerDown(trigger)

    expect(await screen.findByRole('menuitem', { name: /Profile/ })).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => {
      expect(screen.queryByRole('menuitem', { name: /Profile/ })).not.toBeInTheDocument()
    })

    fireEvent.pointerDown(trigger)
    expect(await screen.findByRole('menuitem', { name: /Settings/ })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('menuitem', { name: 'Settings' }))
    expect(pushMock).toHaveBeenCalledWith('/profile/settings')

    fireEvent.pointerDown(trigger)
    expect(await screen.findByRole('menuitem', { name: /Studio/ })).toBeInTheDocument()
    fireEvent.pointerDown(document.body)
    await waitFor(() => {
      expect(screen.queryByRole('menuitem', { name: /Studio/ })).not.toBeInTheDocument()
    })
  })

  it('submits logout once from the profile menu', async () => {
    useSessionMock.mockReturnValue({
      status: 'authenticated',
      data: {
        user: {
          name: 'Player One',
          username: 'player-one',
          image: null,
          role: 'USER',
          level: 4,
          streakDays: 2,
          xp: 280,
        },
      },
    })

    render(<AuthControls />)
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Open profile menu' }))
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Sign out' }))

    await waitFor(() => {
      expect(signOutActionMock).toHaveBeenCalledOnce()
    })
  })
})
