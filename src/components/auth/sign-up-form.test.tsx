import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { pushMock, refreshMock, signInMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  refreshMock: vi.fn(),
  signInMock: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
}))

vi.mock('next-auth/react', () => ({
  signIn: signInMock,
}))

import { SignUpForm } from '@/components/auth/sign-up-form'

describe('SignUpForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  it('uses create account title', () => {
    render(<SignUpForm callbackUrl="/profile" googleEnabled={false} githubEnabled={false} />)

    expect(screen.getByRole('heading', { name: 'Create account' })).toBeInTheDocument()
  })

  it('shows oauth divider only when oauth is enabled', () => {
    const { rerender } = render(
      <SignUpForm callbackUrl="/profile" googleEnabled={true} githubEnabled={false} />
    )

    expect(screen.getByText('or')).toBeInTheDocument()

    rerender(<SignUpForm callbackUrl="/profile" googleEnabled={false} githubEnabled={false} />)
    expect(screen.queryByText('or')).not.toBeInTheDocument()
  })

  it('shows the code step after registration and signs in once the code is verified', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input)
      if (url.includes('/api/auth/register')) {
        return new Response(JSON.stringify({ ok: true, emailSent: true }), { status: 201 })
      }
      return new Response(JSON.stringify({ ok: true }), { status: 200 })
    })
    signInMock.mockResolvedValue({ url: '/profile' })
    render(<SignUpForm callbackUrl="/profile" googleEnabled={false} githubEnabled={false} />)

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'player-one' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'player@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password1!' } })
    fireEvent.change(screen.getByLabelText('Confirm password'), {
      target: { value: 'Password1!' },
    })
    fireEvent.submit(screen.getByRole('button', { name: 'Create account' }).closest('form')!)

    // Registration does not create a session — the code step appears in place.
    expect(await screen.findByText('Check your inbox')).toBeInTheDocument()
    expect(signInMock).not.toHaveBeenCalled()

    // Entering the full code auto-submits it.
    fireEvent.change(screen.getByLabelText('Verification code'), { target: { value: '123456' } })

    // A correct code logs the new user in with the credentials still in memory.
    await waitFor(() => {
      expect(signInMock).toHaveBeenCalledWith('email-password', {
        email: 'player@example.com',
        password: 'Password1!',
        callbackUrl: '/profile',
        redirect: false,
      })
    })
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/profile')
    })
    expect(refreshMock).toHaveBeenCalled()
  })
})
