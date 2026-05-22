import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { resolveReport, reviewCategorySuggestion } from './actions'

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/api/auth/signin?callbackUrl=/admin')
  }
  if (session.user.role !== 'ADMIN') {
    redirect('/admin/forbidden')
  }

  const { tab } = await searchParams
  const activeTab = tab === 'reports' || tab === 'audit' ? tab : 'suggestions'

  const [suggestions, reports, auditLog] = await Promise.all([
    prisma.categorySuggestion.findMany({
      where: { status: 'PENDING' },
      include: { suggestedBy: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.report.findMany({
      include: {
        quiz: { select: { id: true, title: true } },
        reporter: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.adminAction.findMany({
      include: { actor: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
  ])

  return (
    <div className="container mx-auto px-4 py-10">
      <PageHeader title="Admin moderation queue" />

      <div className="mt-4 flex gap-2">
        <Button variant={activeTab === 'suggestions' ? 'default' : 'outline'} asChild>
          <Link href="/admin?tab=suggestions">Pending category suggestions</Link>
        </Button>
        <Button variant={activeTab === 'reports' ? 'default' : 'outline'} asChild>
          <Link href="/admin?tab=reports">Reported quizzes</Link>
        </Button>
        <Button variant={activeTab === 'audit' ? 'default' : 'outline'} asChild>
          <Link href="/admin?tab=audit">Audit log</Link>
        </Button>
      </div>

      {activeTab === 'suggestions' && (
        <div className="mt-6 space-y-3">
          {suggestions.length === 0 && (
            <EmptyState
              icon="📋"
              title="No pending suggestions."
              description="All category suggestions have been reviewed."
            />
          )}
          {suggestions.map((suggestion) => (
            <div key={suggestion.id} className="rounded-lg border p-4">
              <p className="font-semibold">
                {suggestion.name}{' '}
                <span className="text-xs text-muted-foreground">
                  by {suggestion.suggestedBy.name}
                </span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{suggestion.description}</p>
              <div className="mt-3 flex gap-2">
                <form
                  action={
                    reviewCategorySuggestion as unknown as (formData: FormData) => Promise<void>
                  }
                >
                  <input type="hidden" name="suggestionId" value={suggestion.id} />
                  <input type="hidden" name="decision" value="APPROVE" />
                  <Button size="sm" type="submit">
                    Approve
                  </Button>
                </form>
                <form
                  action={
                    reviewCategorySuggestion as unknown as (formData: FormData) => Promise<void>
                  }
                >
                  <input type="hidden" name="suggestionId" value={suggestion.id} />
                  <input type="hidden" name="decision" value="REJECT" />
                  <input
                    type="text"
                    name="reason"
                    placeholder="Rejection reason"
                    className="mr-2 rounded border px-2 py-1 text-xs"
                    required
                  />
                  <Button size="sm" variant="destructive" type="submit">
                    Reject
                  </Button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="mt-6 space-y-3">
          {reports.length === 0 && (
            <EmptyState
              icon="🚩"
              title="No reports."
              description="All quiz reports have been resolved."
            />
          )}
          {reports.map((report) => (
            <div key={report.id} className="rounded-lg border p-4">
              <p className="font-semibold">
                {report.quiz.title}{' '}
                <span className="text-xs text-muted-foreground">({report.reason})</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Reported by {report.reporter?.name ?? 'Unknown'} ·{' '}
                {report.createdAt.toLocaleString()}
              </p>
              {report.details && <p className="mt-2 text-sm">{report.details}</p>}
              <div className="mt-3 flex gap-2">
                <form action={resolveReport as unknown as (formData: FormData) => Promise<void>}>
                  <input type="hidden" name="reportId" value={report.id} />
                  <input type="hidden" name="resolution" value="DISMISS" />
                  <Button size="sm" variant="outline" type="submit">
                    Dismiss
                  </Button>
                </form>
                <form action={resolveReport as unknown as (formData: FormData) => Promise<void>}>
                  <input type="hidden" name="reportId" value={report.id} />
                  <input type="hidden" name="resolution" value="UNPUBLISH" />
                  <Button size="sm" variant="outline" type="submit">
                    Unpublish quiz
                  </Button>
                </form>
                <form action={resolveReport as unknown as (formData: FormData) => Promise<void>}>
                  <input type="hidden" name="reportId" value={report.id} />
                  <input type="hidden" name="resolution" value="DELETE" />
                  <Button size="sm" variant="destructive" type="submit">
                    Delete quiz
                  </Button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="mt-6 overflow-x-auto rounded-lg border">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-2 text-left">When</th>
                <th className="px-4 py-2 text-left">Actor</th>
                <th className="px-4 py-2 text-left">Action</th>
                <th className="px-4 py-2 text-left">Target</th>
              </tr>
            </thead>
            <tbody>
              {auditLog.map((action) => (
                <tr key={action.id} className="border-t">
                  <td className="px-4 py-2">{action.createdAt.toLocaleString()}</td>
                  <td className="px-4 py-2">{action.actor.name}</td>
                  <td className="px-4 py-2">{action.action}</td>
                  <td className="px-4 py-2">
                    {action.targetType} · {action.targetId}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
