import type React from 'react'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { usePathnameMock, useSessionMock } = vi.hoisted(() => ({
  usePathnameMock: vi.fn(),
  useSessionMock: vi.fn(),
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
  }: React.ComponentProps<'button'> & { asChild?: boolean }) =>
    asChild ? children : <button {...props}>{children}</button>,
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

  it('renders desktop and mobile search controls with duel link styling', () => {
    render(<Navbar />)

    expect(screen.queryByRole('link', { name: 'Play' })).not.toBeInTheDocument()

    const duelLink = screen.getByRole('link', { name: /Duel/ })
    expect(duelLink).toHaveClass('text-quiz-pink', 'font-bold')
    expect(screen.getAllByRole('searchbox', { name: /search quizzes/i }).length).toBe(2)
    expect(screen.getByRole('button', { name: /open search/i })).toBeInTheDocument()
  })
})
