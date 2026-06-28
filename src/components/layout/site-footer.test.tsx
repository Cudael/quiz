import type React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const { linkMock } = vi.hoisted(() => ({
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
}))

vi.mock('next/link', () => ({
  default: linkMock,
}))

vi.mock('next/image', () => ({
  default: ({ priority, ...props }: React.ComponentProps<'img'> & { priority?: boolean }) => {
    void priority
    return <div data-alt={props.alt} data-testid="mock-image" />
  },
}))

vi.mock('@/components/theme/theme-toggle', () => ({
  ThemeToggle: () => <button type="button">Theme toggle</button>,
}))

import { SiteFooter } from '@/components/layout/site-footer'

describe('SiteFooter', () => {
  it('renders the updated community links, social icons, and copyright copy', () => {
    render(<SiteFooter />)

    expect(screen.getByText('Community')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /GitHub/i })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Leaderboard' })).toHaveAttribute(
      'href',
      '/leaderboard'
    )
    expect(screen.getByRole('link', { name: 'Duel Mode' })).toHaveAttribute('href', '/duel')
    expect(screen.queryByRole('link', { name: 'Discord' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Twitter / X' })).toHaveAttribute(
      'href',
      'https://x.com/PlayBusQuiz'
    )
    expect(screen.getByRole('link', { name: 'About Us' })).toHaveAttribute('href', '/about')
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/privacy')
    expect(screen.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '/contact')
    expect(screen.getByRole('link', { name: 'Categories' })).not.toHaveAttribute('data-prefetch')

    expect(screen.getByLabelText('Twitter / X')).toHaveAttribute(
      'href',
      'https://x.com/PlayBusQuiz'
    )
    expect(screen.getByLabelText('Twitter / X')).not.toHaveAttribute('aria-disabled')
    expect(screen.getByLabelText('Instagram')).toHaveAttribute(
      'href',
      'https://www.instagram.com/BusQuiz'
    )
    expect(screen.getByLabelText('Instagram')).not.toHaveAttribute('aria-disabled')
    expect(screen.getByLabelText('TikTok')).toHaveAttribute(
      'href',
      'https://www.tiktok.com/@TheBusQuiz'
    )

    expect(screen.getByText(/Where curiosity meets competition/)).toBeInTheDocument()
    expect(screen.getByText(/All rights reserved\./)).toBeInTheDocument()
  })
})
