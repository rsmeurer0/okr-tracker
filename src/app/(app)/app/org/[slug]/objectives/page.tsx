import { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { getOrgBySlug } from '@/lib/queries/orgs'
import { db } from '@/db/drizzle'
import { objectives } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { ObjectiveCard } from '@/components/okr/objective-card'
import { notFound } from 'next/navigation'

export const metadata: Metadata = { title: 'Objectives' }

interface ObjectivesPageProps {
  params: Promise<{ slug: string }>
}

export default async function ObjectivesPage({ params }: ObjectivesPageProps) {
  const { slug } = await params
  const org = await getOrgBySlug(slug)
  if (!org) notFound()

  const orgObjectives = await db
    .select()
    .from(objectives)
    .where(eq(objectives.orgId, org.id))
    .orderBy(desc(objectives.createdAt))

  return (
    <>
      <Header title="Objectives" />
      <div className="p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Objectives</h2>
            <p className="text-sm text-muted-foreground">{orgObjectives.length} total</p>
          </div>
          <Button asChild size="sm">
            <Link href={`/app/org/${slug}/objectives/new`}>
              <Plus className="mr-2 h-4 w-4" />
              New objective
            </Link>
          </Button>
        </div>

        {orgObjectives.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
            <p className="text-muted-foreground">No objectives yet</p>
            <Button asChild className="mt-4" variant="outline">
              <Link href={`/app/org/${slug}/objectives/new`}>
                <Plus className="mr-2 h-4 w-4" />
                Create your first objective
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {orgObjectives.map((obj) => (
              <ObjectiveCard key={obj.id} objective={obj} orgSlug={slug} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
