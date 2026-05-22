import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ThemeProvider } from '@/components/theme-provider'
import { ThemeToggle } from '@/components/theme-toggle'

function mockMatchMedia(matches: boolean) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>()

  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) => {
        listeners.add(listener)
      },
      removeEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) => {
        listeners.delete(listener)
      },
      dispatchEvent: () => false,
    }))
  )

  return listeners
}

describe('theme switching', () => {
  beforeEach(() => {
    localStorage.clear()
    mockMatchMedia(false)
    document.documentElement.className = ''

    const existing = document.getElementById('theme-test-style')
    if (existing) existing.remove()

    const style = document.createElement('style')
    style.id = 'theme-test-style'
    style.textContent = `.light body { background-color: rgb(255, 255, 255); } .dark body { background-color: rgb(15, 23, 42); }`
    document.head.appendChild(style)
  })

  it('updates html class and body background when toggled', async () => {
    render(
      <ThemeProvider defaultTheme="light">
        <ThemeToggle />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(document.documentElement.classList.contains('light')).toBe(true)
      expect(getComputedStyle(document.body).backgroundColor).toBe('rgb(255, 255, 255)')
    })

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true)
      expect(getComputedStyle(document.body).backgroundColor).toBe('rgb(15, 23, 42)')
    })

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(document.documentElement.classList.contains('light')).toBe(true)
      expect(getComputedStyle(document.body).backgroundColor).toBe('rgb(255, 255, 255)')
    })
  })

  it('persists selected theme across remount', async () => {
    const { unmount } = render(
      <ThemeProvider defaultTheme="light">
        <ThemeToggle />
      </ThemeProvider>
    )

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true)
      expect(localStorage.getItem('theme')).toBe('dark')
    })

    unmount()

    render(
      <ThemeProvider defaultTheme="light">
        <ThemeToggle />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })
  })
})
