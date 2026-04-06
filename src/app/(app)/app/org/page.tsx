import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserOrgs } from '@/lib/queries/orgs'

// Redirect to the user's first org or to create a new one
export default async function OrgIndexPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const orgs = await getUserOrgs(user.id)

  if (orgs.length === 0) {
    redirect('/app/org/new')
  }

  redirect(`/app/org/${orgs[0].slug}`)
}
