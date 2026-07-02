'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'
import { generateUniqueSlug } from '@/lib/slugify'

const MAX_PLAYLISTS_PER_USER = 20
const MAX_ITEMS_PER_PLAYLIST = 100

type PlaylistResult =
  | { ok: true; playlistId?: string; slug?: string }
  | {
      ok: false
      error: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'LIMIT'
      message: string
    }

const createPlaylistSchema = z.object({
  title: z.string().trim().min(2).max(80),
  description: z.string().trim().max(300).optional(),
  isPublic: z.boolean().default(true),
})

export async function createPlaylist(formData: FormData): Promise<PlaylistResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'UNAUTHORIZED', message: 'Please sign in.' }
  }

  const parsed = createPlaylistSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    isPublic: formData.get('isPublic') !== 'false',
  })
  if (!parsed.success) {
    return {
      ok: false,
      error: 'VALIDATION_ERROR',
      message: 'Give your playlist a name (2-80 characters).',
    }
  }

  const count = await prisma.playlist.count({ where: { ownerId: session.user.id } })
  if (count >= MAX_PLAYLISTS_PER_USER) {
    return {
      ok: false,
      error: 'LIMIT',
      message: `You can have at most ${MAX_PLAYLISTS_PER_USER} playlists.`,
    }
  }

  const slug = await generateUniqueSlug(parsed.data.title, (s) =>
    prisma.playlist.findUnique({ where: { slug: s } }).then((p) => !!p)
  )

  const playlist = await prisma.playlist.create({
    data: {
      slug,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      isPublic: parsed.data.isPublic,
      ownerId: session.user.id,
    },
    select: { id: true, slug: true },
  })

  revalidatePath('/playlists')
  return { ok: true, playlistId: playlist.id, slug: playlist.slug }
}

export async function deletePlaylist(formData: FormData): Promise<PlaylistResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'UNAUTHORIZED', message: 'Please sign in.' }
  }

  const playlistId = z.string().cuid().safeParse(formData.get('playlistId'))
  if (!playlistId.success) {
    return { ok: false, error: 'VALIDATION_ERROR', message: 'Invalid playlist.' }
  }

  const playlist = await prisma.playlist.findUnique({
    where: { id: playlistId.data },
    select: { ownerId: true },
  })
  if (!playlist) {
    return { ok: false, error: 'NOT_FOUND', message: 'Playlist not found.' }
  }
  if (playlist.ownerId !== session.user.id && session.user.role !== 'ADMIN') {
    return { ok: false, error: 'FORBIDDEN', message: 'Not allowed.' }
  }

  await prisma.playlist.delete({ where: { id: playlistId.data } })
  revalidatePath('/playlists')
  return { ok: true }
}

const itemSchema = z.object({
  playlistId: z.string().cuid(),
  quizId: z.string().cuid(),
})

export async function addToPlaylist(formData: FormData): Promise<PlaylistResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'UNAUTHORIZED', message: 'Please sign in.' }
  }

  const parsed = itemSchema.safeParse({
    playlistId: formData.get('playlistId'),
    quizId: formData.get('quizId'),
  })
  if (!parsed.success) {
    return { ok: false, error: 'VALIDATION_ERROR', message: 'Invalid input.' }
  }

  const [playlist, quiz] = await Promise.all([
    prisma.playlist.findUnique({
      where: { id: parsed.data.playlistId },
      select: { ownerId: true, slug: true, _count: { select: { items: true } } },
    }),
    prisma.quiz.findUnique({
      where: { id: parsed.data.quizId },
      select: { isPublished: true },
    }),
  ])
  if (!playlist || !quiz || !quiz.isPublished) {
    return { ok: false, error: 'NOT_FOUND', message: 'Playlist or quiz not found.' }
  }
  if (playlist.ownerId !== session.user.id) {
    return { ok: false, error: 'FORBIDDEN', message: 'Not allowed.' }
  }
  if (playlist._count.items >= MAX_ITEMS_PER_PLAYLIST) {
    return {
      ok: false,
      error: 'LIMIT',
      message: `Playlists can hold at most ${MAX_ITEMS_PER_PLAYLIST} quizzes.`,
    }
  }

  const last = await prisma.playlistItem.findFirst({
    where: { playlistId: parsed.data.playlistId },
    orderBy: { order: 'desc' },
    select: { order: true },
  })

  await prisma.playlistItem.upsert({
    where: {
      playlistId_quizId: { playlistId: parsed.data.playlistId, quizId: parsed.data.quizId },
    },
    create: {
      playlistId: parsed.data.playlistId,
      quizId: parsed.data.quizId,
      order: (last?.order ?? -1) + 1,
    },
    update: {},
  })

  revalidatePath(`/playlists/${playlist.slug}`)
  revalidatePath('/playlists')
  return { ok: true }
}

export async function removeFromPlaylist(formData: FormData): Promise<PlaylistResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'UNAUTHORIZED', message: 'Please sign in.' }
  }

  const parsed = itemSchema.safeParse({
    playlistId: formData.get('playlistId'),
    quizId: formData.get('quizId'),
  })
  if (!parsed.success) {
    return { ok: false, error: 'VALIDATION_ERROR', message: 'Invalid input.' }
  }

  const playlist = await prisma.playlist.findUnique({
    where: { id: parsed.data.playlistId },
    select: { ownerId: true, slug: true },
  })
  if (!playlist) {
    return { ok: false, error: 'NOT_FOUND', message: 'Playlist not found.' }
  }
  if (playlist.ownerId !== session.user.id && session.user.role !== 'ADMIN') {
    return { ok: false, error: 'FORBIDDEN', message: 'Not allowed.' }
  }

  await prisma.playlistItem.deleteMany({
    where: { playlistId: parsed.data.playlistId, quizId: parsed.data.quizId },
  })

  revalidatePath(`/playlists/${playlist.slug}`)
  revalidatePath('/playlists')
  return { ok: true }
}
