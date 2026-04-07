import { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { notFound } from 'next/navigation'
import { db } from '@/db/drizzle'
import { objectives, keyResults, profiles } from '@/db/schema'
import { eq, asc } from 'drizzle-orm'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, ArrowLeft, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { KeyResultRow } from '@/components/okr/key-result-row'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Objective' }

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

interface ObjectiveDetailPageProps {
  params: Promise<{ slug: string; id: string }>
}

export default async function ObjectiveDetailPage({ params }: ObjectiveDetailPageProps) {
  const { slug, id } = await params

  const [objective] = await db
    .select()
    .from(objectives)
    .where(eq(objectives.id, id))
    .limit(1)

  if (!objective) notFound()

  const krs = await db
    .select({
      id: keyResults.id,
      title: keyResults.title,
      metricType: keyResults.metricType,
      startValue: keyResults.startValue,
      targetValue: keyResults.targetValue,
      currentValue: keyResults.currentValue,
      progress: keyResults.progress,
      ownerId: keyResults.ownerId,
      createdAt: keyResults.createdAt,
      updatedAt: keyResults.updatedAt,
      objectiveId: keyResults.objectiveId,
      orgId: keyResults.orgId,
      ownerName: profiles.fullName,
      ownerEmail: profiles.email,
    })
    .from(keyResults)
    .leftJoin(profiles, eq(keyResults.ownerId, profiles.id))
    .where(eq(keyResults.objectiveId, id))
    .orderBy(asc(keyResults.createdAt))

  return (
    <>
      <Header />
      <div className="p-4 md:p-6 space-y-6 max-w-3xl">
        {/* Back button */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/app/org/${slug}/objectives`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground">{objective.period}</p>
        </div>

        {/* Objective header */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <CardTitle className="text-xl leading-tight">{objective.title}</CardTitle>
              <Badge className={cn('shrink-0 border-0', statusColors[objective.status])}>
                {statusLabels[objective.status]}
              </Badge>
            </div>
            {objective.description && (
              <p className="text-sm text-muted-foreground mt-1">{objective.description}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Overall progress</span>
              <span className="font-semibold">{objective.progress}%</span>
            </div>
            <Progress value={objective.progress} className="h-3" />
          </CardContent>
        </Card>

        {/* Key Results */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">Key Results</h3>
              <span className="text-sm text-muted-foreground">({krs.length})</span>
            </div>
            <Button size="sm" asChild>
              <Link href={`/app/org/${slug}/objectives/${id}/key-result/new`}>
                <Plus className="mr-2 h-4 w-4" />
                Add KR
              </Link>
            </Button>
          </div>

          {krs.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
              <p className="text-sm text-muted-foreground">No key results yet</p>
              <Button asChild variant="outline" className="mt-4" size="sm">
                <Link href={`/app/org/${slug}/objectives/${id}/key-result/new`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add first key result
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {krs.map((kr) => (
                <KeyResultRow key={kr.id} keyResult={kr} orgSlug={slug} objectiveId={id} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
