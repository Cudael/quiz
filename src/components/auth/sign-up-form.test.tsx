import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { pushMock, refreshMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  refreshMock: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
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

  it('redirects to email verification instead of signing the new user in', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true, emailSent: true }), { status: 201 })
    )
    render(<SignUpForm callbackUrl="/profile" googleEnabled={false} githubEnabled={false} />)

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Player One' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'player@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password1!' } })
    fireEvent.change(screen.getByLabelText('Confirm password'), {
      target: { value: 'Password1!' },
    })
    fireEvent.submit(screen.getByRole('button', { name: 'Create account' }).closest('form')!)

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/verify-email?email=player%40example.com')
    })
  })
})
