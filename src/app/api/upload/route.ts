import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { checkRateLimit } from '@/server/rate-limit'

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024

// Allow each user to upload at most 100 images per hour.
const UPLOAD_RATE_LIMIT = { limit: 100, windowMs: 60 * 60 * 1000 } as const

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
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: pathname,
        Body: Buffer.from(await file.arrayBuffer()),
        ContentType: file.type,
      })
    )

    return NextResponse.json({ url: `${process.env.R2_PUBLIC_URL}/${pathname}` })
  } catch {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
