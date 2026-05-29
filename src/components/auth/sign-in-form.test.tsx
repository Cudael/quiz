import { fireEvent, render, screen } from '@testing-library/react'
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

import { SignInForm } from '@/components/auth/sign-in-form'

describe('SignInForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    signInMock.mockResolvedValue({ url: '/me' })
  })

  it('uses updated log in copy', () => {
    render(<SignInForm callbackUrl="/me" googleEnabled={false} githubEnabled={false} />)

    expect(screen.getByRole('heading', { name: 'Log in' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Log in' })).toBeInTheDocument()
  })

  it('shows oauth divider only when oauth is enabled', () => {
    const { rerender } = render(
      <SignInForm callbackUrl="/me" googleEnabled={true} githubEnabled={false} />
    )

    expect(screen.getByText('or')).toBeInTheDocument()

    rerender(<SignInForm callbackUrl="/me" googleEnabled={false} githubEnabled={false} />)
    expect(screen.queryByText('or')).not.toBeInTheDocument()
  })

  it('uses logging in loading copy on submit', async () => {
    signInMock.mockReturnValue(new Promise(() => {}))
    render(<SignInForm callbackUrl="/me" googleEnabled={false} githubEnabled={false} />)

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'player@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password123!' } })
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }))

    expect(await screen.findByText('Logging in…')).toBeInTheDocument()
  })
})
