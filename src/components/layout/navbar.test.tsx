import type React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { linkMock, usePathnameMock, useSessionMock } = vi.hoisted(() => ({
  linkMock: vi.fn(
    ({
      href,
      children,
      prefetch,
      ...props
    }: React.ComponentProps<'a'> & { href: string; prefetch?: boolean }) => (
      <a
        href={href}
        data-prefetch={prefetch === undefined ? undefined : String(prefetch)}
        {...props}
      >
        {children}
      </a>
    )
  ),
  usePathnameMock: vi.fn(),
  useSessionMock: vi.fn(),
}))

vi.mock('next/link', () => ({
  default: linkMock,
}))

vi.mock('next/navigation', () => ({
  usePathname: usePathnameMock,
}))

vi.mock('next-auth/react', () => ({
  useSession: useSessionMock,
}))

vi.mock('next/image', () => ({
  default: ({ priority, ...props }: React.ComponentProps<'img'> & { priority?: boolean }) => {
    void priority
    return <div data-alt={props.alt} data-testid="mock-image" />
  },
}))

vi.mock('@/components/auth/auth-controls', () => ({
  AuthControls: () => <div>Auth controls</div>,
}))

vi.mock('@/components/notifications/notification-bell', () => ({
  NotificationBell: () => <div>Notifications</div>,
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({
    asChild,
    children,
    ...props
  }: React.ComponentProps<'button'> & { asChild?: boolean }) => {
    if (asChild) return children
    return <button {...props}>{children}</button>
  },
}))

vi.mock('@/components/ui/sheet', () => ({
  Sheet: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
    open ? <div>{children}</div> : null,
}))

import { Navbar } from '@/components/layout/navbar'

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useSessionMock.mockReturnValue({ data: null })
    usePathnameMock.mockReturnValue('/')
  })

  it('renders nav links with duel link styling and disables leaderboard prefetch', () => {
    render(<Navbar />)

    expect(screen.queryByRole('link', { name: 'Play' })).not.toBeInTheDocument()

    const duelLink = screen.getByRole('link', { name: /Duel/ })
    const leaderboardLink = screen.getByRole('link', { name: 'Leaderboard' })
    const categoriesLink = screen.getByRole('link', { name: 'Categories' })

    expect(duelLink).toHaveClass('text-primary', 'font-bold')
    expect(leaderboardLink).toHaveAttribute('data-prefetch', 'false')
    expect(categoriesLink).not.toHaveAttribute('data-prefetch')
    expect(screen.getByRole('button', { name: /open.*menu/i })).toBeInTheDocument()
  })

  it('closes dropdown on Escape and restores focus', () => {
    render(<Navbar />)

    const menuButton = screen.getByRole('button', { name: /open.*menu/i })
    fireEvent.click(menuButton)

    expect(screen.getByRole('link', { name: 'Popular' })).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(screen.queryByRole('link', { name: 'Popular' })).not.toBeInTheDocument()
    expect(menuButton).toHaveFocus()
  })
})
