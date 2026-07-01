import { beforeEach, describe, expect, it, vi } from 'vitest'

const { canonicalPatchMock } = vi.hoisted(() => ({
  canonicalPatchMock: vi.fn(),
}))

vi.mock('@/app/api/profile/route', () => ({
  PATCH: canonicalPatchMock,
}))

import { PATCH } from '@/app/api/profile/profile/route'

function createRequest(body: unknown) {
  return new Request('http://localhost/api/profile/profile', {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('PATCH /api/profile/profile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    canonicalPatchMock.mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    )
  })

  it('delegates to canonical PATCH /api/profile handler', async () => {
    const request = createRequest({
      name: 'New Name',
      username: 'new-name',
    })

    const response = await PATCH(request)

    expect(response.status).toBe(200)
    expect(canonicalPatchMock).toHaveBeenCalledWith(request)
  })

  it('preserves canonical error responses', async () => {
    canonicalPatchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    )

    const response = await PATCH(createRequest({}))

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' })
  })
})
