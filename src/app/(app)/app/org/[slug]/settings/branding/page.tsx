import { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { getOrgBySlug } from '@/lib/queries/orgs'
import { db } from '@/db/drizzle'
import { whitelabelConfigs } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { BrandingForm } from '@/components/org/branding-form'

export const metadata: Metadata = { title: 'Branding' }

interface BrandingPageProps {
  params: Promise<{ slug: string }>
}

export default async function BrandingPage({ params }: BrandingPageProps) {
  const { slug } = await params
  const org = await getOrgBySlug(slug)
  if (!org) notFound()

  const [config] = await db
    .select()
    .from(whitelabelConfigs)
    .where(eq(whitelabelConfigs.orgId, org.id))
    .limit(1)

  return (
    <>
      <Header title="Branding" />
      <div className="p-4 md:p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Branding</h2>
          <p className="text-sm text-muted-foreground">Customize your organization&apos;s visual identity</p>
        </div>
        <BrandingForm orgSlug={slug} config={config} />
      </div>
    </>
  )
}
