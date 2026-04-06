import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { Objective } from '@/types'
import { cn } from '@/lib/utils'

interface ObjectiveCardProps {
  objective: Objective
  orgSlug: string
}

const statusColors: Record<string, string> = {
  on_track: 'bg-green-100 text-green-800',
  at_risk: 'bg-yellow-100 text-yellow-800',
  behind: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
}

const statusLabels: Record<string, string> = {
  on_track: 'On track',
  at_risk: 'At risk',
  behind: 'Behind',
  completed: 'Completed',
}

export function ObjectiveCard({ objective, orgSlug }: ObjectiveCardProps) {
  return (
    <Link href={`/app/org/${orgSlug}/objectives/${objective.id}`}>
      <Card className="transition-shadow hover:shadow-md cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 flex-1 min-w-0">
              <p className="font-semibold leading-tight truncate">{objective.title}</p>
              <p className="text-xs text-muted-foreground">{objective.period}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge
                className={cn(
                  'text-xs border-0',
                  statusColors[objective.status] ?? statusColors.on_track
                )}
              >
                {statusLabels[objective.status] ?? objective.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{objective.progress}%</span>
          </div>
          <Progress value={objective.progress} className="h-2" />
          {objective.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">{objective.description}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
