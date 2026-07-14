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
  username: string | null
}

interface BadgesGridProps {
  badges: BadgeSummary[]
  earnedBadges: BadgeAward[]
  badgeLeaders: Record<string, BadgeEarner[]>
}

const BADGE_EMOJIS: Record<string, string> = {
  'first-win': '🏆',
  'perfect-score': '💯',
  'streak-7': '🔥',
  'streak-30': '🌟',
  'quiz-author': '✏️',
  'category-master-science': '🔬',
  'speed-demon': '⚡',
  'night-owl': '🦉',
  centurion: '💎',
  'daily-devotee': '📅',
}

function getBadgeEmoji(slug: string): string {
  return BADGE_EMOJIS[slug] ?? '🎖️'
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
                'group relative overflow-hidden rounded-md border p-4 text-left transition-all duration-200',
                isEarned
                  ? 'border-quiz-purple/40 bg-quiz-purple/10 shadow-sm hover:shadow-md hover:border-quiz-purple/60 hover:scale-[1.02]'
                  : 'border-border/60 bg-muted/20 hover:bg-muted/30 grayscale opacity-50 hover:opacity-60'
              )}
              title={
                isEarned
                  ? `${badge.description} • earned ${new Date(earnedAt).toLocaleDateString()}`
                  : badge.description
              }
              data-testid={`badge-${badge.slug}`}
            >
              {/* Gradient shimmer on earned badges */}
              {isEarned && (
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md"
                  style={{
                    background:
                      'linear-gradient(135deg, hsl(var(--color-quiz-purple) / 0.06) 0%, hsl(var(--color-quiz-pink) / 0.06) 100%)',
                  }}
                  aria-hidden="true"
                />
              )}
              <div className="text-3xl mb-2.5" aria-hidden="true">
                {getBadgeEmoji(badge.slug)}
              </div>
              <p className="text-sm font-black leading-tight">{badge.name}</p>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {badge.description}
              </p>
              {isEarned && earnedAt && (
                <p className="mt-2 text-[10px] font-semibold text-quiz-purple-light opacity-80">
                  Earned {new Date(earnedAt).toLocaleDateString()}
                </p>
              )}
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
          <div className="space-y-4 text-sm">
            <div className="text-center py-2">
              <span className="text-5xl">{getBadgeEmoji(openBadge.slug)}</span>
            </div>
            <div>
              <p className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
                Criteria
              </p>
              <pre className="overflow-auto rounded-md bg-muted p-3 text-xs leading-relaxed">
                {openBadge.criteria}
              </pre>
            </div>
            <div>
              <p className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
                Others who earned it
              </p>
              <ul className="space-y-1.5">
                {(badgeLeaders[openBadge.id] ?? []).slice(0, 5).map((earner) => (
                  <li key={earner.id} className="flex items-center gap-2 text-sm">
                    <span className="h-6 w-6 rounded-sm bg-quiz-orange/10 text-quiz-orange text-xs font-bold flex items-center justify-center shrink-0">
                      {(earner.username ?? 'P').charAt(0).toUpperCase()}
                    </span>
                    {earner.username ? `@${earner.username}` : 'Player'}
                  </li>
                ))}
                {(badgeLeaders[openBadge.id] ?? []).length === 0 && (
                  <li className="text-muted-foreground">No one yet — be the first!</li>
                )}
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
