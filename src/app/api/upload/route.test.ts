import { beforeEach, describe, expect, it, vi } from 'vitest'

const { authMock, s3SendMock, checkRateLimitMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  s3SendMock: vi.fn().mockResolvedValue({}),
  checkRateLimitMock: vi.fn().mockResolvedValue(true),
}))

vi.mock('@/server/auth', () => ({ auth: authMock }))
vi.mock('@aws-sdk/client-s3', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  S3Client: vi.fn(function (this: any) {
    this.send = s3SendMock
  }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  PutObjectCommand: vi.fn(function (this: any, input: unknown) {
    Object.assign(this, input)
  }),
}))
vi.mock('@/server/rate-limit', () => ({ checkRateLimit: checkRateLimitMock }))

import { POST } from '@/app/api/upload/route'

function createRequest(file?: File) {
  const formData = new FormData()
  if (file) {
    formData.set('file', file)
  }

  return {
    formData: vi.fn().mockResolvedValue(formData),
  } as unknown as Request
}

describe('POST /api/upload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    checkRateLimitMock.mockResolvedValue(true)
    s3SendMock.mockResolvedValue({})
    vi.stubEnv('R2_PUBLIC_URL', 'https://images.example.com')
  })

  it('returns 401 when the user is not authenticated', async () => {
    authMock.mockResolvedValue(null)

    const response = await POST(createRequest())

    expect(response.status).toBe(401)
    expect(s3SendMock).not.toHaveBeenCalled()
  })

  it('returns 429 when the per-user upload rate limit is exceeded', async () => {
    authMock.mockResolvedValue({ user: { id: 'user_123' } })
    checkRateLimitMock.mockResolvedValue(false)

    const response = await POST(createRequest(new File(['img'], 'photo.png', { type: 'image/png' })))

    expect(response.status).toBe(429)
    expect(s3SendMock).not.toHaveBeenCalled()
  })

  it('returns 415 for non-image uploads', async () => {
    authMock.mockResolvedValue({ user: { id: 'user_123' } })

    const response = await POST(
      createRequest(new File(['hello'], 'notes.txt', { type: 'text/plain' }))
    )

    expect(response.status).toBe(415)
    expect(s3SendMock).not.toHaveBeenCalled()
  })

  it('returns 413 for files larger than 5 MB', async () => {
    authMock.mockResolvedValue({ user: { id: 'user_123' } })
    const file = new File(['small'], 'cover.png', { type: 'image/png' })
    Object.defineProperty(file, 'size', { value: 5 * 1024 * 1024 + 1 })

    const response = await POST(createRequest(file))

    expect(response.status).toBe(413)
    expect(s3SendMock).not.toHaveBeenCalled()
  })

  it('uploads namespaced images to R2 and returns the public URL', async () => {
    authMock.mockResolvedValue({ user: { id: 'user_123' } })
    vi.spyOn(Date, 'now').mockReturnValue(1710000000000)
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('uuid-1234')

    const file = new File(['image'], 'My cover image!.png', { type: 'image/png' })
    const response = await POST(createRequest(file))

    expect(response.status).toBe(200)
    expect(s3SendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: 'quiz-images/user_123/1710000000000-uuid-1234-My-cover-image.png',
        Body: expect.any(Buffer),
        ContentType: 'image/png',
      })
    )
    await expect(response.json()).resolves.toEqual({
      url: 'https://images.example.com/quiz-images/user_123/1710000000000-uuid-1234-My-cover-image.png',
    })
  })

  it('preserves a safe extension when the original filename has no usable basename', async () => {
    authMock.mockResolvedValue({ user: { id: 'user_123' } })
    vi.spyOn(Date, 'now').mockReturnValue(1710000000000)
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('uuid-5678')

    const response = await POST(
      createRequest(new File(['image'], '!!!.png', { type: 'image/png' }))
    )

    expect(response.status).toBe(200)
    expect(s3SendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        Key: 'quiz-images/user_123/1710000000000-uuid-5678-image.png',
        Body: expect.any(Buffer),
        ContentType: 'image/png',
      })
    )
  })
})

