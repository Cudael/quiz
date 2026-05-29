import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

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
  it('uses create account title', () => {
    render(<SignUpForm callbackUrl="/me" googleEnabled={false} githubEnabled={false} />)

    expect(screen.getByRole('heading', { name: 'Create account' })).toBeInTheDocument()
  })

  it('shows oauth divider only when oauth is enabled', () => {
    const { rerender } = render(
      <SignUpForm callbackUrl="/me" googleEnabled={true} githubEnabled={false} />
    )

    expect(screen.getByText('or')).toBeInTheDocument()

    rerender(<SignUpForm callbackUrl="/me" googleEnabled={false} githubEnabled={false} />)
    expect(screen.queryByText('or')).not.toBeInTheDocument()
  })
})
