import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Globe, ListMusic, Lock } from 'lucide-react'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { QuizCard } from '@/components/ui/quiz-card'
import { absoluteUrl } from '@/lib/site'
import { removeFromPlaylist } from '../actions'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const playlist = await prisma.playlist.findUnique({
    where: { slug },
    select: { title: true, description: true, isPublic: true },
  })
  if (!playlist || !playlist.isPublic) {
    return { title: 'Playlist', robots: { index: false } }
  }
  const title = `${playlist.title} — Quiz Playlist`
  const description = playlist.description ?? `A hand-picked playlist of quizzes: ${playlist.title}`
  return {
    title,
    description,
    alternates: { canonical: `/playlists/${slug}` },
    openGraph: {
      title,
      description,
      url: absoluteUrl(`/playlists/${slug}`),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function PlaylistPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const session = await auth()

  const playlist = await prisma.playlist.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      description: true,
      isPublic: true,
      ownerId: true,
      owner: { select: { name: true, username: true } },
      items: {
        orderBy: { order: 'asc' },
        select: {
          quiz: {
            select: {
              id: true,
              title: true,
              slug: true,
              difficulty: true,
              coverImage: true,
              playCount: true,
              avgScore: true,
              isPublished: true,
              category: { select: { name: true, color: true } },
            },
          },
        },
      },
    },
  })

  if (!playlist) notFound()

  const isOwner = playlist.ownerId === session?.user?.id || session?.user?.role === 'ADMIN'
  if (!playlist.isPublic && !isOwner) notFound()

  const quizzes = playlist.items.map((item) => item.quiz).filter((quiz) => quiz.isPublished)
  const removeAction = removeFromPlaylist as unknown as (formData: FormData) => Promise<void>

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <ListMusic className="h-5 w-5 text-quiz-purple-light" />
          <h1 className="text-2xl font-extrabold">{playlist.title}</h1>
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
        {playlist.description ? (
          <p className="text-sm text-muted-foreground">{playlist.description}</p>
        ) : null}
        <p className="text-xs text-muted-foreground">
          {quizzes.length} quiz{quizzes.length === 1 ? '' : 'zes'}
          {playlist.owner.username ? (
            <>
              {' · by '}
              <Link className="hover:underline" href={`/u/${playlist.owner.username}`}>
                {playlist.owner.name ?? playlist.owner.username}
              </Link>
            </>
          ) : playlist.owner.name ? (
            ` · by ${playlist.owner.name}`
          ) : null}
        </p>
      </div>

      {quizzes.length === 0 ? (
        <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          This playlist is empty{isOwner ? ' — add quizzes from any quiz page.' : '.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="flex flex-col gap-1">
              <QuizCard quiz={quiz} />
              {isOwner ? (
                <form action={removeAction} className="self-end">
                  <input name="playlistId" type="hidden" value={playlist.id} />
                  <input name="quizId" type="hidden" value={quiz.id} />
                  <Button size="sm" type="submit" variant="ghost">
                    Remove
                  </Button>
                </form>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
