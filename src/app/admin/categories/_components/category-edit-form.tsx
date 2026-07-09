'use client'

import { Button } from '@/components/ui/button'
import { updateCategory } from '../actions'
import type { CategoryRecord } from './category-types'

interface ParentCategory {
  slug: string
  name: string
}

interface CategoryEditFormProps {
  category: CategoryRecord
  parentCategories: ParentCategory[]
  onCancel: () => void
}

export function CategoryEditForm({ category, parentCategories, onCancel }: CategoryEditFormProps) {
  const updateAction = updateCategory as unknown as (formData: FormData) => Promise<void>

  return (
    <form
      action={updateAction}
      className="grid gap-3 rounded-md border border-border bg-background p-4 sm:grid-cols-2"
    >
      <input name="categoryId" type="hidden" value={category.id} />

      <label className="space-y-1 text-sm">
        <span className="text-muted-foreground">Name</span>
        <input
          className="w-full rounded-md border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
          defaultValue={category.name}
          name="name"
          required
        />
      </label>

      <label className="space-y-1 text-sm">
        <span className="text-muted-foreground">Parent category</span>
        <select
          name="parentSlug"
          defaultValue={category.parentSlug ?? ''}
          className="w-full rounded-md border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">None (top-level)</option>
          {parentCategories
            .filter((c) => c.slug !== category.slug)
            .map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.name}
              </option>
            ))}
        </select>
      </label>

      <label className="space-y-1 text-sm">
        <span className="text-muted-foreground">Icon (optional)</span>
        <input
          className="w-full rounded-md border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
          defaultValue={category.icon}
          name="icon"
          placeholder="Defaults to a generic icon"
        />
      </label>

      <label className="space-y-1 text-sm">
        <span className="text-muted-foreground">Color (optional)</span>
        <input
          className="w-full rounded-md border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
          defaultValue={category.color}
          name="color"
          placeholder="#rrggbb — defaults to gray"
        />
      </label>

      <label className="space-y-1 text-sm">
        <span className="text-muted-foreground">Image URL</span>
        <input
          className="w-full rounded-md border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
          defaultValue={category.imageUrl ?? ''}
          name="imageUrl"
          placeholder="https://..."
          type="url"
        />
      </label>

      <label className="space-y-1 text-sm sm:col-span-2">
        <span className="text-muted-foreground">Description</span>
        <textarea
          className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
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
