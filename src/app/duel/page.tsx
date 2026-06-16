import type { Metadata } from 'next'
import { prisma } from '@/server/prisma'
import { DuelEntry } from './duel-entry'
import { absoluteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Duel Mode — Challenge Friends',
  description:
    'Challenge your friends to a real-time quiz duel. Share a code, answer questions, and see who comes out on top.',
  openGraph: {
    title: 'Duel Mode — Challenge Friends | BusQuiz',
    description: 'Challenge your friends to a real-time quiz duel.',
    url: absoluteUrl('/duel'),
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Duel Mode — Challenge Friends | BusQuiz',
    description: 'Challenge your friends to a real-time quiz duel.',
  },
}

export default async function DuelPage() {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <DuelEntry categories={categories} />
    </div>
  )
}
