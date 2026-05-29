import { beforeEach, describe, expect, it, vi } from 'vitest'

const { authMock, putMock, checkRateLimitMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  putMock: vi.fn(),
  checkRateLimitMock: vi.fn().mockResolvedValue(true),
}))

vi.mock('@/server/auth', () => ({ auth: authMock }))
vi.mock('@vercel/blob', () => ({ put: putMock }))
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
  })

  it('returns 401 when the user is not authenticated', async () => {
    authMock.mockResolvedValue(null)

    const response = await POST(createRequest())

    expect(response.status).toBe(401)
    expect(putMock).not.toHaveBeenCalled()
  })

  it('returns 415 for non-image uploads', async () => {
    authMock.mockResolvedValue({ user: { id: 'user_123' } })

    const response = await POST(
      createRequest(new File(['hello'], 'notes.txt', { type: 'text/plain' }))
    )

    expect(response.status).toBe(415)
    expect(putMock).not.toHaveBeenCalled()
  })

  it('returns 413 for files larger than 5 MB', async () => {
    authMock.mockResolvedValue({ user: { id: 'user_123' } })
    const file = new File(['small'], 'cover.png', { type: 'image/png' })
    Object.defineProperty(file, 'size', { value: 5 * 1024 * 1024 + 1 })

    const response = await POST(createRequest(file))

    expect(response.status).toBe(413)
    expect(putMock).not.toHaveBeenCalled()
  })

  it('uploads namespaced images to Vercel Blob and returns the public URL', async () => {
    authMock.mockResolvedValue({ user: { id: 'user_123' } })
    putMock.mockResolvedValue({
      url: 'https://blob.vercel-storage.com/quiz-images/user_123/cover.png',
    })
    vi.spyOn(Date, 'now').mockReturnValue(1710000000000)
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('uuid-1234')

    const file = new File(['image'], 'My cover image!.png', { type: 'image/png' })
    const response = await POST(createRequest(file))

    expect(response.status).toBe(200)
    expect(putMock).toHaveBeenCalledWith(
      'quiz-images/user_123/1710000000000-uuid-1234-My-cover-image.png',
      file,
      {
        access: 'public',
        addRandomSuffix: false,
      }
    )
    await expect(response.json()).resolves.toEqual({
      url: 'https://blob.vercel-storage.com/quiz-images/user_123/cover.png',
    })
  })

  it('preserves a safe extension when the original filename has no usable basename', async () => {
    authMock.mockResolvedValue({ user: { id: 'user_123' } })
    putMock.mockResolvedValue({
      url: 'https://blob.vercel-storage.com/quiz-images/user_123/image.png',
    })
    vi.spyOn(Date, 'now').mockReturnValue(1710000000000)
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('uuid-5678')

    const response = await POST(
      createRequest(new File(['image'], '!!!.png', { type: 'image/png' }))
    )

    expect(response.status).toBe(200)
    expect(putMock).toHaveBeenCalledWith(
      'quiz-images/user_123/1710000000000-uuid-5678-image.png',
      expect.any(File),
      {
        access: 'public',
        addRandomSuffix: false,
      }
    )
  })
})
