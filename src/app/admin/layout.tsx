import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const adminClient = createAdminClient()
  const { data: profile } = await adminClient
    .from('profiles')
    .select('is_super_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_super_admin) redirect('/app/org')

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background sticky top-0 z-10">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <a href="/app/org" className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to app
            </a>
            <span className="text-muted-foreground">/</span>
            <span className="font-semibold text-sm">Admin Panel</span>
          </div>
        </div>
      </header>
      <div className="container mx-auto p-4 md:p-6">
        {children}
      </div>
    </div>
  )
}
