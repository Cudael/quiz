'use client'

import * as React from 'react'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AiGenerateDialog } from './ai-generate-dialog'

interface Category {
  id: string
  name: string
}

interface AiGenerateButtonProps {
  categories: Category[]
}

export function AiGenerateButton({ categories }: AiGenerateButtonProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Sparkles className="h-4 w-4" />
        Generate with AI
      </Button>
      <AiGenerateDialog open={open} onClose={() => setOpen(false)} categories={categories} />
    </>
  )
}
