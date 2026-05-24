'use client'

import * as React from 'react'
import Image from 'next/image'
import { ImageIcon, Loader2, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  label?: string
  aspectRatio?: '16/9' | 'square'
}

function getUploadErrorMessage(error: unknown) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'error' in error &&
    typeof error.error === 'string'
  ) {
    return error.error
  }

  return 'Unable to upload image.'
}

function validateFile(file: File) {
  if (!file.type.startsWith('image/')) {
    return 'Please choose an image file.'
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return 'Image must be 5 MB or smaller.'
  }

  return null
}

export function ImageUpload({
  value,
  onChange,
  label = 'Image',
  aspectRatio = '16/9',
}: ImageUploadProps) {
  const inputId = React.useId()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [previewErrorUrl, setPreviewErrorUrl] = React.useState('')
  const [isDragging, setIsDragging] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const hasPreviewError = value !== '' && previewErrorUrl === value

  const openFilePicker = () => {
    inputRef.current?.click()
  }

  const handleRemove = () => {
    setError(null)
    setPreviewErrorUrl('')
    onChange('')
  }

  const uploadFile = async (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setPreviewErrorUrl('')
    setIsUploading(true)

    const formData = new FormData()
    formData.set('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      let payload: unknown = null
      try {
        payload = await response.json()
      } catch {}

      if (!response.ok) {
        setError(getUploadErrorMessage(payload))
        return
      }

      if (
        typeof payload !== 'object' ||
        payload === null ||
        !('url' in payload) ||
        typeof payload.url !== 'string'
      ) {
        setError('Unable to upload image.')
        return
      }

      onChange(payload.url)
    } catch {
      setError('Unable to upload image.')
    } finally {
      setIsUploading(false)
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  const handleInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    await uploadFile(file)
  }

  const handleDrop = async (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setIsDragging(false)

    const file = event.dataTransfer.files?.[0]
    if (!file) {
      return
    }

    await uploadFile(file)
  }

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block text-sm font-medium">
        {label}
      </label>

      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(event) => void handleInputChange(event)}
        className="sr-only"
      />

      {value ? (
        <>
          <div
            className={cn(
              'relative overflow-hidden rounded-md border bg-muted',
              aspectRatio === '16/9' ? 'aspect-video' : 'aspect-square'
            )}
          >
            {hasPreviewError ? (
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
                onError={() => setPreviewErrorUrl(value)}
                onLoad={() => setPreviewErrorUrl('')}
              />
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openFilePicker}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Replace
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={isUploading}
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </Button>
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={openFilePicker}
          onDragEnter={(event) => {
            event.preventDefault()
            setIsDragging(true)
          }}
          onDragOver={(event) => {
            event.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={(event) => {
            event.preventDefault()
            if (event.currentTarget === event.target) {
              setIsDragging(false)
            }
          }}
          onDrop={(event) => void handleDrop(event)}
          disabled={isUploading}
          className={cn(
            'flex w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-muted/40 px-4 py-8 text-center transition-colors',
            aspectRatio === '16/9' ? 'aspect-video' : 'aspect-square',
            isDragging && 'border-primary bg-primary/5',
            isUploading && 'cursor-progress'
          )}
        >
          {isUploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          ) : (
            <Upload className="h-8 w-8 text-muted-foreground" />
          )}
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {isUploading ? 'Uploading image…' : 'Drag and drop an image, or click to browse'}
            </p>
            <p className="text-xs text-muted-foreground">PNG, JPG, GIF, and WebP up to 5 MB</p>
          </div>
        </button>
      )}

      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : (
        <p className="text-xs text-muted-foreground">Upload an image file up to 5 MB.</p>
      )}
    </div>
  )
}
