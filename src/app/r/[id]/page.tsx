import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function ShareRedirectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await prisma.playSession.findUnique({ where: { id }, select: { quizId: true } })
  if (!session) {
    redirect('/')
  }
  redirect(`/play/${session.quizId}/results?session=${id}`)
}
