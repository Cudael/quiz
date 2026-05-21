import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BadgesGrid } from '@/components/ui/badges-grid'

describe('BadgesGrid', () => {
  const badges = [
    {
      id: 'b1',
      slug: 'first-win',
      name: 'First Win',
      description: 'Complete first quiz',
      criteria: '{"type":"wins","count":1}',
    },
    {
      id: 'b2',
      slug: 'perfect-score',
      name: 'Perfect Score',
      description: 'Get every answer right',
      criteria: '{"type":"perfectScore"}',
    },
  ]

  it('shows earned vs locked styling and opens modal', () => {
    render(
      <BadgesGrid
        badges={badges}
        earnedBadges={[{ badgeId: 'b1', awardedAt: new Date().toISOString() }]}
        badgeLeaders={{ b1: [{ id: 'u1', name: 'Alice', username: 'alice' }], b2: [] }}
      />
    )

    expect(screen.getByTestId('badge-first-win').className).toContain('bg-quiz-purple/10')
    expect(screen.getByTestId('badge-perfect-score').className).toContain('grayscale')

    fireEvent.click(screen.getByTestId('badge-first-win'))
    expect(screen.getByText('Criteria')).toBeInTheDocument()
    expect(screen.getByText(/Alice/)).toBeInTheDocument()
  })
})
