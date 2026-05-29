export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
export const GENERIC_UPLOAD_ERROR = 'Unable to upload image. Please try again.'

export function getUploadErrorMessage(error: unknown) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'error' in error &&
    typeof error.error === 'string'
  ) {
    return error.error
  }

  return GENERIC_UPLOAD_ERROR
}

export function validateFile(file: File) {
  if (!file.type.startsWith('image/')) {
    return 'Please choose an image file.'
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return 'Image must be 5 MB or smaller.'
  }

  return null
}
