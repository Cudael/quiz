import { afterEach, describe, expect, it } from 'vitest'
import { GET } from './route'

const originalPublisherId = process.env.GOOGLE_ADSENSE_PUBLISHER_ID

afterEach(() => {
  if (originalPublisherId === undefined) {
    delete process.env.GOOGLE_ADSENSE_PUBLISHER_ID
  } else {
    process.env.GOOGLE_ADSENSE_PUBLISHER_ID = originalPublisherId
  }
})

describe('GET /ads.txt', () => {
  it('returns 404 until a valid publisher ID is configured', () => {
    delete process.env.GOOGLE_ADSENSE_PUBLISHER_ID
    const response = GET()

    expect(response.status).toBe(404)
  })

  it('returns the Google authorized-seller record', async () => {
    process.env.GOOGLE_ADSENSE_PUBLISHER_ID = 'ca-pub-1234567890123456'
    const response = GET()

    expect(response.status).toBe(200)
    expect(await response.text()).toBe(
      'google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0\n'
    )
  })
})
