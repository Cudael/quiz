'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { REDUCED_MOTION_STORAGE_KEY } from '@/lib/preferences'

export type SoundName = 'correct' | 'wrong' | 'tick' | 'level-up' | 'badge' | 'start'

type HowlCtor = {
  new (opts: { src: string[]; volume?: number; preload?: boolean }): {
    play: () => void
    volume: (value: number) => void
  }
}

const STORAGE_ENABLED_KEY = 'soundEnabled'
const STORAGE_VOLUME_KEY = 'soundVolume'
const STORAGE_EVENT = 'quizarena-sound-change'
const DEFAULT_ENABLED = true
const DEFAULT_VOLUME = 0.6

const soundFiles: Record<SoundName, string> = {
  correct: '/sfx/correct.mp3',
  wrong: '/sfx/wrong.mp3',
  tick: '/sfx/tick.mp3',
  'level-up': '/sfx/level-up.mp3',
  badge: '/sfx/badge.mp3',
  start: '/sfx/start.mp3',
}

const clamp = (value: number) => Math.min(1, Math.max(0, value))

export function useSound() {
  const [enabled, setEnabledState] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_ENABLED
    const storedEnabled = localStorage.getItem(STORAGE_ENABLED_KEY)
    return storedEnabled === null ? DEFAULT_ENABLED : storedEnabled !== 'false'
  })
  const [volume, setVolumeState] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_VOLUME
    const storedVolume = localStorage.getItem(STORAGE_VOLUME_KEY)
    if (storedVolume === null) return DEFAULT_VOLUME
    const parsed = Number(storedVolume)
    return Number.isNaN(parsed) ? DEFAULT_VOLUME : clamp(parsed)
  })
  const howlerRef = useRef<HowlCtor | null>(null)
  const soundsRef = useRef<Partial<Record<SoundName, InstanceType<HowlCtor>>>>({})
  const bootstrappedRef = useRef(false)

  const reducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false
    const override = localStorage.getItem(REDUCED_MOTION_STORAGE_KEY)
    if (override === 'true') return true
    if (override === 'false') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  const init = useCallback(async () => {
    if (bootstrappedRef.current) return
    const mod = await import('howler')
    howlerRef.current = mod.Howl as HowlCtor

    const nextSounds: Partial<Record<SoundName, InstanceType<HowlCtor>>> = {}
    for (const [name, src] of Object.entries(soundFiles) as Array<[SoundName, string]>) {
      nextSounds[name] = new mod.Howl({ src: [src], preload: true, volume })
    }
    soundsRef.current = nextSounds
    bootstrappedRef.current = true
  }, [volume])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const sync = () => {
      const nextEnabled = localStorage.getItem(STORAGE_ENABLED_KEY)
      const nextVolume = localStorage.getItem(STORAGE_VOLUME_KEY)
      if (nextEnabled !== null) setEnabledState(nextEnabled !== 'false')
      if (nextVolume !== null) {
        const parsed = Number(nextVolume)
        if (!Number.isNaN(parsed)) setVolumeState(clamp(parsed))
      }
    }

    window.addEventListener('storage', sync)
    window.addEventListener(STORAGE_EVENT, sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener(STORAGE_EVENT, sync)
    }
  }, [])

  useEffect(() => {
    const onFirstInteraction = () => {
      void init()
      window.removeEventListener('pointerdown', onFirstInteraction)
      window.removeEventListener('keydown', onFirstInteraction)
    }

    window.addEventListener('pointerdown', onFirstInteraction, { once: true })
    window.addEventListener('keydown', onFirstInteraction, { once: true })

    return () => {
      window.removeEventListener('pointerdown', onFirstInteraction)
      window.removeEventListener('keydown', onFirstInteraction)
    }
  }, [init])

  const setEnabled = useCallback((value: boolean) => {
    setEnabledState(value)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_ENABLED_KEY, value ? 'true' : 'false')
      window.dispatchEvent(new Event(STORAGE_EVENT))
    }
  }, [])

  const setVolume = useCallback((value: number) => {
    const next = clamp(value)
    setVolumeState(next)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_VOLUME_KEY, String(next))
      window.dispatchEvent(new Event(STORAGE_EVENT))
    }

    for (const sound of Object.values(soundsRef.current)) {
      sound?.volume(next)
    }
  }, [])

  const play = useCallback(
    async (name: SoundName) => {
      if (!enabled) return
      if (name === 'tick' && reducedMotion) return

      if (!bootstrappedRef.current) {
        await init()
      }

      const sound = soundsRef.current[name]
      sound?.volume(volume)
      sound?.play()
    },
    [enabled, init, reducedMotion, volume]
  )

  return {
    enabled,
    volume,
    play,
    setEnabled,
    setVolume,
  }
}
