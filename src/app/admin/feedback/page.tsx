import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'
import { cn } from '@/lib/utils'
import { prisma } from '@/server/prisma'
import { updateFeedbackStatus } from '../actions'

const STATUS_OPTIONS = ['ALL', 'PENDING', 'REVIEWED', 'RESOLVED'] as const

type StatusFilter = (typeof STATUS_OPTIONS)[number]

function buildStatusHref(status: StatusFilter) {
  if (status === 'PENDING') return '/admin/feedback'
  return `/admin/feedback?status=${status}`
}

const TYPE_LABELS: Record<string, string> = {
  BUG_REPORT: 'Bug Report',
  FEATURE_REQUEST: 'Feature Request',
  GENERAL_FEEDBACK: 'General Feedback',
  CONTENT_ISSUE: 'Content Issue',
}

export default async function AdminFeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const activeStatus = STATUS_OPTIONS.includes(status as StatusFilter)
    ? (status as StatusFilter)
    : 'PENDING'

  const [pending, reviewed, resolved, feedbackItems] = await Promise.all([
    prisma.feedback.count({ where: { status: 'PENDING' } }),
    prisma.feedback.count({ where: { status: 'REVIEWED' } }),
    prisma.feedback.count({ where: { status: 'RESOLVED' } }),
    prisma.feedback.findMany({
      where: activeStatus === 'ALL' ? undefined : { status: activeStatus },
      include: {
        user: { select: { id: true, username: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
  ])

  const counts: Record<StatusFilter, number> = {
    ALL: pending + reviewed + resolved,
    PENDING: pending,
    REVIEWED: reviewed,
    RESOLVED: resolved,
  }
  const updateAction = updateFeedbackStatus as unknown as (formData: FormData) => Promise<void>

  return (
    <div className="space-y-6">
      <PageHeader
        title="Feedback"
        description={`${counts[activeStatus]} feedback items in this view`}
      />

      <div className="flex flex-wrap gap-4 border-b border-border">
        {STATUS_OPTIONS.map((option) => (
          <Link
            key={option}
            className={cn(
              'border-b-2 px-1 py-3 text-sm transition-colors',
              activeStatus === option
                ? 'border-primary font-semibold text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
            href={buildStatusHref(option)}
          >
            {option === 'ALL' ? 'All' : option.charAt(0) + option.slice(1).toLowerCase()} (
            {counts[option]})
          </Link>
        ))}
      </div>

      <div className="space-y-4">
        {feedbackItems.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              No feedback found for this status.
            </CardContent>
          </Card>
        ) : (
          feedbackItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="space-y-4 pt-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{TYPE_LABELS[item.type] ?? item.type}</Badge>
                      <span className="text-sm text-muted-foreground">
                        by{' '}
                        {item.user.username ? (
                          <Link
                            className="transition-colors hover:text-foreground"
                            href={`/u/${item.user.username}`}
                          >
                            @{item.user.username}
                          </Link>
                        ) : (
                          (item.user.username ?? 'Player')
                        )}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        · {item.createdAt.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/85 whitespace-pre-wrap">{item.message}</p>
                    {item.email && (
                      <p className="text-xs text-muted-foreground">Contact: {item.email}</p>
                    )}
                  </div>
                </div>

                {item.status === 'PENDING' ? (
                  <div className="flex flex-wrap gap-2">
                    <form action={updateAction}>
                      <input name="feedbackId" type="hidden" value={item.id} />
                      <input name="newStatus" type="hidden" value="REVIEWED" />
                      <Button size="sm" type="submit" variant="outline">
                        Mark as Reviewed
                      </Button>
                    </form>
                    <form action={updateAction}>
                      <input name="feedbackId" type="hidden" value={item.id} />
                      <input name="newStatus" type="hidden" value="RESOLVED" />
                      <Button size="sm" type="submit" variant="outline">
                        Mark as Resolved
                      </Button>
                    </form>
                  </div>
                ) : item.status === 'REVIEWED' ? (
                  <div className="flex flex-wrap gap-2">
                    <form action={updateAction}>
                      <input name="feedbackId" type="hidden" value={item.id} />
                      <input name="newStatus" type="hidden" value="RESOLVED" />
                      <Button size="sm" type="submit" variant="outline">
                        Mark as Resolved
                      </Button>
                    </form>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
