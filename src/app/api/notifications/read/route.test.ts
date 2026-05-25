import { beforeEach, describe, expect, it, vi } from 'vitest'

const { authMock, prismaMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  prismaMock: {
    notification: {
      updateMany: vi.fn(),
    },
  },
}))

vi.mock('@/server/auth', () => ({ auth: authMock }))
vi.mock('@/server/prisma', () => ({ prisma: prismaMock }))

import { PATCH } from '@/app/api/notifications/read/route'

function createPatchRequest(body: unknown) {
  return new Request('http://localhost/api/notifications/read', {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function createPatchRequestWithoutBody() {
  return new Request('http://localhost/api/notifications/read', {
    method: 'PATCH',
  })
}

describe('PATCH /api/notifications/read', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not signed in', async () => {
    authMock.mockResolvedValue(null)

    const response = await PATCH(createPatchRequest({ ids: ['n_1'] }))

    expect(response.status).toBe(401)
  })

  it('marks selected notification IDs as read when ids are provided', async () => {
    authMock.mockResolvedValue({ user: { id: 'user_1' } })
    prismaMock.notification.updateMany.mockResolvedValue({ count: 2 })

    const response = await PATCH(createPatchRequest({ ids: ['n_1', 'n_2'] }))
    const payload = (await response.json()) as { updated: number }

    expect(response.status).toBe(200)
    expect(prismaMock.notification.updateMany).toHaveBeenCalledWith({
      where: {
        userId: 'user_1',
        isRead: false,
        id: { in: ['n_1', 'n_2'] },
      },
      data: { isRead: true },
    })
    expect(payload.updated).toBe(2)
  })

  it('marks all unread notifications as read when ids is omitted or empty', async () => {
    authMock.mockResolvedValue({ user: { id: 'user_1' } })
    prismaMock.notification.updateMany.mockResolvedValue({ count: 4 })

    const emptyResponse = await PATCH(createPatchRequest({ ids: [] }))
    expect(emptyResponse.status).toBe(200)

    const omittedResponse = await PATCH(createPatchRequest({}))
    const payload = (await omittedResponse.json()) as { updated: number }
    expect(omittedResponse.status).toBe(200)

    expect(prismaMock.notification.updateMany).toHaveBeenNthCalledWith(1, {
      where: {
        userId: 'user_1',
        isRead: false,
      },
      data: { isRead: true },
    })
    expect(prismaMock.notification.updateMany).toHaveBeenNthCalledWith(2, {
      where: {
        userId: 'user_1',
        isRead: false,
      },
      data: { isRead: true },
    })
    expect(payload.updated).toBe(4)
  })

  it('marks all unread notifications as read when request body is empty', async () => {
    authMock.mockResolvedValue({ user: { id: 'user_1' } })
    prismaMock.notification.updateMany.mockResolvedValue({ count: 1 })

    const response = await PATCH(createPatchRequestWithoutBody())
    const payload = (await response.json()) as { updated: number }

    expect(response.status).toBe(200)
    expect(prismaMock.notification.updateMany).toHaveBeenCalledWith({
      where: {
        userId: 'user_1',
        isRead: false,
      },
      data: { isRead: true },
    })
    expect(payload.updated).toBe(1)
  })

  it('returns 400 for invalid payload', async () => {
    authMock.mockResolvedValue({ user: { id: 'user_1' } })

    const response = await PATCH(createPatchRequest({ ids: [42] }))

    expect(response.status).toBe(400)
  })
})
