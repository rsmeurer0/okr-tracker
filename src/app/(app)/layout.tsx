import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/db/drizzle'
import { profiles } from '@/db/schema'
import { eq } from 'drizzle-orm'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Ensure profile exists (first login race condition)
  await db
    .insert(profiles)
    .values({
      id: user.id,
      email: user.email!,
      fullName: user.user_metadata?.full_name ?? null,
      avatarUrl: user.user_metadata?.avatar_url ?? null,
    })
    .onConflictDoNothing()

  return <>{children}</>
}
