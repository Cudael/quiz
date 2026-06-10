'use client'

import * as React from 'react'
import { GENERIC_UPLOAD_ERROR, getUploadErrorMessage, validateFile } from './image-upload.utils'

/**
 * Module-level registry that maps blob:// URLs to their original File objects,
 * so the save flow can resolve a blob preview URL back to the File for upload.
 */
const pendingFiles = new Map<string, File>()

/** Look up the File behind a blob URL. Returns undefined if not found. */
export function getPendingFile(blobUrl: string): File | undefined {
  return pendingFiles.get(blobUrl)
}

/** Remove a blob URL from the registry and revoke its object URL. */
export function clearPendingUpload(blobUrl: string) {
  URL.revokeObjectURL(blobUrl)
  pendingFiles.delete(blobUrl)
}

/**
 * Upload a file to /api/upload and return the permanent URL.
 * Throws on failure so callers can handle errors.
 */
export async function uploadFileToStorage(file: File): Promise<string> {
  const formData = new FormData()
  formData.set('file', file)

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  })

  let payload: unknown = null
  try {
    payload = await response.json()
  } catch {
    // ignore parse errors
  }

  if (!response.ok) {
    throw new Error(getUploadErrorMessage(payload))
  }

  if (
    typeof payload !== 'object' ||
    payload === null ||
    !('url' in payload) ||
    typeof payload.url !== 'string'
  ) {
    throw new Error(GENERIC_UPLOAD_ERROR)
  }

  return payload.url
}

export function useImageUpload(onChange: (url: string) => void) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const prevBlobUrlRef = React.useRef<string | null>(null)
  const [previewErrorUrl, setPreviewErrorUrl] = React.useState('')
  const [isDragging, setIsDragging] = React.useState(false)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  /** Revoke the previous blob URL and remove it from the registry. */
  const cleanupPrevBlob = () => {
    const prev = prevBlobUrlRef.current
    if (prev && prev.startsWith('blob:')) {
      URL.revokeObjectURL(prev)
      pendingFiles.delete(prev)
    }
    prevBlobUrlRef.current = null
  }

  const openFilePicker = () => {
    inputRef.current?.click()
  }

  const handleRemove = () => {
    setError(null)
    setPreviewErrorUrl('')
    cleanupPrevBlob()
    onChange('')
  }

  /** Validate and stage a file: create a blob preview, register it, call onChange. */
  const stageFile = (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      setIsProcessing(false)
      return
    }

    setError(null)
    setPreviewErrorUrl('')
    setIsProcessing(true)

    // Revoke previous blob URL before replacing it
    cleanupPrevBlob()

    const blobUrl = URL.createObjectURL(file)
    pendingFiles.set(blobUrl, file)
    prevBlobUrlRef.current = blobUrl

    onChange(blobUrl)
    setIsProcessing(false)

    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const handleInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    stageFile(file)
  }

  const handleDrop = async (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (!file) return
    stageFile(file)
  }

  return {
    inputRef,
    previewErrorUrl,
    setPreviewErrorUrl,
    isDragging,
    setIsDragging,
    isProcessing,
    error,
    openFilePicker,
    handleRemove,
    handleInputChange,
    handleDrop,
  }
}
