import { AlertTriangle, CheckCircle2, HelpCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { FactCheckVerdictLabel } from '@/server/fact-check-utils'

export function FactCheckBadge({ verdict }: { verdict: FactCheckVerdictLabel }) {
  if (verdict === 'correct') {
    return (
      <Badge variant="success" className="gap-1">
        <CheckCircle2 className="h-3 w-3" />
        Looks correct
      </Badge>
    )
  }
  if (verdict === 'suspect') {
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertTriangle className="h-3 w-3" />
        Possibly wrong
      </Badge>
    )
  }
  return (
    <Badge variant="warning" className="gap-1">
      <HelpCircle className="h-3 w-3" />
      Unsure
    </Badge>
  )
}
