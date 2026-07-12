import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { checkRateLimit } from '@/server/rate-limit'
import { readImageDimensions } from '@/server/image-dimensions'
import { logger } from '@/server/logger'

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
const MAX_IMAGE_DIMENSION = 12_000
const MAX_IMAGE_PIXELS = 25_000_000

// Allow each user to upload at most 100 images per hour.
const UPLOAD_RATE_LIMIT = { limit: 100, windowMs: 60 * 60 * 1000 } as const

type DetectedImageFormat = 'png' | 'jpeg' | 'webp' | 'gif'

const DETECTED_FORMAT_TO_CONTENT_TYPE: Record<DetectedImageFormat, string> = {
  png: 'image/png',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
}

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

function hasBytes(bytes: Uint8Array, ...expected: number[]) {
  if (bytes.length < expected.length) return false
  return expected.every((value, index) => bytes[index] === value)
}

function detectImageFormat(bytes: Uint8Array): DetectedImageFormat | null {
  // PNG signature
  if (hasBytes(bytes, 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return 'png'

  // JPEG starts with FF D8 FF
  if (hasBytes(bytes, 0xff, 0xd8, 0xff)) return 'jpeg'

  // GIF header: GIF87a or GIF89a
  if (
    hasBytes(bytes, 0x47, 0x49, 0x46, 0x38, 0x37, 0x61) ||
    hasBytes(bytes, 0x47, 0x49, 0x46, 0x38, 0x39, 0x61)
  ) {
    return 'gif'
  }

  // WEBP: RIFF....WEBP
  if (
    bytes.length >= 12 &&
    hasBytes(bytes, 0x52, 0x49, 0x46, 0x46) &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return 'webp'
  }

  return null
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

  if (file.type && !file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Only image uploads are supported' }, { status: 415 })
  }

  // SVG is blocked by default. We do not have a server-side SVG sanitization pipeline.
  if (file.type === 'image/svg+xml') {
    return NextResponse.json({ error: 'SVG uploads are not supported' }, { status: 415 })
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return NextResponse.json({ error: 'Image must be 5 MB or smaller' }, { status: 413 })
  }

  const fileBytes = new Uint8Array(await file.arrayBuffer())
  const detectedFormat = detectImageFormat(fileBytes)
  if (!detectedFormat) {
    return NextResponse.json(
      { error: 'Unsupported or invalid image format. Allowed: PNG, JPEG, WEBP, GIF.' },
      { status: 415 }
    )
  }

  const detectedContentType = DETECTED_FORMAT_TO_CONTENT_TYPE[detectedFormat]
  const dimensions = readImageDimensions(fileBytes, detectedFormat)
  if (
    !dimensions ||
    dimensions.width <= 0 ||
    dimensions.height <= 0 ||
    dimensions.width > MAX_IMAGE_DIMENSION ||
    dimensions.height > MAX_IMAGE_DIMENSION ||
    dimensions.width * dimensions.height > MAX_IMAGE_PIXELS
  ) {
    return NextResponse.json(
      { error: 'Image dimensions are invalid or too large (maximum 25 megapixels).' },
      { status: 413 }
    )
  }

  const pathname = `quiz-images/${session.user.id}/${Date.now()}-${crypto.randomUUID()}-${sanitizeFilename(file.name)}`

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: pathname,
        Body: Buffer.from(fileBytes),
        ContentType: detectedContentType,
      })
    )

    return NextResponse.json({ url: `${process.env.R2_PUBLIC_URL}/${pathname}` })
  } catch (error) {
    logger.error('R2 image upload failed', {
      userId: session.user.id,
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
