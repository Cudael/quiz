import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { CategoryBrowser } from './category-browser'
import type { ParentCategoryData } from './page'

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

const parentCategories: ParentCategoryData[] = [
  {
    slug: 'history',
    name: 'History',
    description: 'Civilizations and events',
    icon: 'Landmark',
    color: '#f59e0b',
    quizCount: 3,
    totalPlays: 42,
    subcategories: [
      {
        slug: 'world-history',
        name: 'World History',
        description: 'Global events',
        icon: 'Globe',
        color: '#0ea5e9',
        quizCount: 2,
        totalPlays: 30,
      },
      {
        slug: 'mythology',
        name: 'Mythology',
        description: 'Gods and legends',
        icon: 'Flame',
        color: '#f97316',
        quizCount: 1,
        totalPlays: 12,
      },
    ],
  },
]

describe('CategoryBrowser', () => {
  it('renders parent and compact subcategory links with browse-all action', () => {
    render(
      <CategoryBrowser parentCategories={parentCategories} totalQuizzes={3} totalCategories={3} />
    )

    expect(screen.getByRole('link', { name: 'History' })).toHaveAttribute(
      'href',
      '/categories/history'
    )
    expect(screen.getByRole('link', { name: /browse all/i })).toHaveAttribute(
      'href',
      '/categories/history'
    )
    expect(screen.getByRole('link', { name: /world history/i })).toHaveAttribute(
      'href',
      '/categories/world-history'
    )
    expect(screen.getByRole('link', { name: /mythology/i })).toHaveAttribute(
      'href',
      '/categories/mythology'
    )
  })

  it('filters parent sections and subcategories by search term', async () => {
    render(
      <CategoryBrowser parentCategories={parentCategories} totalQuizzes={3} totalCategories={3} />
    )

    fireEvent.change(screen.getByLabelText('Search categories'), { target: { value: 'myth' } })

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /mythology/i })).toBeInTheDocument()
      expect(screen.queryByRole('link', { name: /world history/i })).not.toBeInTheDocument()
    })
  })
})
