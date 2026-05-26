'use client'

import Image from 'next/image'
import * as React from 'react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { slugify } from '@/lib/slugify'
import { createCategory, deleteCategory, updateCategory } from '../actions'

interface CategoryRecord {
  id: string
  name: string
  description: string
  icon: string
  color: string
  imageUrl: string | null
  parentSlug: string | null
  _count: {
    quizzes: number
  }
}

interface CategoryEditFormProps {
  category: CategoryRecord
  onCancel: () => void
}

export function CategoryEditForm({ category, onCancel }: CategoryEditFormProps) {
  const updateAction = updateCategory as unknown as (formData: FormData) => Promise<void>

  return (
    <form
      action={updateAction}
      className="grid gap-3 rounded-xl border border-border bg-background p-4 sm:grid-cols-2"
    >
      <input name="categoryId" type="hidden" value={category.id} />

      <label className="space-y-1 text-sm">
        <span className="text-muted-foreground">Name</span>
        <input
          className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
          defaultValue={category.name}
          name="name"
          required
        />
      </label>

      <label className="space-y-1 text-sm">
        <span className="text-muted-foreground">Icon</span>
        <input
          className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
          defaultValue={category.icon}
          name="icon"
          required
        />
      </label>

      <label className="space-y-1 text-sm">
        <span className="text-muted-foreground">Color</span>
        <input
          className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
          defaultValue={category.color}
          name="color"
          required
        />
      </label>

      <label className="space-y-1 text-sm">
        <span className="text-muted-foreground">Image URL</span>
        <input
          className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
          defaultValue={category.imageUrl ?? ''}
          name="imageUrl"
          placeholder="https://..."
          type="url"
        />
      </label>

      <label className="space-y-1 text-sm sm:col-span-2">
        <span className="text-muted-foreground">Description</span>
        <textarea
          className="min-h-24 w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
          defaultValue={category.description}
          name="description"
          required
        />
      </label>

      <div className="flex flex-wrap gap-2 sm:col-span-2">
        <Button type="submit">Save changes</Button>
        <Button onClick={onCancel} type="button" variant="outline">
          Cancel
        </Button>
      </div>
    </form>
  )
}

interface NewCategoryFormProps {
  topLevelCategories: CategoryRecord[]
  onCancel: () => void
}

function NewCategoryForm({ topLevelCategories, onCancel }: NewCategoryFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    const result = await createCategory(formData)
    setSubmitting(false)
    if (!result.ok) {
      setError(result.message ?? 'Failed to create category.')
    } else {
      onCancel()
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-3 rounded-xl border border-border bg-background p-4 sm:grid-cols-2"
    >
      <label className="space-y-1 text-sm">
        <span className="text-muted-foreground">Name</span>
        <input
          className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
          name="name"
          required
        />
      </label>

      <label className="space-y-1 text-sm">
        <span className="text-muted-foreground">Icon</span>
        <input
          className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
          name="icon"
          required
        />
      </label>

      <label className="space-y-1 text-sm">
        <span className="text-muted-foreground">Color</span>
        <input
          className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
          name="color"
          placeholder="#rrggbb"
          required
        />
      </label>

      <label className="space-y-1 text-sm">
        <span className="text-muted-foreground">Image URL</span>
        <input
          className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
          name="imageUrl"
          placeholder="https://..."
          type="url"
        />
      </label>

      <label className="space-y-1 text-sm sm:col-span-2">
        <span className="text-muted-foreground">Description</span>
        <textarea
          className="min-h-24 w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
          name="description"
          required
        />
      </label>

      <label className="space-y-1 text-sm sm:col-span-2">
        <span className="text-muted-foreground">Parent category (optional)</span>
        <select
          className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
          name="parentSlug"
        >
          <option value="">None (top-level)</option>
          {topLevelCategories.map((cat) => (
            <option
              key={cat.id}
              value={slugify(cat.name)}
            >
              {cat.name}
            </option>
          ))}
        </select>
      </label>

      {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}

      <div className="flex flex-wrap gap-2 sm:col-span-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Creating…' : 'Create category'}
        </Button>
        <Button onClick={onCancel} type="button" variant="outline">
          Cancel
        </Button>
      </div>
    </form>
  )
}

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
                  <CategoryEditForm category={category} onCancel={() => setEditingId(null)} />
                ) : null}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
