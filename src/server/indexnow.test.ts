import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'

const originalEnv = process.env
const fetchMock = vi.fn()

async function loadIndexNow(env: Record<string, string | undefined>) {
  vi.resetModules()
  process.env = { ...originalEnv, ...env }
  return import('@/server/indexnow')
}

describe('indexnow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }))
  })

  afterAll(() => {
    process.env = originalEnv
    vi.unstubAllGlobals()
  })

  it('returns null for a missing or malformed key', async () => {
    const missing = await loadIndexNow({ INDEXNOW_KEY: undefined })
    expect(missing.getIndexNowKey()).toBeNull()

    const tooShort = await loadIndexNow({ INDEXNOW_KEY: 'short' })
    expect(tooShort.getIndexNowKey()).toBeNull()

    const badChars = await loadIndexNow({ INDEXNOW_KEY: 'not a valid key!' })
    expect(badChars.getIndexNowKey()).toBeNull()
  })

  it('does not ping without a configured key', async () => {
    const { notifyIndexNow } = await loadIndexNow({ INDEXNOW_KEY: undefined })

    await notifyIndexNow(['/quiz/some-quiz'])

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('does not ping from a localhost site URL', async () => {
    const { notifyIndexNow } = await loadIndexNow({
      INDEXNOW_KEY: 'abcdef1234567890',
      NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
    })

    await notifyIndexNow(['/quiz/some-quiz'])

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('posts the host, key, key location, and absolute URL list', async () => {
    const { notifyIndexNow } = await loadIndexNow({
      INDEXNOW_KEY: 'abcdef1234567890',
      NEXT_PUBLIC_SITE_URL: 'https://busquiz.com',
    })

    await notifyIndexNow(['/quiz/some-quiz', '/'])

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [endpoint, init] = fetchMock.mock.calls[0]
    expect(endpoint).toBe('https://api.indexnow.org/indexnow')
    expect(JSON.parse(init.body)).toEqual({
      host: 'busquiz.com',
      key: 'abcdef1234567890',
      keyLocation: 'https://busquiz.com/indexnow-key.txt',
      urlList: ['https://busquiz.com/quiz/some-quiz', 'https://busquiz.com/'],
    })
  })

  it('swallows network failures', async () => {
    fetchMock.mockRejectedValueOnce(new Error('offline'))
    const { notifyIndexNow } = await loadIndexNow({
      INDEXNOW_KEY: 'abcdef1234567890',
      NEXT_PUBLIC_SITE_URL: 'https://busquiz.com',
    })

    await expect(notifyIndexNow(['/quiz/some-quiz'])).resolves.toBeUndefined()
  })
})
