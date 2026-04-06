import { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Building2, Users, Target } from 'lucide-react'

export const metadata: Metadata = { title: 'Admin Dashboard' }

export default async function AdminDashboardPage() {
  const adminClient = createAdminClient()

  const [
    { count: orgCount },
    { count: userCount },
    { count: objectiveCount },
  ] = await Promise.all([
    adminClient.from('organizations').select('*', { count: 'exact', head: true }),
    adminClient.from('profiles').select('*', { count: 'exact', head: true }),
    adminClient.from('objectives').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: 'Organizations', value: orgCount ?? 0, icon: Building2, href: '/admin/orgs' },
    { label: 'Users', value: userCount ?? 0, icon: Users, href: '/admin/users' },
    { label: 'Objectives', value: objectiveCount ?? 0, icon: Target, href: null },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">Platform-wide statistics and management</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-3xl font-bold">{stat.value}</div>
              {stat.href && (
                <Button asChild variant="link" className="p-0 h-auto text-xs">
                  <Link href={stat.href}>View all →</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
