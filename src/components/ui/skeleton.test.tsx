import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Skeleton } from '@/components/ui/skeleton'

describe('Skeleton', () => {
  it('renders a div with animate-pulse and rounded-md by default', () => {
    const { container } = render(<Skeleton />)
    const el = container.firstChild as HTMLElement
    expect(el.tagName).toBe('DIV')
    expect(el.className).toContain('animate-pulse')
    expect(el.className).toContain('rounded-md')
    expect(el.className).not.toContain('rounded-full')
  })

  it('renders as a circle when circle prop is true', () => {
    const { container } = render(<Skeleton circle />)
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain('rounded-full')
    expect(el.className).not.toContain('rounded-md')
  })

  it('merges additional className', () => {
    const { container } = render(<Skeleton className="h-8 w-8" />)
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain('h-8')
    expect(el.className).toContain('w-8')
  })

  it('passes through HTML attributes', () => {
    render(<Skeleton data-testid="my-skeleton" />)
    expect(screen.getByTestId('my-skeleton')).toBeInTheDocument()
  })
})
