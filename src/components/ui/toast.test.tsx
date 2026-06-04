import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      initial: _framerInitial,
      animate: _framerAnimate,
      exit: _framerExit,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & {
      initial?: unknown
      animate?: unknown
      exit?: unknown
    }) => {
      void _framerInitial
      void _framerAnimate
      void _framerExit
      return <div {...props}>{children}</div>
    },
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

import { ToastProvider, useToast } from '@/components/ui/toast'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'

function wrapper({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>
}

describe('ToastProvider', () => {
  it('renders children', () => {
    render(
      <ToastProvider>
        <p>Hello</p>
      </ToastProvider>
    )
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})

describe('useToast', () => {
  it('throws when used outside ToastProvider', () => {
    // Suppress expected React error output
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => renderHook(() => useToast())).toThrow(
      'useToast must be used within a ToastProvider'
    )
    spy.mockRestore()
  })

  it('addToast shows a toast message', async () => {
    const { result } = renderHook(() => useToast(), { wrapper })
    act(() => {
      result.current.addToast('Something happened', 'success')
    })
    expect(screen.getByText('Something happened')).toBeInTheDocument()
  })

  it('removeToast removes the toast', () => {
    const { result } = renderHook(() => useToast(), { wrapper })
    act(() => {
      result.current.addToast('Temp toast', 'info')
    })
    expect(screen.getByText('Temp toast')).toBeInTheDocument()

    act(() => {
      const id = result.current.toasts[0].id
      result.current.removeToast(id)
    })
    expect(screen.queryByText('Temp toast')).not.toBeInTheDocument()
  })

  it('dismiss button removes the toast', () => {
    const { result } = renderHook(() => useToast(), { wrapper })
    act(() => {
      result.current.addToast('Dismissible', 'warning')
    })
    const dismissBtn = screen.getByRole('button', { name: /dismiss/i })
    fireEvent.click(dismissBtn)
    expect(screen.queryByText('Dismissible')).not.toBeInTheDocument()
  })

  it('toast has role="alert"', () => {
    const { result } = renderHook(() => useToast(), { wrapper })
    act(() => {
      result.current.addToast('Alert toast', 'error')
    })
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('addToast defaults to info variant', () => {
    const { result } = renderHook(() => useToast(), { wrapper })
    act(() => {
      result.current.addToast('Info message')
    })
    expect(result.current.toasts[0].variant).toBe('info')
  })
})
