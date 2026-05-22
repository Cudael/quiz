import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { useSound } from '@/lib/use-sound'

const playMock = vi.fn()
const volumeMock = vi.fn()

vi.mock('howler', () => ({
  Howl: class {
    play = playMock
    volume = volumeMock
  },
}))

describe('useSound', () => {
  beforeEach(() => {
    localStorage.clear()
    playMock.mockClear()
    volumeMock.mockClear()
  })

  it('defaults to enabled and persists toggles', async () => {
    const { result } = renderHook(() => useSound())

    expect(result.current.enabled).toBe(true)

    act(() => {
      result.current.setEnabled(false)
    })

    expect(localStorage.getItem('soundEnabled')).toBe('false')
  })

  it('persists volume and plays sounds', async () => {
    const { result } = renderHook(() => useSound())

    act(() => {
      result.current.setVolume(0.3)
    })

    expect(localStorage.getItem('soundVolume')).toBe('0.3')

    await act(async () => {
      await result.current.play('start')
    })

    expect(playMock).toHaveBeenCalled()
  })
})
