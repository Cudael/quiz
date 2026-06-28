'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Award, Bell, PlayCircle, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/components/ui/empty-state'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type NotificationType = 'BADGE_EARNED' | 'NEW_FOLLOWER' | 'QUIZ_PLAYED'

interface NotificationItem {
  id: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  meta: Record<string, unknown> | null
  createdAt: string
}

interface NotificationsResponse {
  notifications: NotificationItem[]
  unreadCount: number
}

function formatRelativeTime(timestamp: string) {
  const then = new Date(timestamp).getTime()
  if (Number.isNaN(then)) {
    return ''
  }

  const deltaSeconds = Math.floor((Date.now() - then) / 1000)
  if (deltaSeconds < 60) {
    return 'just now'
  }

  const steps = [
    { unit: 'year', seconds: 60 * 60 * 24 * 365 },
    { unit: 'month', seconds: 60 * 60 * 24 * 30 },
    { unit: 'week', seconds: 60 * 60 * 24 * 7 },
    { unit: 'day', seconds: 60 * 60 * 24 },
    { unit: 'hour', seconds: 60 * 60 },
    { unit: 'minute', seconds: 60 },
  ] as const

  for (const step of steps) {
    if (deltaSeconds >= step.seconds) {
      const value = Math.floor(deltaSeconds / step.seconds)
      return new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' }).format(-value, step.unit)
    }
  }

  return 'just now'
}

function parseMeta(meta: Record<string, unknown> | null): Record<string, unknown> | null {
  return meta && typeof meta === 'object' ? meta : null
}

function getNotificationHref(notification: NotificationItem) {
  if (notification.type === 'BADGE_EARNED') {
    return '/profile'
  }

  const meta = parseMeta(notification.meta)
  if (!meta) {
    return null
  }

  if (notification.type === 'NEW_FOLLOWER') {
    const username = meta.username
    return typeof username === 'string' && username.trim().length > 0 ? `/u/${username}` : null
  }

  if (notification.type === 'QUIZ_PLAYED') {
    const quizId = meta.quizId ?? meta.id
    return typeof quizId === 'string' && quizId.trim().length > 0 ? `/quiz/${quizId}` : null
  }

  return null
}

function notificationIcon(type: NotificationType) {
  if (type === 'BADGE_EARNED') return Award
  if (type === 'NEW_FOLLOWER') return UserPlus
  return PlayCircle
}

export function NotificationBell() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [markingAll, setMarkingAll] = useState(false)

  async function fetchNotifications() {
    setLoading(true)
    try {
      const response = await fetch('/api/notifications', { cache: 'no-store' })
      if (!response.ok) {
        return
      }
      const data = (await response.json()) as NotificationsResponse
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      void fetchNotifications()
    }, 0)

    return () => clearTimeout(timeout)
  }, [])

  async function markAsRead(ids?: string[]) {
    const response = await fetch('/api/notifications/read', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(ids && ids.length > 0 ? { ids } : {}),
    })

    if (!response.ok) {
      throw new Error('Failed to mark notifications as read')
    }
  }

  async function handleMarkAllRead() {
    if (unreadCount === 0 || markingAll) return

    const previousNotifications = notifications
    const previousUnreadCount = unreadCount

    setMarkingAll(true)
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, isRead: true }))
    )
    setUnreadCount(0)

    try {
      await markAsRead()
    } catch {
      setNotifications(previousNotifications)
      setUnreadCount(previousUnreadCount)
    } finally {
      setMarkingAll(false)
    }
  }

  async function handleSelect(notification: NotificationItem) {
    const href = getNotificationHref(notification)

    if (!notification.isRead) {
      setNotifications((current) =>
        current.map((item) => (item.id === notification.id ? { ...item, isRead: true } : item))
      )
      setUnreadCount((current) => Math.max(0, current - 1))

      try {
        await markAsRead([notification.id])
      } catch {
        await fetchNotifications()
      }
    }

    if (href) {
      setOpen(false)
      router.push(href)
    }
  }

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (nextOpen) {
          void fetchNotifications()
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open notifications"
          className="relative inline-flex h-8 w-8 items-center justify-center rounded-md border border-foreground/25 hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 ? (
            <span className="absolute -right-1.5 -top-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          ) : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[24rem] max-w-[calc(100vw-2rem)] p-0">
        <div className="flex items-center justify-between border-b border-foreground/15 px-3 py-2">
          <p className="text-sm font-semibold">Notifications</p>
          <button
            type="button"
            onClick={() => void handleMarkAllRead()}
            disabled={unreadCount === 0 || markingAll}
            className="text-xs font-medium text-foreground/70 hover:text-foreground disabled:cursor-not-allowed disabled:text-muted-foreground"
          >
            Mark all read
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-1">
          {loading ? null : notifications.length === 0 ? (
            <EmptyState
              icon={<Bell className="h-6 w-6 text-muted-foreground" />}
              title="No notifications yet"
              description="When something happens, you'll see it here."
              className="m-2 px-4 py-8"
            />
          ) : (
            notifications.map((notification, index) => {
              const Icon = notificationIcon(notification.type)
              return (
                <DropdownMenuItem
                  key={notification.id}
                  onSelect={(event) => {
                    event.preventDefault()
                    void handleSelect(notification)
                  }}
                  className={cn(
                    'group cursor-pointer items-start gap-3 rounded-md p-3',
                    !notification.isRead && 'bg-accent/40',
                    index < notifications.length - 1 && 'mb-1'
                  )}
                >
                  <div className="mt-0.5 rounded-md bg-muted p-1.5 text-muted-foreground">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-1 text-sm font-semibold text-foreground">
                        {notification.title}
                      </p>
                      {!notification.isRead ? (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                      ) : null}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {notification.message}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {formatRelativeTime(notification.createdAt)}
                    </p>
                  </div>
                </DropdownMenuItem>
              )
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
