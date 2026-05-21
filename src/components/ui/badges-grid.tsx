'use client'

import { useMemo, useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { cn } from '@/lib/utils'

interface BadgeSummary {
  id: string
  slug: string
  name: string
  description: string
  criteria: string
}

interface BadgeAward {
  badgeId: string
  awardedAt: string
}

interface BadgeEarner {
  id: string
  name: string
  username: string | null
}

interface BadgesGridProps {
  badges: BadgeSummary[]
  earnedBadges: BadgeAward[]
  badgeLeaders: Record<string, BadgeEarner[]>
}

export function BadgesGrid({ badges, earnedBadges, badgeLeaders }: BadgesGridProps) {
  const [openBadge, setOpenBadge] = useState<BadgeSummary | null>(null)

  const earnedMap = useMemo(() => {
    return new Map(earnedBadges.map((award) => [award.badgeId, award.awardedAt]))
  }, [earnedBadges])

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {badges.map((badge) => {
          const earnedAt = earnedMap.get(badge.id)
          const isEarned = !!earnedAt
          return (
            <button
              key={badge.id}
              type="button"
              onClick={() => setOpenBadge(badge)}
              className={cn(
                'rounded-xl border p-3 text-left transition-all',
                isEarned
                  ? 'border-quiz-purple/50 bg-quiz-purple/10 text-foreground'
                  : 'border-border bg-muted/30 text-muted-foreground grayscale'
              )}
              title={
                isEarned
                  ? `${badge.description} • earned ${new Date(earnedAt).toLocaleDateString()}`
                  : badge.description
              }
              data-testid={`badge-${badge.slug}`}
            >
              <p className="text-sm font-semibold">{badge.name}</p>
              <p className="mt-1 text-xs">{badge.description}</p>
            </button>
          )
        })}
      </div>

      <Modal
        open={!!openBadge}
        onClose={() => setOpenBadge(null)}
        title={openBadge?.name}
        description={openBadge?.description}
      >
        {openBadge && (
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-semibold">Criteria</p>
              <pre className="mt-1 overflow-auto rounded-md bg-muted p-2 text-xs">
                {openBadge.criteria}
              </pre>
            </div>
            <div>
              <p className="font-semibold">Others who earned it</p>
              <ul className="mt-1 space-y-1 text-muted-foreground">
                {(badgeLeaders[openBadge.id] ?? []).slice(0, 5).map((earner) => (
                  <li key={earner.id}>
                    • {earner.username ? `${earner.name} (@${earner.username})` : earner.name}
                  </li>
                ))}
                {(badgeLeaders[openBadge.id] ?? []).length === 0 && <li>No one yet.</li>}
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
