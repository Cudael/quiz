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
    quizCount: 12,
  },
  {
    slug: 'history',
    name: 'History',
    icon: 'ScrollText',
    color: '#f97316',
    quizCount: 5,
  },
]

describe('CategoryBarClient', () => {
  beforeEach(() => {
    mockedUsePathname.mockReturnValue('/categories/science')
  })

  it('renders category cards with image and icon fallback', () => {
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

  it('shows category labels', () => {
    render(<CategoryBarClient categories={categories} />)

    expect(screen.getByText('Science')).toBeTruthy()
    expect(screen.getByText('History')).toBeTruthy()
  })

  it('uses grid layout and active card state', () => {
    render(<CategoryBarClient categories={categories} />)

    const navigation = screen.getByRole('navigation', { name: 'Popular categories' })
    expect(navigation.className).toContain('grid-flow-col')
    expect(navigation.className).not.toContain('overflow-x-auto')

    const activeLink = screen.getByRole('link', { name: /science/i })
    const historyLink = screen.getByRole('link', { name: /history/i })
    expect(activeLink).toHaveAttribute('aria-current', 'page')
    expect(activeLink.className).toContain('text-foreground')
    expect(historyLink.className).toContain('hover:text-foreground')
  })

  it('renders quiz counts', () => {
    render(<CategoryBarClient categories={categories} />)

    expect(screen.getByText('12 quizzes')).toBeTruthy()
    expect(screen.getByText('5 quizzes')).toBeTruthy()
  })

  it('uses container-constrained full-width wrapper', () => {
    const { container } = render(<CategoryBarClient categories={categories} />)
    const wrapper = container.firstElementChild
    expect(wrapper?.className).toContain('w-full')
    expect(wrapper?.className).toContain('border-b')
    expect(wrapper?.className).not.toContain('sticky')
    expect(wrapper?.querySelector('.container')).toBeTruthy()
  })
})
