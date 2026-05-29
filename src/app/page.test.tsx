import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import HomePage from '@/app/page'

vi.mock('@/components/layout/category-bar', () => ({
  CategoryBar: () => <div data-testid="category-bar">category bar</div>,
}))

vi.mock('@/components/home/home-page', () => ({
  HomePage: () => <div data-testid="home-page-content">home content</div>,
  HomePageSkeleton: () => <div data-testid="home-page-skeleton">home skeleton</div>,
}))

describe('HomePage', () => {
  it('renders category bar above home page content', () => {
    render(<HomePage />)

    const categoryBar = screen.getByTestId('category-bar')
    const homeContent = screen.getByTestId('home-page-content')
    expect(categoryBar).toBeTruthy()
    expect(homeContent).toBeTruthy()
    expect(
      categoryBar.compareDocumentPosition(homeContent) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
  })
})
