import type React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

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
    expect(screen.getByRole('link', { name: 'Duel' })).toHaveAttribute('href', '/duel')
    expect(screen.getAllByRole('link', { name: 'Discord' })).toHaveLength(2)
    expect(screen.getAllByRole('link', { name: 'Twitter / X' })).toHaveLength(2)
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about')
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/privacy')
    expect(screen.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '/contact')
    expect(screen.getByLabelText('Twitter / X')).toHaveAttribute('href', '#')
    expect(screen.getByLabelText('Twitter / X')).toHaveAttribute('aria-disabled', 'true')
    expect(screen.getByLabelText('Instagram')).toHaveAttribute('href', '#')
    expect(screen.getByLabelText('Instagram')).toHaveAttribute('aria-disabled', 'true')
    expect(screen.getByLabelText('Discord')).toHaveAttribute('href', '#')
    expect(screen.getByLabelText('Discord')).toHaveAttribute('aria-disabled', 'true')
    expect(
      screen
        .getAllByRole('link', { name: 'Discord' })
        .find((element) => element.textContent === 'Discord')
    ).toHaveAttribute('aria-disabled', 'true')
    expect(
      screen
        .getAllByRole('link', { name: 'Twitter / X' })
        .find((element) => element.textContent === 'Twitter / X')
    ).toHaveAttribute('aria-disabled', 'true')
    expect(screen.getByText('Test your knowledge. Challenge your friends.')).toBeInTheDocument()
    expect(screen.getByText(/All rights reserved\./)).toBeInTheDocument()
  })
})
