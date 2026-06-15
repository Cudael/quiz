'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { deleteCategory } from '../actions'
import { CategoryEditForm } from './category-edit-form'
import { NewCategoryForm } from './new-category-form'
import type { CategoryRecord } from './category-types'

export function CategoriesClient({ categories }: { categories: CategoryRecord[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)

  const topLevelCategories = categories.filter((c) => c.parentSlug === null)

  const handleDelete = async (category: CategoryRecord) => {
    if (!window.confirm(`Delete "${category.name}"? This cannot be undone.`)) return
    const formData = new FormData()
    formData.set('categoryId', category.id)
    await deleteCategory(formData)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button type="button" onClick={() => setShowNewForm((v) => !v)} variant="outline">
          {showNewForm ? 'Cancel' : 'New category'}
        </Button>
      </div>

      {showNewForm && (
        <NewCategoryForm
          topLevelCategories={topLevelCategories}
          onCancel={() => setShowNewForm(false)}
        />
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const isEditing = editingId === category.id

          return (
            <Card key={category.id}>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="h-5 w-5 rounded-full border border-border"
                      style={{ background: category.color }}
                    />
                    <Badge variant="outline">{category.icon}</Badge>
                  </div>
                  <Badge className="bg-muted text-muted-foreground">
                    {category._count.quizzes} quizzes
                  </Badge>
                </div>

                <div className="space-y-2">
                  <h2 className="font-semibold">{category.name}</h2>
                  {category.parentSlug && (
                    <p className="text-xs text-muted-foreground">Sub of: {category.parentSlug}</p>
                  )}
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {category.description}
                  </p>
                  {category.imageUrl ? (
                    <Image
                      alt={`${category.name} category image`}
                      className="rounded object-cover"
                      height={40}
                      src={category.imageUrl}
                      unoptimized
                      width={64}
                    />
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => setEditingId(isEditing ? null : category.id)}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    {isEditing ? 'Close' : 'Edit'}
                  </Button>
                  <Button
                    size="sm"
                    type="button"
                    variant="destructive"
                    onClick={() => void handleDelete(category)}
                  >
                    Delete
                  </Button>
                </div>

                {isEditing ? (
                  <CategoryEditForm
                    category={category}
                    parentCategories={topLevelCategories}
                    onCancel={() => setEditingId(null)}
                  />
                ) : null}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
