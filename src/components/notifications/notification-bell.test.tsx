import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { pushMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

import { NotificationBell } from '@/components/notifications/notification-bell'

describe('NotificationBell', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders fetched notifications and marks all as read', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json({
          notifications: [
            {
              id: 'n_1',
              type: 'BADGE_EARNED',
              title: 'New badge',
              message: 'You earned Quiz Rookie',
              isRead: false,
              meta: '{"badgeId":"b_1"}',
              createdAt: new Date().toISOString(),
            },
          ],
          unreadCount: 1,
        })
      )
      .mockResolvedValueOnce(
        Response.json({
          notifications: [
            {
              id: 'n_1',
              type: 'BADGE_EARNED',
              title: 'New badge',
              message: 'You earned Quiz Rookie',
              isRead: false,
              meta: '{"badgeId":"b_1"}',
              createdAt: new Date().toISOString(),
            },
          ],
          unreadCount: 1,
        })
      )
      .mockResolvedValueOnce(Response.json({ updated: 1 }))

    vi.stubGlobal('fetch', fetchMock)

    render(<NotificationBell />)

    const trigger = await screen.findByRole('button', { name: 'Open notifications' })
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/notifications', { cache: 'no-store' })
    })

    fireEvent.pointerDown(trigger)

    expect(await screen.findByText('Notifications')).toBeInTheDocument()
    expect(await screen.findByText('New badge')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Mark all read' }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/notifications/read', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({}),
      })
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Mark all read' })).toBeDisabled()
    })
  })

  it('marks one notification as read and navigates from notification meta', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json({
          notifications: [
            {
              id: 'n_2',
              type: 'NEW_FOLLOWER',
              title: 'New follower',
              message: 'alice started following you',
              isRead: false,
              meta: { username: 'alice' },
              createdAt: new Date().toISOString(),
            },
          ],
          unreadCount: 1,
        })
      )
      .mockResolvedValueOnce(
        Response.json({
          notifications: [
            {
              id: 'n_2',
              type: 'NEW_FOLLOWER',
              title: 'New follower',
              message: 'alice started following you',
              isRead: false,
              meta: { username: 'alice' },
              createdAt: new Date().toISOString(),
            },
          ],
          unreadCount: 1,
        })
      )
      .mockResolvedValueOnce(Response.json({ updated: 1 }))

    vi.stubGlobal('fetch', fetchMock)

    render(<NotificationBell />)

    const trigger = await screen.findByRole('button', { name: 'Open notifications' })
    fireEvent.pointerDown(trigger)

    fireEvent.click(await screen.findByText('New follower'))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/notifications/read', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ids: ['n_2'] }),
      })
    })
    expect(pushMock).toHaveBeenCalledWith('/u/alice')
  })
})
