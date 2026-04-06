import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getOrgBySlug } from '@/lib/queries/orgs'
import { db } from '@/db/drizzle'
import { objectives, keyResults, memberships } from '@/db/schema'
import { eq, count } from 'drizzle-orm'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Target, Users, TrendingUp, Activity } from 'lucide-react'
import { notFound } from 'next/navigation'

export const metadata: Metadata = { title: 'Dashboard' }

interface DashboardPageProps {
  params: Promise<{ slug: string }>
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { slug } = await params
  const org = await getOrgBySlug(slug)
  if (!org) notFound()

  const [objectiveCount, krCount, memberCount] = await Promise.all([
    db.select({ count: count() }).from(objectives).where(eq(objectives.orgId, org.id)),
    db.select({ count: count() }).from(keyResults).where(eq(keyResults.orgId, org.id)),
    db.select({ count: count() }).from(memberships).where(eq(memberships.orgId, org.id)),
  ])

  const stats = [
    { label: 'Objectives', value: objectiveCount[0].count, icon: Target },
    { label: 'Key Results', value: krCount[0].count, icon: TrendingUp },
    { label: 'Members', value: memberCount[0].count, icon: Users },
    { label: 'Active Period', value: `Q${Math.ceil((new Date().getMonth() + 1) / 3)} ${new Date().getFullYear()}`, icon: Activity },
  ]

  return (
    <>
      <Header title={org.name} />
      <div className="p-4 md:p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Overview of your organization&apos;s OKRs</p>
        </div>

        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Getting started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1. Go to <strong>Objectives</strong> to create your first OKR</p>
            <p>2. Add <strong>Key Results</strong> to each objective</p>
            <p>3. Invite your team via <strong>Settings → Members</strong></p>
            <p>4. Track progress with regular <strong>check-ins</strong></p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
