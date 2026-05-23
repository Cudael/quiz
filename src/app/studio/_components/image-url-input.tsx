'use client'

import * as React from 'react'
import Image from 'next/image'
import { ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUrlInputProps {
  value: string
  onChange: (value: string) => void
  label?: string
  aspectRatio?: '16/9' | 'square'
}

export function ImageUrlInput({
  value,
  onChange,
  label = 'Image URL',
  aspectRatio = '16/9',
}: ImageUrlInputProps) {
  const [hasError, setHasError] = React.useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasError(false)
    onChange(e.target.value)
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">{label}</label>
      <input
        type="url"
        value={value}
        onChange={handleChange}
        placeholder="Paste any public image URL"
        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
      />
      {value && (
        <div
          className={cn(
            'relative overflow-hidden rounded-md border bg-muted',
            aspectRatio === '16/9' ? 'aspect-video' : 'aspect-square'
          )}
        >
          {hasError ? (
            <div className="flex h-full items-center justify-center">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          ) : (
            <Image
              src={value}
              alt="Image preview"
              fill
              unoptimized
              sizes={aspectRatio === '16/9' ? '(max-width: 768px) 100vw, 50vw' : '256px'}
              className="object-cover"
              onError={() => setHasError(true)}
              onLoad={() => setHasError(false)}
            />
          )}
        </div>
      )}
      <p className="text-xs text-muted-foreground">Paste any public image URL</p>
    </div>
  )
}
