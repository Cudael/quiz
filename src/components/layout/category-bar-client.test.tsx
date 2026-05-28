import { render, screen } from '@testing-library/react'
import type { ImgHTMLAttributes, ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CategoryBarClient, type CategoryBarItem } from '@/components/layout/category-bar-client'

const mockedUsePathname = vi.fn()

vi.mock('next/navigation', () => ({
  usePathname: () => mockedUsePathname(),
}))

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('next/image', () => ({
  default: (props: ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean }) => {
    const { alt } = props
    const imgProps = { ...props }
    delete imgProps.fill

    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={alt ?? ''} {...imgProps} />
  },
}))

const categories: CategoryBarItem[] = [
  {
    slug: 'science',
    name: 'Science',
    icon: 'FlaskConical',
    color: '#8b5cf6',
    imageUrl: 'https://cdn.example.com/science.jpg',
  },
  {
    slug: 'history',
    name: 'History',
    icon: 'ScrollText',
    color: '#f97316',
  },
]

describe('CategoryBarClient', () => {
  beforeEach(() => {
    mockedUsePathname.mockReturnValue('/categories/science')
  })

  it('renders compact category pills with image and icon fallback', () => {
    const { container } = render(<CategoryBarClient categories={categories} />)
    const historyLink = screen.getByRole('link', { name: /history/i })

    expect(screen.getByRole('link', { name: /science/i })).toHaveAttribute(
      'href',
      '/categories/science'
    )
    expect(container.querySelector('img[src="https://cdn.example.com/science.jpg"]')).toBeTruthy()
    expect(historyLink.querySelector('img')).toBeNull()
    expect(historyLink.querySelector('svg')).toBeTruthy()
  })

  it('applies sticky separation styling and active state', () => {
    render(<CategoryBarClient categories={categories} />)

    const nav = screen.getByLabelText('Popular categories')
    expect(nav.className).toContain('bg-muted/40')
    expect(nav.className).toContain('shadow-[0_2px_8px_rgba(0,0,0,0.06)]')

    const activeLink = screen.getByRole('link', { name: /science/i })
    const historyLink = screen.getByRole('link', { name: /history/i })
    expect(activeLink).toHaveAttribute('aria-current', 'page')
    expect(historyLink.querySelector('span[style]')).toBeTruthy()
  })
})
