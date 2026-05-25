import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('framer-motion', () => ({
  motion: {
    span: ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
      <span {...props}>{children}</span>
    ),
  },
}))

import { StreakFlame } from '@/components/ui/streak-flame'

describe('StreakFlame', () => {
  it('displays the current streak value', () => {
    render(<StreakFlame value={5} />)
    expect(screen.getByText('5 days')).toBeInTheDocument()
  })

  it('displays "current:" label', () => {
    render(<StreakFlame value={3} />)
    expect(screen.getByText(/current:/)).toBeInTheDocument()
  })

  it('shows best when provided', () => {
    render(<StreakFlame value={3} best={10} />)
    expect(screen.getByText('10 days')).toBeInTheDocument()
    expect(screen.getByText(/best:/)).toBeInTheDocument()
  })

  it('does not render best label when best is not provided', () => {
    render(<StreakFlame value={3} />)
    expect(screen.queryByText(/best:/)).not.toBeInTheDocument()
  })

  it('applies extra className', () => {
    const { container } = render(<StreakFlame value={1} className="my-class" />)
    expect((container.firstChild as HTMLElement).className).toContain('my-class')
  })

  it('renders value of 0', () => {
    render(<StreakFlame value={0} />)
    expect(screen.getByText('0 days')).toBeInTheDocument()
  })
})
