import type { Prisma } from '@prisma/client'
import Link from 'next/link'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'
import { cn } from '@/lib/utils'
import { deleteUser, toggleUserRole } from './actions'

const PAGE_SIZE = 25

function buildUsersHref({ q, role, page }: { q?: string; role?: string; page: number }) {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (role && role !== 'ALL') params.set('role', role)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `/admin/users?${query}` : '/admin/users'
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; role?: string }>
}) {
  const [{ q, page, role }, session] = await Promise.all([searchParams, auth()])
  const pageIndex = Math.max(0, Number.parseInt(page ?? '1', 10) - 1 || 0)
  const roleFilterValue = role === 'ADMIN' || role === 'USER' ? role : 'ALL'

  const qFilter: Prisma.UserWhereInput = q
    ? {
        OR: [{ email: { contains: q } }, { username: { contains: q } }],
      }
    : {}

  const roleFilter: Prisma.UserWhereInput =
    roleFilterValue === 'ALL' ? {} : { role: roleFilterValue }

  const where: Prisma.UserWhereInput = {
    ...qFilter,
    ...roleFilter,
  }

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        xp: true,
        level: true,
        streakDays: true,
        createdAt: true,
        _count: { select: { sessions: true, quizzes: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: PAGE_SIZE,
      skip: pageIndex * PAGE_SIZE,
    }),
    prisma.user.count({ where }),
  ])

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const currentPage = pageIndex + 1
  const roleAction = toggleUserRole as unknown as (formData: FormData) => Promise<void>
  const deleteAction = deleteUser as unknown as (formData: FormData) => Promise<void>

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description={`${totalCount} users`} />

      <Card>
        <CardContent className="space-y-6 pt-6">
          <form className="flex flex-col gap-3 lg:flex-row" method="GET">
            <input
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              defaultValue={q ?? ''}
              name="q"
              placeholder="Search email/username"
              type="search"
            />
            <select
              className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              defaultValue={roleFilterValue}
              name="role"
            >
              <option value="ALL">All roles</option>
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
            <Button type="submit">Apply filters</Button>
          </form>

          <div className="overflow-x-auto rounded-md border border-border">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/40 text-left text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Level</th>
                  <th className="px-4 py-3">Plays</th>
                  <th className="px-4 py-3">Quizzes</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const nextRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN'
                  const isSelf = user.id === session?.user?.id

                  return (
                    <tr key={user.id} className="border-t border-border align-top">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar fallback={user.username ?? 'Player'} size="sm" />
                          <div>
                            <p className="font-medium">{user.username ?? 'Player'}</p>
                            <p className="text-xs text-muted-foreground">
                              {user.username ? `@${user.username}` : 'No username'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{user.email ?? '—'}</td>
                      <td className="px-4 py-3">
                        <Badge
                          className={cn(
                            user.role === 'ADMIN'
                              ? 'border-amber-500/20 bg-amber-500/15 text-amber-400'
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">Lvl {user.level}</div>
                        <div className="text-xs text-muted-foreground">
                          {user.xp.toLocaleString()} XP · {user.streakDays} day streak
                        </div>
                      </td>
                      <td className="px-4 py-3">{user._count.sessions}</td>
                      <td className="px-4 py-3">{user._count.quizzes}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {user.createdAt.toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <form action={roleAction}>
                            <input name="userId" type="hidden" value={user.id} />
                            <input name="newRole" type="hidden" value={nextRole} />
                            <Button size="sm" type="submit" variant="outline">
                              {user.role === 'ADMIN' ? 'Remove Admin' : 'Make Admin'}
                            </Button>
                          </form>
                          <form action={deleteAction}>
                            <input name="userId" type="hidden" value={user.id} />
                            <Button disabled={isSelf} size="sm" type="submit" variant="destructive">
                              Delete
                            </Button>
                          </form>
                          {user.username ? (
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/u/${user.username}`}>Profile</Link>
                            </Button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  )
                })}
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
                  href={buildUsersHref({ q, role: roleFilterValue, page: currentPage - 1 })}
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
                  href={buildUsersHref({ q, role: roleFilterValue, page: currentPage + 1 })}
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
