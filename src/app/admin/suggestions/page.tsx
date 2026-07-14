import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'
import { cn } from '@/lib/utils'
import { prisma } from '@/server/prisma'
import { reviewCategorySuggestion } from '../actions'

const STATUS_OPTIONS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const

type StatusFilter = (typeof STATUS_OPTIONS)[number]

function buildStatusHref(status: StatusFilter) {
  if (status === 'PENDING') return '/admin/suggestions'
  return `/admin/suggestions?status=${status}`
}

export default async function AdminSuggestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const activeStatus = STATUS_OPTIONS.includes(status as StatusFilter)
    ? (status as StatusFilter)
    : 'PENDING'

  const [pending, approved, rejected, suggestions] = await Promise.all([
    prisma.categorySuggestion.count({ where: { status: 'PENDING' } }),
    prisma.categorySuggestion.count({ where: { status: 'APPROVED' } }),
    prisma.categorySuggestion.count({ where: { status: 'REJECTED' } }),
    prisma.categorySuggestion.findMany({
      where: activeStatus === 'ALL' ? undefined : { status: activeStatus },
      include: { suggestedBy: { select: { username: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
  ])

  const counts: Record<StatusFilter, number> = {
    ALL: pending + approved + rejected,
    PENDING: pending,
    APPROVED: approved,
    REJECTED: rejected,
  }
  const reviewAction = reviewCategorySuggestion as unknown as (formData: FormData) => Promise<void>

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suggestions"
        description={`${counts[activeStatus]} category suggestions in this view`}
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
        {suggestions.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              No suggestions found for this status.
            </CardContent>
          </Card>
        ) : (
          suggestions.map((suggestion) => (
            <Card key={suggestion.id}>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-start gap-4">
                  <span
                    className="mt-1 h-5 w-5 rounded-full border border-border"
                    style={{ background: suggestion.color }}
                  />
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold">{suggestion.name}</h2>
                      <Badge variant="outline">{suggestion.icon}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                    <p className="text-sm text-muted-foreground">
                      Suggested by{' '}
                      {suggestion.suggestedBy.username ? (
                        <Link
                          className="transition-colors hover:text-foreground"
                          href={`/u/${suggestion.suggestedBy.username}`}
                        >
                          @{suggestion.suggestedBy.username}
                        </Link>
                      ) : (
                        'Player'
                      )}{' '}
                      · {suggestion.createdAt.toLocaleString()}
                    </p>
                  </div>
                </div>

                {suggestion.status === 'PENDING' ? (
                  <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
                    <form action={reviewAction}>
                      <input name="suggestionId" type="hidden" value={suggestion.id} />
                      <input name="decision" type="hidden" value="APPROVE" />
                      <Button size="sm" type="submit">
                        Approve
                      </Button>
                    </form>
                    <form action={reviewAction} className="flex flex-1 flex-col gap-2 sm:flex-row">
                      <input name="suggestionId" type="hidden" value={suggestion.id} />
                      <input name="decision" type="hidden" value="REJECT" />
                      <input
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        name="reason"
                        placeholder="Reason for rejection"
                        required
                      />
                      <Button size="sm" type="submit" variant="destructive">
                        Reject
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
