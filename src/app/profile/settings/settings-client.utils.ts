export async function readErrorMessage(response: Response, fallback: string) {
  try {
    const body = (await response.json()) as { error?: string }
    return body.error || fallback
  } catch {
    return fallback
  }
}

export function isValidImageUrl(value: string) {
  if (!value.trim()) {
    return false
  }

  try {
    const url = new URL(value)
    return url.protocol === 'https:' && Boolean(url.hostname)
  } catch {
    return false
  }
}

export function trimOrNull(value: string) {
  return value.trim() || null
}
