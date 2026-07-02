'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { imageLoader } from '../play-view.utils'

interface MemoryFlashStudyProps {
  studyText?: string
  studyImageUrl?: string
  studyDurationMs: number
  onDone: () => void
}

/** MEMORY_FLASH — study card shown briefly before the question appears. */
export function MemoryFlashStudy({
  studyText,
  studyImageUrl,
  studyDurationMs,
  onDone,
}: MemoryFlashStudyProps) {
  const [remainingMs, setRemainingMs] = useState(studyDurationMs)

  useEffect(() => {
    const startedAt = Date.now()
    const interval = setInterval(() => {
      const left = studyDurationMs - (Date.now() - startedAt)
      if (left <= 0) {
        clearInterval(interval)
        setRemainingMs(0)
        onDone()
      } else {
        setRemainingMs(left)
      }
    }, 100)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studyDurationMs])

  const secondsLeft = Math.ceil(remainingMs / 1000)

  return (
    <div className="space-y-4 rounded-md border border-primary/40 bg-primary/5 p-5 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary">
        Memorize this — {secondsLeft}s
      </p>
      {studyImageUrl ? (
        <div className="relative mx-auto overflow-hidden rounded-md border border-border/60">
          <Image
            loader={imageLoader}
            unoptimized
            src={studyImageUrl}
            alt="Study this image carefully"
            width={1200}
            height={675}
            sizes="(max-width: 768px) 100vw, 768px"
            className="h-auto max-h-80 w-full object-contain"
          />
        </div>
      ) : null}
      {studyText ? <p className="text-lg font-semibold leading-relaxed">{studyText}</p> : null}
      <div className="mx-auto h-2 max-w-xs overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-100 ease-linear"
          style={{ width: `${(remainingMs / studyDurationMs) * 100}%` }}
        />
      </div>
    </div>
  )
}
