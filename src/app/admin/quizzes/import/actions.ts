'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'
import {
  validateBulkQuizImportJson,
  type BulkImportQuizPreview,
  type BulkImportValidationError,
  type BulkImportValidationResult,
} from '@/domain/quiz-bulk-import'

type AdminActionResult = { ok: true; userId: string } | { ok: false; message: string }

export interface BulkQuizImportPreviewResult {
  batchSize: number
  validCount: number
  invalidCount: number
  errorCount: number
  quizzes: BulkImportQuizPreview[]
  errors: BulkImportValidationError[]
}

export type BulkQuizImportActionResult =
  | {
      ok: true
      message: string
      preview: BulkQuizImportPreviewResult
      importedCount?: number
      importedQuizIds?: string[]
    }
  | { ok: false; message: string; preview?: BulkQuizImportPreviewResult }

interface CategoryLookup {
  id: string
  slug: string
  name: string
}

async function assertAdmin(): Promise<AdminActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, message: 'Please sign in.' }
  }
  if (session.user.role !== 'ADMIN') {
    return { ok: false, message: 'Admin only.' }
  }
  return { ok: true, userId: session.user.id }
}

function readContent(formData: FormData) {
  const content = formData.get('content')
  if (typeof content !== 'string' || content.trim().length === 0) {
    return { ok: false as const, message: 'Paste or upload a JSON import payload.' }
  }
  return { ok: true as const, content }
}

async function loadCategories() {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, slug: true, name: true },
  })
}

function buildPreview(validation: BulkImportValidationResult): BulkQuizImportPreviewResult {
  const invalidQuizIndexes = new Set(
    validation.errors
      .map((error) => error.quizIndex)
      .filter((quizIndex): quizIndex is number => quizIndex !== null)
  )

  return {
    batchSize: validation.batchSize,
    validCount: validation.previews.length,
    invalidCount: invalidQuizIndexes.size,
    errorCount: validation.errors.length,
    quizzes: validation.previews,
    errors: validation.errors,
  }
}

async function validateContent(content: string, categories: CategoryLookup[]) {
  const validation = validateBulkQuizImportJson(
    content,
    categories.map((category) => category.slug)
  )
  return { validation, preview: buildPreview(validation) }
}

export async function validateBulkQuizImport(
  formData: FormData
): Promise<BulkQuizImportActionResult> {
  const guard = await assertAdmin()
  if (!guard.ok) return guard

  const content = readContent(formData)
  if (!content.ok) return content

  const categories = await loadCategories()
  const { preview } = await validateContent(content.content, categories)

  if (preview.errorCount > 0) {
    return {
      ok: false,
      message: `Found ${preview.errorCount} validation issue${preview.errorCount === 1 ? '' : 's'}.`,
      preview,
    }
  }

  return {
    ok: true,
    message: `${preview.validCount} quiz${preview.validCount === 1 ? '' : 'zes'} ready to import.`,
    preview,
  }
}

export async function importBulkQuizDrafts(
  formData: FormData
): Promise<BulkQuizImportActionResult> {
  const guard = await assertAdmin()
  if (!guard.ok) return guard

  const content = readContent(formData)
  if (!content.ok) return content

  const categories = await loadCategories()
  const { validation, preview } = await validateContent(content.content, categories)

  if (validation.quizzes.length === 0) {
    return {
      ok: false,
      message: 'No valid quizzes were found to import.',
      preview,
    }
  }

  const categoryBySlug = new Map(categories.map((category) => [category.slug, category]))

  const importedQuizIds = await prisma.$transaction(async (tx) => {
    const quizIds: string[] = []

    for (const quiz of validation.quizzes) {
      const category = categoryBySlug.get(quiz.categorySlug)
      if (!category) continue

      const created = await tx.quiz.create({
        data: {
          title: quiz.title,
          description: quiz.description,
          coverImage: quiz.coverImage ?? null,
          tags: quiz.tags,
          categoryId: category.id,
          difficulty: quiz.difficulty,
          authorId: guard.userId,
          format: 'TEXT_CHOICE',
          isPublished: false,
          questions: {
            create: quiz.questions.map((question, index) => ({
              type: 'SINGLE',
              prompt: question.prompt,
              explanation: question.explanation ?? null,
              timeLimitSec: question.timeLimitSec,
              order: index,
              choices: {
                create: question.choices.map((choice) => ({
                  text: choice.text,
                  isCorrect: choice.isCorrect,
                })),
              },
            })),
          },
        },
        select: { id: true },
      })

      quizIds.push(created.id)
    }

    await tx.adminAction.create({
      data: {
        actorId: guard.userId,
        action: 'QUIZ_BULK_IMPORT',
        targetType: 'QuizBulkImport',
        targetId: quizIds[0] ?? 'none',
        meta: {
          importedCount: quizIds.length,
          skippedInvalidCount: preview.invalidCount,
          quizIds,
        },
      },
    })

    return quizIds
  })

  revalidatePath('/admin/quizzes')
  revalidatePath('/admin/quizzes/import')
  revalidatePath('/studio')

  const skippedMessage = preview.invalidCount > 0 ? ` Skipped ${preview.invalidCount} invalid.` : ''
  return {
    ok: true,
    message: `Imported ${importedQuizIds.length} draft quiz${importedQuizIds.length === 1 ? '' : 'zes'}.${skippedMessage}`,
    preview,
    importedCount: importedQuizIds.length,
    importedQuizIds,
  }
}
