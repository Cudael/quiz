import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/server/prisma'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { BulkQuizImportClient } from './_components/bulk-quiz-import-client'

export const metadata: Metadata = {
  title: 'Bulk Import Quizzes',
  robots: { index: false },
}

export default async function AdminQuizBulkImportPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: { slug: true, name: true },
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bulk Import Quizzes"
        description="Validate generated JSON, preview the batch, and create unpublished draft quizzes."
        back={
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/quizzes">
              <ArrowLeft className="h-4 w-4" />
              Back to quizzes
            </Link>
          </Button>
        }
      />

      <BulkQuizImportClient categories={categories} />
    </div>
  )
}
