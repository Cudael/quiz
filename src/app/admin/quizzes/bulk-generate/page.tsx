import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/server/prisma'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { BulkAiGenerateClient } from './_components/bulk-ai-generate-client'

export const metadata: Metadata = {
  title: 'Bulk AI Generate Quizzes',
  robots: { index: false },
}

export default async function BulkAiGeneratePage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ parentSlug: { sort: 'asc', nulls: 'first' } }, { name: 'asc' }],
    select: { id: true, name: true, slug: true, parentSlug: true },
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bulk AI Generate Quizzes"
        description="Generate multiple quizzes at once with AI. Each quiz explores a different angle of your topic and is saved as an unpublished draft for review."
        back={
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/quizzes">
              <ArrowLeft className="h-4 w-4" />
              Back to quizzes
            </Link>
          </Button>
        }
      />

      <BulkAiGenerateClient categories={categories} />
    </div>
  )
}
