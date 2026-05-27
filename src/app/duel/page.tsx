import { prisma } from '@/server/prisma'
import { DuelEntry } from './duel-entry'

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
