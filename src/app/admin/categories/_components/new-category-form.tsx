'use client'

import * as React from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { slugify } from '@/lib/slugify'
import { createCategory } from '../actions'
import type { CategoryRecord } from './category-types'

interface NewCategoryFormProps {
  topLevelCategories: CategoryRecord[]
  onCancel: () => void
}

export function NewCategoryForm({ topLevelCategories, onCancel }: NewCategoryFormProps) {
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
      className="grid gap-3 rounded-md border border-border bg-background p-4 sm:grid-cols-2"
    >
      <label className="space-y-1 text-sm">
        <span className="text-muted-foreground">Name</span>
        <input
          className="w-full rounded-md border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
          name="name"
          required
        />
      </label>

      <label className="space-y-1 text-sm">
        <span className="text-muted-foreground">Icon (optional)</span>
        <input
          className="w-full rounded-md border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
          name="icon"
          placeholder="Defaults to a generic icon"
        />
      </label>

      <label className="space-y-1 text-sm">
        <span className="text-muted-foreground">Color (optional)</span>
        <input
          className="w-full rounded-md border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
          name="color"
          placeholder="#rrggbb — defaults to gray"
        />
      </label>

      <label className="space-y-1 text-sm">
        <span className="text-muted-foreground">Image URL</span>
        <input
          className="w-full rounded-md border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
          name="imageUrl"
          placeholder="https://..."
          type="url"
        />
      </label>

      <label className="space-y-1 text-sm sm:col-span-2">
        <span className="text-muted-foreground">Description</span>
        <textarea
          className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
          name="description"
          required
        />
      </label>

      <label className="space-y-1 text-sm sm:col-span-2">
        <span className="text-muted-foreground">Parent category (optional)</span>
        <select
          className="w-full rounded-md border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
          name="parentSlug"
        >
          <option value="">None (top-level)</option>
          {topLevelCategories.map((cat) => (
            <option key={cat.id} value={slugify(cat.name)}>
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
