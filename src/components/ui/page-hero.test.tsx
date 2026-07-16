import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PageHero } from '@/components/ui/page-hero'

describe('PageHero', () => {
  it('renders one page heading with supporting content', () => {
    render(
      <PageHero eyebrow="About" title="A useful title" description="A clear description">
        <a href="/next">Continue</a>
      </PageHero>
    )

    expect(screen.getByRole('heading', { level: 1, name: 'A useful title' })).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('A clear description')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Continue' })).toHaveAttribute('href', '/next')
  })
})
