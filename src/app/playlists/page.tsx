import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Globe, ListMusic, Lock } from 'lucide-react'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CreatePlaylistForm } from './_components/create-playlist-form'
import { deletePlaylist } from './actions'

export const metadata: Metadata = {
  title: 'My Playlists',
  robots: { index: false },
}

export const dynamic = 'force-dynamic'

export default async function PlaylistsPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/api/auth/signin?callbackUrl=/playlists')
  }

  const playlists = await prisma.playlist.findMany({
    where: { ownerId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      isPublic: true,
      updatedAt: true,
      _count: { select: { items: true } },
    },
  })

  const deleteAction = deletePlaylist as unknown as (formData: FormData) => Promise<void>

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6">
        <div className="mb-1 flex items-center gap-2">
          <ListMusic className="h-5 w-5 text-quiz-purple-light" />
          <h1 className="text-2xl font-extrabold">My Playlists</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Group your favourite quizzes into playlists and share them with friends.
        </p>
      </div>

      <div className="mb-6">
        <CreatePlaylistForm />
      </div>

      {playlists.length === 0 ? (
        <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          No playlists yet. Create one above, then add quizzes from any quiz page.
        </p>
      ) : (
        <ul className="space-y-3">
          {playlists.map((playlist) => (
            <li
              key={playlist.id}
              className="flex flex-col gap-3 rounded-md border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link className="font-bold hover:underline" href={`/playlists/${playlist.slug}`}>
                    {playlist.title}
                  </Link>
                  <Badge variant="outline">
                    {playlist.isPublic ? (
                      <>
                        <Globe className="mr-1 h-3 w-3" /> Public
                      </>
                    ) : (
                      <>
                        <Lock className="mr-1 h-3 w-3" /> Private
                      </>
                    )}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {playlist._count.items} quiz{playlist._count.items === 1 ? '' : 'zes'}
                  {playlist.description ? ` · ${playlist.description}` : ''}
                </p>
              </div>
              <form action={deleteAction}>
                <input name="playlistId" type="hidden" value={playlist.id} />
                <Button size="sm" type="submit" variant="ghost">
                  Delete
                </Button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
