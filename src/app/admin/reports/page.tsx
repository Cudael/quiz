import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'
import { cn } from '@/lib/utils'
import { prisma } from '@/server/prisma'
import { resolveReport } from '../actions'
import { getDisplayAuthorName } from '@/lib/author-display'
import { getQuizPath } from '@/lib/quiz-url'

const STATUS_OPTIONS = ['ALL', 'PENDING', 'DISMISSED', 'ACTIONED'] as const

type StatusFilter = (typeof STATUS_OPTIONS)[number]

function buildStatusHref(status: StatusFilter) {
  if (status === 'PENDING') return '/admin/reports'
  return `/admin/reports?status=${status}`
}

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const activeStatus = STATUS_OPTIONS.includes(status as StatusFilter)
    ? (status as StatusFilter)
    : 'PENDING'

  const [pending, dismissed, actioned, reports] = await Promise.all([
    prisma.report.count({ where: { status: 'PENDING' } }),
    prisma.report.count({ where: { status: 'DISMISSED' } }),
    prisma.report.count({ where: { status: 'ACTIONED' } }),
    prisma.report.findMany({
      where: activeStatus === 'ALL' ? undefined : { status: activeStatus },
      include: {
        quiz: {
          select: {
            id: true,
            slug: true,
            title: true,
            author: { select: { username: true, role: true } },
          },
        },
        comment: {
          select: {
            id: true,
            body: true,
            isHidden: true,
            author: { select: { username: true } },
          },
        },
        question: {
          select: { id: true, prompt: true },
        },
        reporter: { select: { username: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
  ])

  const counts: Record<StatusFilter, number> = {
    ALL: pending + dismissed + actioned,
    PENDING: pending,
    DISMISSED: dismissed,
    ACTIONED: actioned,
  }
  const resolveAction = resolveReport as unknown as (formData: FormData) => Promise<void>

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description={`${counts[activeStatus]} reports in this view`} />

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
        {reports.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              No reports found for this status.
            </CardContent>
          </Card>
        ) : (
          reports.map((report) => (
            <Card key={report.id}>
              <CardContent className="space-y-4 pt-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <Link
                      className="text-lg font-semibold transition-colors hover:text-primary"
                      href={getQuizPath({ id: report.quiz.id, slug: report.quiz.slug })}
                    >
                      {report.quiz.title}
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline">{report.reason}</Badge>
                      {report.comment ? <Badge variant="purple">Comment</Badge> : null}
                      {report.question ? <Badge variant="warning">Question report</Badge> : null}
                      <span>
                        by{' '}
                        {report.reporter?.username ? (
                          <Link
                            className="transition-colors hover:text-foreground"
                            href={`/u/${report.reporter.username}`}
                          >
                            @{report.reporter.username}
                          </Link>
                        ) : (
                          (report.reporter?.username ?? 'Unknown')
                        )}
                      </span>
                      <span>· {report.createdAt.toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {report.details ?? 'No extra details provided.'}
                    </p>
                    {report.comment ? (
                      <blockquote className="rounded-md border-l-2 border-border bg-muted/40 px-3 py-2 text-sm">
                        <span className="font-medium">
                          {report.comment.author.username ?? 'Unknown'}:
                        </span>{' '}
                        {report.comment.body}
                        {report.comment.isHidden ? (
                          <Badge className="ml-2" variant="warning">
                            Hidden
                          </Badge>
                        ) : null}
                      </blockquote>
                    ) : null}
                    {report.question ? (
                      <blockquote className="rounded-md border-l-2 border-border bg-muted/40 px-3 py-2 text-sm">
                        <span className="font-medium">Question:</span> {report.question.prompt}
                      </blockquote>
                    ) : null}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Author:{' '}
                    {report.quiz.author.username ? (
                      <Link
                        className="transition-colors hover:text-foreground"
                        href={`/u/${report.quiz.author.username}`}
                      >
                        {getDisplayAuthorName(report.quiz.author)}
                      </Link>
                    ) : (
                      getDisplayAuthorName(report.quiz.author)
                    )}
                  </div>
                </div>

                {report.status === 'PENDING' ? (
                  <div className="flex flex-wrap gap-2">
                    <form action={resolveAction}>
                      <input name="reportId" type="hidden" value={report.id} />
                      <input name="resolution" type="hidden" value="DISMISS" />
                      <Button size="sm" type="submit" variant="outline">
                        Dismiss
                      </Button>
                    </form>
                    {report.comment ? (
                      <>
                        <form action={resolveAction}>
                          <input name="reportId" type="hidden" value={report.id} />
                          <input name="resolution" type="hidden" value="HIDE_COMMENT" />
                          <Button size="sm" type="submit" variant="outline">
                            Hide Comment
                          </Button>
                        </form>
                        <form action={resolveAction}>
                          <input name="reportId" type="hidden" value={report.id} />
                          <input name="resolution" type="hidden" value="DELETE_COMMENT" />
                          <Button size="sm" type="submit" variant="destructive">
                            Delete Comment
                          </Button>
                        </form>
                      </>
                    ) : (
                      <>
                        <form action={resolveAction}>
                          <input name="reportId" type="hidden" value={report.id} />
                          <input name="resolution" type="hidden" value="UNPUBLISH" />
                          <Button size="sm" type="submit" variant="outline">
                            Unpublish Quiz
                          </Button>
                        </form>
                        <form action={resolveAction}>
                          <input name="reportId" type="hidden" value={report.id} />
                          <input name="resolution" type="hidden" value="DELETE" />
                          <Button size="sm" type="submit" variant="destructive">
                            Delete Quiz
                          </Button>
                        </form>
                      </>
                    )}
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
