import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { usePathnameMock, useSessionMock } = vi.hoisted(() => ({
  usePathnameMock: vi.fn(() => '/quiz/some-id'),
  useSessionMock: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  usePathname: usePathnameMock,
}))

vi.mock('next-auth/react', () => ({
  useSession: useSessionMock,
}))

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

import { GuestUpgradePrompt } from '@/components/auth/guest-upgrade-prompt'

beforeEach(() => {
  vi.clearAllMocks()
  sessionStorage.clear()
})

describe('GuestUpgradePrompt', () => {
  it('renders nothing while session is loading', () => {
    useSessionMock.mockReturnValue({ data: null, status: 'loading' })
    const { container } = render(<GuestUpgradePrompt />)
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing for an authenticated user with an email', () => {
    useSessionMock.mockReturnValue({
      data: { user: { email: 'alice@example.com' } },
      status: 'authenticated',
    })
    const { container } = render(<GuestUpgradePrompt />)
    expect(container.firstChild).toBeNull()
  })

  it('renders sign-up and sign-in links for a guest user (no email)', () => {
    useSessionMock.mockReturnValue({
      data: { user: { email: null } },
      status: 'authenticated',
    })
    render(<GuestUpgradePrompt />)
    expect(screen.getByRole('link', { name: 'Sign up' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('renders sign-up and sign-in links when there is no session', () => {
    useSessionMock.mockReturnValue({ data: null, status: 'unauthenticated' })
    render(<GuestUpgradePrompt />)
    expect(screen.getByRole('link', { name: 'Sign up' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('includes the current pathname as callbackUrl', () => {
    usePathnameMock.mockReturnValue('/quiz/abc')
    useSessionMock.mockReturnValue({ data: null, status: 'unauthenticated' })
    render(<GuestUpgradePrompt />)
    const signUp = screen.getByRole('link', { name: 'Sign up' })
    expect(signUp.getAttribute('href')).toContain(encodeURIComponent('/quiz/abc'))
  })

  it('hides after dismiss button is clicked', () => {
    useSessionMock.mockReturnValue({ data: null, status: 'unauthenticated' })
    render(<GuestUpgradePrompt />)
    const dismiss = screen.getByRole('button', { name: /dismiss/i })
    fireEvent.click(dismiss)
    expect(screen.queryByRole('link', { name: 'Sign up' })).not.toBeInTheDocument()
  })

  it('does not render when sessionStorage dismiss key is set', () => {
    sessionStorage.setItem('qa_guest_upgrade_prompt_dismissed', '1')
    useSessionMock.mockReturnValue({ data: null, status: 'unauthenticated' })
    const { container } = render(<GuestUpgradePrompt />)
    expect(container.firstChild).toBeNull()
  })
})
