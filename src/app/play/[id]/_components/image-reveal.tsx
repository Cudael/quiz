'use client'

import Image from 'next/image'
import { imageLoader } from '../play-view.utils'

interface ImageRevealProps {
  src: string
  alt: string
  /** 'blur' | 'pixelate' | 'zoom' */
  mode: string
  /** 0 = fully obscured, 1 = fully clear */
  progress: number
  /** Answered questions are always fully revealed */
  revealed: boolean
}

/** IMAGE_REVEAL — image that gradually de-obscures as the timer runs down. */
export function ImageReveal({ src, alt, mode, progress, revealed }: ImageRevealProps) {
  const clarity = revealed ? 1 : Math.min(1, Math.max(0, progress))

  const style: React.CSSProperties = {}
  if (mode === 'zoom') {
    // Start zoomed in to a detail, ease out to the full picture
    style.transform = `scale(${1 + (1 - clarity) * 2})`
    style.transformOrigin = '35% 35%'
  } else {
    // 'blur' and 'pixelate' (approximated with a heavy blur)
    const maxBlur = mode === 'pixelate' ? 32 : 24
    style.filter = `blur(${((1 - clarity) * maxBlur).toFixed(1)}px)`
  }

  return (
    <div className="relative overflow-hidden rounded-md border border-border/60 bg-muted/20">
      <Image
        loader={imageLoader}
        unoptimized
        src={src}
        alt={revealed ? alt : 'Obscured image — guess before it fully appears'}
        width={1200}
        height={675}
        sizes="(max-width: 768px) 100vw, 768px"
        className="h-auto max-h-80 w-full object-contain transition-all duration-500 ease-linear"
        style={style}
      />
    </div>
  )
}
