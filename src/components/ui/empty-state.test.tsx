import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { EmptyState } from '@/components/ui/empty-state'

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

describe('EmptyState', () => {
  it('renders the title', () => {
    render(<EmptyState title="Nothing here" />)
    expect(screen.getByText('Nothing here')).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(<EmptyState title="Empty" description="Try adding some items." />)
    expect(screen.getByText('Try adding some items.')).toBeInTheDocument()
  })

  it('does not render description when omitted', () => {
    const { container } = render(<EmptyState title="Empty" />)
    expect(container.querySelectorAll('p')).toHaveLength(1)
  })

  it('renders an icon when provided', () => {
    render(<EmptyState title="Empty" icon={<span data-testid="icon">🔍</span>} />)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('renders a link button when action.href is provided', () => {
    render(<EmptyState title="Empty" action={{ label: 'Go somewhere', href: '/somewhere' }} />)
    const link = screen.getByRole('link', { name: 'Go somewhere' })
    expect(link).toHaveAttribute('href', '/somewhere')
  })

  it('renders a button with onClick when action.onClick is provided', () => {
    const handleClick = vi.fn()
    render(<EmptyState title="Empty" action={{ label: 'Click me', onClick: handleClick }} />)
    fireEvent.click(screen.getByRole('button', { name: 'Click me' }))
    expect(handleClick).toHaveBeenCalledOnce()
  })

  it('applies extra className', () => {
    const { container } = render(<EmptyState title="Empty" className="my-custom-class" />)
    expect((container.firstChild as HTMLElement).className).toContain('my-custom-class')
  })
})
