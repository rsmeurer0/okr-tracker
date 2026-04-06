import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserOrgs, getOrgBySlug } from '@/lib/queries/orgs'
import { db } from '@/db/drizzle'
import { memberships } from '@/db/schema'
import { and, eq } from 'drizzle-orm'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'
import type { Profile } from '@/types'
import { profiles } from '@/db/schema'

interface OrgLayoutProps {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

export default async function OrgLayout({ children, params }: OrgLayoutProps) {
  const { slug } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const org = await getOrgBySlug(slug)
  if (!org) notFound()

  const [membership] = await db
    .select()
    .from(memberships)
    .where(and(eq(memberships.userId, user.id), eq(memberships.orgId, org.id)))
    .limit(1)

  if (!membership) redirect('/app/org')

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1)

  const allOrgs = await getUserOrgs(user.id)
  const currentOrg = allOrgs.find((o) => o.slug === slug)!

  const brandVars = currentOrg.whitelabel
    ? {
        '--brand-primary': currentOrg.whitelabel.primaryColor,
        '--brand-secondary': currentOrg.whitelabel.secondaryColor,
        '--brand-accent': currentOrg.whitelabel.accentColor,
      }
    : {}

  return (
    <div style={brandVars as React.CSSProperties} className="flex h-screen overflow-hidden">
      <SidebarProvider>
        <AppSidebar
          currentOrg={currentOrg}
          orgs={allOrgs}
          user={profile as Profile}
        />
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          {children}
        </main>
      </SidebarProvider>
      <MobileNav orgSlug={slug} />
    </div>
  )
}
