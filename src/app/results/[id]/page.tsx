import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { prisma } from '@/server/prisma'

// COMPATIBILITY ALIAS: legacy `/results/[id]` URLs are redirected to
// `/play/[quizId]/results?session=[id]`.
// Removal criteria: remove this route after inbound links, bookmarks, and
// analytics show no meaningful traffic to `/results/*`.
export default async function ResultsRedirectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await prisma.playSession.findUnique({ where: { id }, select: { quizId: true } })
  if (!session) {
    redirect('/')
  }
  redirect(`/play/${session.quizId}/results?session=${id}`)
}
export const metadata: Metadata = {
  title: 'Quiz Results',
  robots: { index: false, follow: false },
}
