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

  it('removes the desktop quick play CTA and highlights the inactive duel link', () => {
    render(<Navbar />)

    expect(screen.queryByRole('link', { name: 'Play' })).not.toBeInTheDocument()

    const duelLink = screen.getByRole('link', { name: /Duel/ })
    expect(duelLink.className).toContain('text-quiz-pink')
    expect(duelLink.className).toContain('font-bold')
    expect(duelLink.className).toContain('hover:text-quiz-pink/80')
    expect(duelLink.className).toContain('hover:bg-quiz-pink/10')
  })
})
