import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { GlobalHotkeysProvider } from '@/components/hotkeys/global-hotkeys'

const pushMock = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

describe('shortcuts cheatsheet', () => {
  it('opens on ? and closes on Escape', async () => {
    render(
      <GlobalHotkeysProvider>
        <div>content</div>
      </GlobalHotkeysProvider>
    )

    fireEvent.keyDown(window, { key: '?' })

    expect(screen.getByText('Keyboard shortcuts')).toBeInTheDocument()
    expect(screen.getByText('Go to leaderboard')).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })

    await waitFor(() => {
      expect(screen.queryByText('Keyboard shortcuts')).not.toBeInTheDocument()
    })
  })
})
