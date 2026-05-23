import { fireEvent, render, screen, waitForElementToBeRemoved } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { CategoryBrowser } from '@/app/categories/category-browser'
import type { ParentCategoryData } from '@/app/categories/page'

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

const parentCategories: ParentCategoryData[] = [
  {
    slug: 'science',
    name: 'Science',
    description: 'Experiments and facts',
    icon: 'FlaskConical',
    color: '#10b981',
    quizCount: 12,
    totalPlays: 100,
    subcategories: [],
    featuredQuizzes: [],
  },
  {
    slug: 'art',
    name: 'Art',
    description: 'Paintings and artists',
    icon: 'Palette',
    color: '#f59e0b',
    quizCount: 4,
    totalPlays: 20,
    subcategories: [],
    featuredQuizzes: [],
  },
]

describe('CategoryBrowser', () => {
  it('filters categories by name', async () => {
    render(
      <CategoryBrowser parentCategories={parentCategories} totalQuizzes={16} totalCategories={2} />
    )

    fireEvent.change(screen.getByLabelText(/search categories/i), {
      target: { value: 'sci' },
    })

    expect(screen.getByRole('heading', { name: 'Science' })).toBeInTheDocument()
    await waitForElementToBeRemoved(() => screen.queryByRole('heading', { name: 'Art' }))
  })

  it('sorts categories alphabetically when requested', () => {
    render(
      <CategoryBrowser parentCategories={parentCategories} totalQuizzes={16} totalCategories={2} />
    )

    fireEvent.change(screen.getByLabelText(/sort categories/i), {
      target: { value: 'az' },
    })

    expect(
      screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)
    ).toEqual(['Art', 'Science'])
  })
})
