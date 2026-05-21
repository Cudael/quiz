import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LevelProgress } from '@/components/ui/level-progress'

describe('LevelProgress', () => {
  it('renders expected progress percentage for XP', () => {
    render(<LevelProgress xp={250} size="md" />)
    const bar = screen.getByTestId('level-progress-bar').querySelector('[role="progressbar"]')

    expect(bar).toHaveAttribute('aria-valuenow', '150')
    expect(bar).toHaveAttribute('aria-valuemax', '200')
  })
})
