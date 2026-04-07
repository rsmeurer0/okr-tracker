import { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { CreateObjectiveForm } from '@/components/okr/create-objective-form'
import { notFound } from 'next/navigation'
import { getOrgBySlug } from '@/lib/queries/orgs'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = { title: 'New Objective' }

interface NewObjectivePageProps {
  params: Promise<{ slug: string }>
}

export default async function NewObjectivePage({ params }: NewObjectivePageProps) {
  const { slug } = await params
  const org = await getOrgBySlug(slug)
  if (!org) notFound()

  return (
    <>
      <Header />
      <div className="p-4 md:p-6 space-y-6 max-w-2xl">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/app/org/${slug}/objectives`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold">New Objective</h2>
            <p className="text-sm text-muted-foreground">Define what you want to achieve</p>
          </div>
        </div>
        <CreateObjectiveForm orgId={org.id} orgSlug={slug} />
      </div>
    </>
  )
}
