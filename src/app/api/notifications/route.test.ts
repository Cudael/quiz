import { beforeEach, describe, expect, it, vi } from 'vitest'

const { authMock, prismaMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  prismaMock: {
    notification: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}))

vi.mock('@/server/auth', () => ({ auth: authMock }))
vi.mock('@/server/prisma', () => ({ prisma: prismaMock }))

import { GET } from '@/app/api/notifications/route'

describe('GET /api/notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not signed in', async () => {
    authMock.mockResolvedValue(null)

    const response = await GET()

    expect(response.status).toBe(401)
  })

  it('returns latest notifications and unread count for the current user', async () => {
    authMock.mockResolvedValue({ user: { id: 'user_1' } })
    prismaMock.notification.findMany.mockResolvedValue([
      {
        id: 'n_1',
        userId: 'user_1',
        type: 'BADGE_EARNED',
        title: 'Badge earned',
        message: 'You earned a new badge.',
        isRead: false,
        meta: '{"badgeId":"b_1"}',
        createdAt: new Date('2026-05-25T10:00:00Z'),
      },
    ])
    prismaMock.notification.count.mockResolvedValue(3)

    const response = await GET()
    const payload = (await response.json()) as {
      notifications: Array<{ id: string }>
      unreadCount: number
    }

    expect(response.status).toBe(200)
    expect(prismaMock.notification.findMany).toHaveBeenCalledWith({
      where: { userId: 'user_1' },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })
    expect(prismaMock.notification.count).toHaveBeenCalledWith({
      where: { userId: 'user_1', isRead: false },
    })
    expect(payload.notifications).toHaveLength(1)
    expect(payload.unreadCount).toBe(3)
  })
})
