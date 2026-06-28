import type { Prisma } from '@prisma/client'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'
import { prisma } from '@/server/prisma'

const PAGE_SIZE = 25

function actionBadgeClass(action: string) {
  if (action.startsWith('REPORT_')) {
    return 'bg-destructive/15 text-destructive border-destructive/20'
  }
  if (action.startsWith('CATEGORY_')) {
    return 'bg-quiz-blue/15 text-quiz-blue border-quiz-blue/20'
  }
  if (action.startsWith('USER_') || action.startsWith('ROLE_')) {
    return 'bg-quiz-orange/15 text-quiz-orange border-quiz-orange/20'
  }
  if (action.startsWith('QUIZ_')) {
    return 'bg-quiz-green/15 text-quiz-green border-quiz-green/20'
  }
  return 'bg-muted text-muted-foreground'
}

function formatMeta(meta: Prisma.JsonValue) {
  if (meta == null) return '—'
  return JSON.stringify(meta, null, 2)
}

function buildAuditHref(page: number, actor: string, action: string) {
  const params = new URLSearchParams()
  if (page > 1) params.set('page', String(page))
  if (actor) params.set('actor', actor)
  if (action) params.set('action', action)
  const query = params.toString()
  return query ? `/admin/audit-log?${query}` : '/admin/audit-log'
}

export default async function AdminAuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; actor?: string; action?: string }>
}) {
  const { page, actor = '', action = '' } = await searchParams
  const requestedPageIndex = Math.max(0, Number.parseInt(page ?? '1', 10) - 1 || 0)
  const actorFilter = actor.trim()
  const actionFilter = action.trim()
  const hasFilters = Boolean(actorFilter || actionFilter)

  const where: Prisma.AdminActionWhereInput = {
    ...(actorFilter
      ? {
          actor: {
            OR: [{ name: { contains: actorFilter } }, { username: { contains: actorFilter } }],
          },
        }
      : {}),
    ...(actionFilter ? { action: { contains: actionFilter } } : {}),
  }

  const totalCount = await prisma.adminAction.count({ where })
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const pageIndex = Math.min(requestedPageIndex, totalPages - 1)
  const currentPage = pageIndex + 1
  const actions = await prisma.adminAction.findMany({
    where,
    include: { actor: { select: { name: true, username: true } } },
    orderBy: { createdAt: 'desc' },
    take: PAGE_SIZE,
    skip: pageIndex * PAGE_SIZE,
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Log" description={`${totalCount} recorded admin actions`} />

      <Card>
        <CardContent className="space-y-6 pt-6">
          <form className="grid gap-3 rounded-xl border border-border bg-muted/20 p-4 md:grid-cols-[1fr_1fr_auto_auto]">
            <input
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
              type="search"
              name="actor"
              placeholder="Filter by actor"
              defaultValue={actorFilter}
            />
            <input
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
              type="search"
              name="action"
              placeholder="Filter by action type"
              defaultValue={actionFilter}
            />
            <Button type="submit" variant="outline">
              Apply
            </Button>
            {hasFilters ? (
              <Link
                href="/admin/audit-log"
                className="rounded-md border border-border px-3 py-2 text-center text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Clear
              </Link>
            ) : null}
          </form>

          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/40 text-left text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Actor</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Target Type</th>
                  <th className="px-4 py-3">Target ID</th>
                  <th className="px-4 py-3">Meta</th>
                </tr>
              </thead>
              <tbody>
                {actions.map((actionRow) => (
                  <tr key={actionRow.id} className="border-t border-border align-top">
                    <td className="px-4 py-3 text-muted-foreground">
                      {actionRow.createdAt.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {actionRow.actor.username ? (
                        <Link
                          className="transition-colors hover:text-primary"
                          href={`/u/${actionRow.actor.username}`}
                        >
                          {actionRow.actor.name ?? 'Unknown admin'}
                          <span className="ml-1 text-muted-foreground">
                            (@{actionRow.actor.username})
                          </span>
                        </Link>
                      ) : (
                        <span>{actionRow.actor.name ?? 'Unknown admin'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={actionBadgeClass(actionRow.action)}>
                        {actionRow.action}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">{actionRow.targetType}</td>
                    <td className="px-4 py-3">{actionRow.targetId}</td>
                    <td className="px-4 py-3">
                      <pre className="max-h-44 overflow-auto whitespace-pre-wrap break-words font-mono text-xs text-muted-foreground">
                        {formatMeta(actionRow.meta)}
                      </pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {actions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No admin actions matched the current filters.
            </p>
          ) : null}

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              {currentPage > 1 ? (
                <Link
                  className="rounded-md border border-border px-3 py-2 transition-colors hover:bg-muted"
                  href={buildAuditHref(currentPage - 1, actorFilter, actionFilter)}
                >
                  Previous
                </Link>
              ) : (
                <span className="rounded-md border border-border px-3 py-2 text-muted-foreground">
                  Previous
                </span>
              )}
              {currentPage < totalPages ? (
                <Link
                  className="rounded-md border border-border px-3 py-2 transition-colors hover:bg-muted"
                  href={buildAuditHref(currentPage + 1, actorFilter, actionFilter)}
                >
                  Next
                </Link>
              ) : (
                <span className="rounded-md border border-border px-3 py-2 text-muted-foreground">
                  Next
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
