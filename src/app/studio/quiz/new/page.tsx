import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { createQuiz, suggestCategory } from '@/app/studio/actions'
import { Button } from '@/components/ui/button'

export default async function NewQuizPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/api/auth/signin?callbackUrl=/studio/quiz/new')
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  })

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">Create quiz</h1>
      <form
        action={createQuiz as unknown as (formData: FormData) => Promise<void>}
        className="space-y-4 rounded-lg border p-6"
      >
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Title</span>
          <input
            name="title"
            required
            maxLength={120}
            className="w-full rounded-md border bg-background px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Description</span>
          <textarea
            name="description"
            required
            maxLength={500}
            className="min-h-28 w-full rounded-md border bg-background px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Category</span>
          <select
            name="categoryId"
            required
            className="w-full rounded-md border bg-background px-3 py-2"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <p className="text-xs text-muted-foreground">
          Need a new category? Suggest one below. Your suggestion is pending admin approval. Pick an
          existing category for now.
        </p>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Difficulty</span>
          <select
            name="difficulty"
            required
            className="w-full rounded-md border bg-background px-3 py-2"
          >
            <option value="EASY">EASY</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HARD">HARD</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isPublished" />
          Publish now
        </label>
        <Button type="submit">Save quiz</Button>
      </form>

      <form
        action={suggestCategory as unknown as (formData: FormData) => Promise<void>}
        className="mt-6 space-y-3 rounded-lg border p-6"
      >
        <h2 className="text-lg font-semibold">Suggest new category</h2>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Name</span>
          <input
            name="name"
            required
            className="w-full rounded-md border bg-background px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Description</span>
          <input
            name="description"
            required
            className="w-full rounded-md border bg-background px-3 py-2"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Icon name (lucide)</span>
            <input
              name="icon"
              defaultValue="BookOpen"
              required
              className="w-full rounded-md border bg-background px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Color (hex)</span>
            <input
              name="color"
              defaultValue="#7C3AED"
              required
              className="w-full rounded-md border bg-background px-3 py-2"
            />
          </label>
        </div>
        <Button type="submit" variant="outline">
          Submit suggestion
        </Button>
      </form>
    </div>
  )
}
