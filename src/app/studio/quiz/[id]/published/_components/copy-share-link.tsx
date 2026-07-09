'use client'

import * as React from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CopyShareLink({ slug }: { slug: string }) {
  const [copied, setCopied] = React.useState(false)

  const getShareUrl = () => {
    if (typeof window === 'undefined') return `/quiz/${slug}`
    return `${window.location.origin}/quiz/${slug}`
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(getShareUrl())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2">
      <input
        readOnly
        value={getShareUrl()}
        className="min-w-0 flex-1 rounded-md border bg-background px-3 py-2 text-sm"
      />
      <Button type="button" variant="outline" size="icon" onClick={handleCopy}>
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  )
}
