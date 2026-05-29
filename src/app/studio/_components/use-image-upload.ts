'use client'

import * as React from 'react'
import { GENERIC_UPLOAD_ERROR, getUploadErrorMessage, validateFile } from './image-upload.utils'

export function useImageUpload(onChange: (url: string) => void) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [previewErrorUrl, setPreviewErrorUrl] = React.useState('')
  const [isDragging, setIsDragging] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

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
        setError(GENERIC_UPLOAD_ERROR)
        return
      }

      onChange(payload.url)
    } catch {
      setError(GENERIC_UPLOAD_ERROR)
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

  return {
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
  }
}
