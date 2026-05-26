import { PageHeader } from '@/components/ui/page-header'
import { prisma } from '@/server/prisma'
import { CategoriesClient } from './_components/category-edit-form'

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ parentSlug: 'asc' }, { name: 'asc' }],
    include: { _count: { select: { quizzes: true } } },
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Categories" description={`${categories.length} categories`} />
      <CategoriesClient categories={categories} />
    </div>
  )
}
