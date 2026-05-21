import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CategoriesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <Button variant="ghost" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
      <h1 className="text-3xl font-extrabold mb-4">Categories</h1>
      <p className="text-muted-foreground">Category browser coming in Phase 3. Stay tuned!</p>
    </div>
  )
}
