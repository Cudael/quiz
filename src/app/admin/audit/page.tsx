import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'
import { prisma } from '@/server/prisma'

const PAGE_SIZE = 50

function actionBadgeClass(action: string) {
  if (action.startsWith('REPORT_')) {
    return 'bg-red-500/15 text-red-400 border-red-500/20'
  }
  if (action.startsWith('CATEGORY_')) {
    return 'bg-blue-500/15 text-blue-400 border-blue-500/20'
  }
  if (action.startsWith('USER_') || action.startsWith('ROLE_')) {
    return 'bg-amber-500/15 text-amber-400 border-amber-500/20'
  }
  if (action.startsWith('QUIZ_')) {
    return 'bg-quiz-green/15 text-quiz-green border-quiz-green/20'
  }
  return 'bg-muted text-muted-foreground'
}

function formatMeta(meta: string) {
  try {
    const parsed = JSON.parse(meta) as Record<string, unknown>
    const entries = Object.entries(parsed ?? {})
    if (entries.length === 0) {
      return '—'
    }
    return entries
      .map(([key, value]) => `${key}: ${typeof value === 'string' ? value : JSON.stringify(value)}`)
      .join(' · ')
  } catch {
    return meta || '—'
  }
}

function buildAuditHref(page: number) {
  return page > 1 ? `/admin/audit?page=${page}` : '/admin/audit'
}

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page } = await searchParams
  const pageIndex = Math.max(0, Number.parseInt(page ?? '1', 10) - 1 || 0)

  const [actions, totalCount] = await Promise.all([
    prisma.adminAction.findMany({
      include: { actor: { select: { name: true, username: true } } },
      orderBy: { createdAt: 'desc' },
      take: PAGE_SIZE,
      skip: pageIndex * PAGE_SIZE,
    }),
    prisma.adminAction.count(),
  ])

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const currentPage = pageIndex + 1

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Log" description={`${totalCount} recorded admin actions`} />

      <Card>
        <CardContent className="space-y-6 pt-6">
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/40 text-left text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Actor</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Target</th>
                  <th className="px-4 py-3">Meta</th>
                </tr>
              </thead>
              <tbody>
                {actions.map((action) => (
                  <tr key={action.id} className="border-t border-border align-top">
                    <td className="px-4 py-3 text-muted-foreground">
                      {action.createdAt.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {action.actor.username ? (
                        <Link
                          className="transition-colors hover:text-primary"
                          href={`/u/${action.actor.username}`}
                        >
                          {action.actor.name}
                        </Link>
                      ) : (
                        <span>{action.actor.name}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={actionBadgeClass(action.action)}>{action.action}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      {action.targetType} · {action.targetId}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatMeta(action.meta)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              {currentPage > 1 ? (
                <Link
                  className="rounded-md border border-border px-3 py-2 transition-colors hover:bg-muted"
                  href={buildAuditHref(currentPage - 1)}
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
                  href={buildAuditHref(currentPage + 1)}
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
