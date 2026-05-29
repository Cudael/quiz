'use client'

import * as React from 'react'
import Image from 'next/image'
import { ImageIcon, Loader2, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useImageUpload } from './use-image-upload'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  label?: string
  aspectRatio?: '16/9' | 'square'
  compact?: boolean
}

export function ImageUpload({
  value,
  onChange,
  label = 'Image',
  aspectRatio = '16/9',
  compact = false,
}: ImageUploadProps) {
  const inputId = React.useId()
  const {
    inputRef,
    previewErrorUrl,
    setPreviewErrorUrl,
    isDragging,
    setIsDragging,
    isUploading,
    error,
    openFilePicker,
    handleRemove,
    handleInputChange,
    handleDrop,
  } = useImageUpload(onChange)
  const hasPreviewError = value !== '' && previewErrorUrl === value

  if (compact) {
    return (
      <div>
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(event) => void handleInputChange(event)}
          className="sr-only"
        />

        {value ? (
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md border bg-muted">
              {hasPreviewError ? (
                <div className="flex h-full items-center justify-center">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                </div>
              ) : (
                <Image
                  src={value}
                  alt="Image preview"
                  fill
                  unoptimized
                  sizes="80px"
                  className="object-cover"
                  onError={() => setPreviewErrorUrl(value)}
                  onLoad={() => setPreviewErrorUrl('')}
                />
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={openFilePicker}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Upload className="h-3 w-3" />
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
                <Trash2 className="h-3 w-3" />
                Remove
              </Button>
            </div>
          </div>
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
              'flex w-full items-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground',
              isDragging && 'border-primary bg-primary/5',
              isUploading && 'cursor-progress'
            )}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 shrink-0" />
            )}
            {isUploading ? 'Uploading…' : 'Add image (optional)'}
          </button>
        )}

        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      </div>
    )
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
      ) : !value ? (
        <p className="text-xs text-muted-foreground">Upload an image file up to 5 MB.</p>
      ) : null}
    </div>
  )
}
