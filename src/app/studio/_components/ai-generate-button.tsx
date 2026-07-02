'use client'

import * as React from 'react'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AiGenerateDialog, type CategoryNode } from './ai-generate-dialog'

interface AiGenerateButtonProps {
  categories: CategoryNode[]
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
