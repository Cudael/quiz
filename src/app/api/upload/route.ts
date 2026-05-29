import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { checkRateLimit } from '@/server/rate-limit'

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024

// Allow each user to upload at most 20 images per hour.
const UPLOAD_RATE_LIMIT = { limit: 20, windowMs: 60 * 60 * 1000 } as const

function isUploadedFile(value: FormDataEntryValue | null): value is File {
  return (
    value !== null &&
    typeof value === 'object' &&
    'name' in value &&
    typeof value.name === 'string' &&
    'type' in value &&
    typeof value.type === 'string' &&
    'size' in value &&
    typeof value.size === 'number' &&
    'arrayBuffer' in value &&
    typeof value.arrayBuffer === 'function'
  )
}

function sanitizeFilename(filename: string) {
  const trimmed = filename.trim()
  const lastDotIndex = trimmed.lastIndexOf('.')
  const rawExtension = lastDotIndex > 0 ? trimmed.slice(lastDotIndex + 1) : ''
  const rawBaseName = lastDotIndex > 0 ? trimmed.slice(0, lastDotIndex) : trimmed

  const sanitizedBaseName = rawBaseName
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)

  const sanitizedExtension = rawExtension.replace(/[^a-zA-Z0-9]+/g, '').slice(0, 10)
  const safeBaseName = sanitizedBaseName || 'image'

  return sanitizedExtension ? `${safeBaseName}.${sanitizedExtension}` : safeBaseName
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!(await checkRateLimit(`upload:${session.user.id}`, UPLOAD_RATE_LIMIT))) {
    return NextResponse.json(
      { error: 'Too many uploads. Please try again later.' },
      { status: 429 }
    )
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!isUploadedFile(file)) {
    return NextResponse.json({ error: 'Image file is required' }, { status: 400 })
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Only image uploads are supported' }, { status: 415 })
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return NextResponse.json({ error: 'Image must be 5 MB or smaller' }, { status: 413 })
  }

  const pathname = `quiz-images/${session.user.id}/${Date.now()}-${crypto.randomUUID()}-${sanitizeFilename(file.name)}`

  try {
    const blob = await put(pathname, file, {
      access: 'public',
      addRandomSuffix: false,
    })

    return NextResponse.json({ url: blob.url })
  } catch {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
