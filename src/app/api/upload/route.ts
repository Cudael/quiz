import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { auth } from '@/server/auth'

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024

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
  const sanitized = filename
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return sanitized || 'image'
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

  const pathname = `quiz-images/${session.user.id}/${Date.now()}-${sanitizeFilename(file.name)}`

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
