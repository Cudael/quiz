'use client'

import { useEffect, useRef } from 'react'
import { Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { motion } from 'framer-motion'

interface ResultsClientProps {
  score: number
  accuracy: number
  sessionId: string
  quizId: string
  mode: string
  unlockedBadges?: string[]
}

export function ResultsClient({
  score,
  accuracy,
  sessionId,
  unlockedBadges = [],
}: ResultsClientProps) {
  const { addToast } = useToast()
  const confettiRef = useRef(false)

  // Fire confetti if perfect score or new badge unlock.
  useEffect(() => {
    if (confettiRef.current) return
    if (accuracy < 100 && unlockedBadges.length === 0) return
    confettiRef.current = true

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    import('canvas-confetti').then((mod) => {
      const confetti = mod.default
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.4 },
        colors: ['#7c3aed', '#ec4899', '#22c55e', '#3b82f6', '#eab308'],
      })
    })
  }, [accuracy, score, unlockedBadges.length])

  useEffect(() => {
    if (unlockedBadges.length === 0) return
    unlockedBadges.forEach((badgeSlug, index) => {
      window.setTimeout(() => {
        addToast(`Badge unlocked! ${badgeSlug}`, 'success', 5000)
      }, index * 250)
    })
  }, [addToast, unlockedBadges])

  const handleShare = async () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const shareUrl = `${origin}/r/${sessionId}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      addToast('Share link copied to clipboard!', 'success')
    } catch {
      addToast('Could not copy link. Try manually: ' + shareUrl, 'info')
    }
  }

  return (
    <div className="mb-6 flex justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
      >
        <Button variant="outline" size="lg" onClick={handleShare}>
          <Share2 className="h-4 w-4" />
          Share Result
        </Button>
      </motion.div>
    </div>
  )
}
