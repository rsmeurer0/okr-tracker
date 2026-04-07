import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp } from 'lucide-react'
import Link from 'next/link'
import type { KeyResult } from '@/types'

interface KeyResultRowProps {
  keyResult: KeyResult & { ownerName?: string | null; ownerEmail?: string | null }
  orgSlug: string
  objectiveId: string
}

const metricLabels: Record<string, string> = {
  percentage: '%',
  number: '#',
  currency: '$',
  boolean: '✓',
}

export function KeyResultRow({ keyResult: kr, orgSlug, objectiveId }: KeyResultRowProps) {
  const owner = kr.ownerName ?? kr.ownerEmail ?? null
  const targetDisplay = kr.metricType === 'boolean'
    ? 'Done'
    : `${kr.currentValue} / ${kr.targetValue} ${metricLabels[kr.metricType] ?? ''}`

  return (
    <div className="rounded-lg border p-4 space-y-3 hover:bg-muted/30 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm leading-tight">{kr.title}</p>
          {owner && (
            <p className="text-xs text-muted-foreground mt-0.5">{owner}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground">{targetDisplay}</span>
          <Badge variant="outline" className="text-xs">{kr.progress}%</Badge>
          <Button size="sm" variant="outline" asChild>
            <Link href={`/app/org/${orgSlug}/objectives/${objectiveId}/key-result/${kr.id}/check-in`}>
              Check in
            </Link>
          </Button>
        </div>
      </div>
      <Progress value={kr.progress} className="h-1.5" />
    </div>
  )
}
