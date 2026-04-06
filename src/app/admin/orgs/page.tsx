import { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = { title: 'Organizations — Admin' }

export default async function AdminOrgsPage() {
  const adminClient = createAdminClient()
  const { data: orgs } = await adminClient
    .from('organizations')
    .select('*, memberships(count)')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Organizations</h1>
        <p className="text-sm text-muted-foreground">{orgs?.length ?? 0} total organizations</p>
      </div>

      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Slug</th>
              <th className="px-4 py-3 text-left font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {(orgs ?? []).map((org) => (
              <tr key={org.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">{org.name}</td>
                <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{org.slug}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(org.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
