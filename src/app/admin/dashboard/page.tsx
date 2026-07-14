import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { BookOpen, EyeOff, Flag, Lightbulb, Play, TrendingUp, UserPlus, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'
import { prisma } from '@/server/prisma'

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
    return 'bg-quiz-orange/10 text-quiz-orange'
  }
  return 'bg-muted text-muted-foreground'
}

export default async function AdminDashboardPage() {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const lastSevenDaysStart = new Date(todayStart)
  lastSevenDaysStart.setDate(lastSevenDaysStart.getDate() - 7)

  const [
    totalUsers,
    publishedQuizzes,
    unpublishedQuizzes,
    totalPlays,
    playsToday,
    pendingReports,
    pendingSuggestions,
    newUsers,
    recentActions,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.quiz.count({ where: { isPublished: true } }),
    prisma.quiz.count({ where: { isPublished: false } }),
    prisma.playSession.count(),
    prisma.playSession.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.report.count({ where: { status: 'PENDING' } }),
    prisma.categorySuggestion.count({ where: { status: 'PENDING' } }),
    prisma.user.count({ where: { createdAt: { gte: lastSevenDaysStart } } }),
    prisma.adminAction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { actor: { select: { username: true } } },
    }),
  ])

  const stats: Array<{ label: string; value: number; Icon: LucideIcon; iconClass: string }> = [
    {
      label: 'Total Users',
      value: totalUsers,
      Icon: Users,
      iconClass: 'bg-quiz-orange/10 text-quiz-orange',
    },
    {
      label: 'Published Quizzes',
      value: publishedQuizzes,
      Icon: BookOpen,
      iconClass: 'bg-muted text-muted-foreground',
    },
    {
      label: 'Total Plays',
      value: totalPlays,
      Icon: Play,
      iconClass: 'bg-muted text-muted-foreground',
    },
    {
      label: 'Plays Today',
      value: playsToday,
      Icon: TrendingUp,
      iconClass: 'bg-quiz-orange/10 text-quiz-orange',
    },
    {
      label: 'Pending Reports',
      value: pendingReports,
      Icon: Flag,
      iconClass: 'bg-destructive/15 text-destructive',
    },
    {
      label: 'Pending Suggestions',
      value: pendingSuggestions,
      Icon: Lightbulb,
      iconClass: 'bg-quiz-orange/15 text-quiz-orange',
    },
    {
      label: 'New Users (7d)',
      value: newUsers,
      Icon: UserPlus,
      iconClass: 'bg-quiz-green/15 text-quiz-green',
    },
    {
      label: 'Unpublished Quizzes',
      value: unpublishedQuizzes,
      Icon: EyeOff,
      iconClass: 'bg-muted text-muted-foreground',
    },
  ]

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Key admin metrics, moderation queues, and the latest activity in one place."
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map(({ label, value, Icon, iconClass }) => (
          <Card key={label}>
            <CardContent className="flex items-start gap-4 pt-6">
              <div className={`flex h-10 w-10 items-center justify-center rounded-md ${iconClass}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-3xl font-bold">{value.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold">Recent Actions</h2>
              <Link
                href="/admin/audit-log"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                View all →
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              The latest five admin actions across the site.
            </p>
          </div>

          {recentActions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No admin actions have been recorded yet.
            </p>
          ) : (
            <div className="space-y-3">
              {recentActions.map((action) => (
                <div
                  key={action.id}
                  className="flex flex-col gap-2 rounded-md border border-border bg-background px-4 py-3 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-medium">{action.actor.username ?? 'Unknown admin'}</p>
                    <p className="text-sm text-muted-foreground">
                      {action.targetType} · {action.targetId}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={actionBadgeClass(action.action)}>{action.action}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {action.createdAt.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
