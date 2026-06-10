import { beforeEach, describe, expect, it, vi } from 'vitest'
import worker from './index'

function createObject(body = 'image-bytes') {
  return {
    body: new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(body))
        controller.close()
      },
    }),
    httpEtag: '"etag-123"',
    writeHttpMetadata(headers: Headers) {
      headers.set('content-type', 'image/png')
    },
  }
}

describe('worker image proxy', () => {
  const get = vi.fn()

  beforeEach(() => {
    get.mockReset()
  })

  it('returns 405 for unsupported methods', async () => {
    const response = await worker.fetch(
      new Request('https://images.example.com/file.png', { method: 'POST' }),
      {
        R2_BUCKET: { get },
      }
    )

    expect(response.status).toBe(405)
    expect(get).not.toHaveBeenCalled()
  })

  it('returns 404 when the key is missing or the object does not exist', async () => {
    get.mockResolvedValueOnce(null)

    const missingKeyResponse = await worker.fetch(new Request('https://images.example.com/'), {
      R2_BUCKET: { get },
    })
    const missingObjectResponse = await worker.fetch(
      new Request('https://images.example.com/quiz-images/file.png'),
      {
        R2_BUCKET: { get },
      }
    )

    expect(missingKeyResponse.status).toBe(404)
    expect(missingObjectResponse.status).toBe(404)
    expect(get).toHaveBeenCalledWith('quiz-images/file.png')
  })

  it('serves GET requests with metadata and cache headers', async () => {
    get.mockResolvedValueOnce(createObject())

    const response = await worker.fetch(
      new Request('https://images.example.com/quiz-images/file.png'),
      {
        R2_BUCKET: { get },
      }
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('image/png')
    expect(response.headers.get('etag')).toBe('"etag-123"')
    expect(response.headers.get('cache-control')).toBe('public, max-age=31536000, immutable')
    await expect(response.text()).resolves.toBe('image-bytes')
  })

  it('serves HEAD requests without a response body', async () => {
    get.mockResolvedValueOnce(createObject())

    const response = await worker.fetch(
      new Request('https://images.example.com/quiz-images/file.png', { method: 'HEAD' }),
      {
        R2_BUCKET: { get },
      }
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('image/png')
    await expect(response.text()).resolves.toBe('')
  })
})
