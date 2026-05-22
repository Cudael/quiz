'use client'

import { useEffect, useRef } from 'react'
import { Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { motion, useReducedMotion } from 'framer-motion'
import { useSound } from '@/lib/use-sound'

interface ResultsClientProps {
  score: number
  accuracy: number
  sessionId: string
  quizId: string
  mode: string
  unlockedBadges?: string[]
  leveledUp?: boolean
  personalBest?: boolean
}

export function ResultsClient({
  score,
  accuracy,
  sessionId,
  unlockedBadges = [],
  leveledUp = false,
  personalBest = false,
}: ResultsClientProps) {
  const { addToast } = useToast()
  const confettiRef = useRef(false)
  const { play } = useSound()
  const reduceMotion = useReducedMotion()

  // Fire confetti if perfect score or new badge unlock.
  useEffect(() => {
    if (confettiRef.current) return
    if (accuracy < 100 && unlockedBadges.length === 0 && !leveledUp && !personalBest) return
    confettiRef.current = true

    if (reduceMotion) return

    import('canvas-confetti').then((mod) => {
      const confetti = mod.default
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.4 },
        colors:
          unlockedBadges.length > 0
            ? ['#ec4899', '#f59e0b', '#7c3aed']
            : ['#7c3aed', '#ec4899', '#22c55e', '#3b82f6', '#eab308'],
      })

      if (leveledUp) {
        confetti({ particleCount: 260, spread: 100, origin: { y: 0.25 } })
      }
      if (personalBest) {
        confetti({ particleCount: 100, spread: 50, origin: { y: 0.55 } })
      }
    })
  }, [accuracy, leveledUp, personalBest, reduceMotion, score, unlockedBadges.length])

  useEffect(() => {
    if (unlockedBadges.length === 0) return
    void play('badge')
    unlockedBadges.forEach((badgeName, index) => {
      window.setTimeout(() => {
        addToast(`Badge unlocked! ${badgeName}`, 'success', 5000)
      }, index * 250)
    })
  }, [addToast, play, unlockedBadges])

  useEffect(() => {
    if (!leveledUp) return
    void play('level-up')
  }, [leveledUp, play])

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
    <div className={`mb-6 flex justify-center ${reduceMotion ? 'animate-pulse' : ''}`}>
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
