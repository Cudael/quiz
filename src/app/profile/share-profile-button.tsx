'use client'

import { Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'

export function ShareProfileButton({ username }: { username: string }) {
  const { addToast } = useToast()

  return (
    <Button
      variant="outline"
      onClick={async () => {
        const origin = typeof window === 'undefined' ? '' : window.location.origin
        const shareUrl = `${origin}/u/${username}`
        try {
          await navigator.clipboard.writeText(shareUrl)
          addToast('Profile link copied!', 'success')
        } catch {
          addToast(`Could not copy link. ${shareUrl}`, 'info')
        }
      }}
    >
      <Share2 className="h-4 w-4" />
      Share profile
    </Button>
  )
}
