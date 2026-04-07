import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/db/drizzle'
import { profiles } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = { title: 'Profile Settings' }

export default async function ProfileSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1)

  if (!profile) redirect('/auth/login')

  const name = profile.fullName ?? profile.email
  const initials = name.slice(0, 2).toUpperCase()

  return (
    <div className="flex min-h-screen items-start justify-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Profile Settings</h1>
          <p className="text-sm text-muted-foreground">Your account information</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile.avatarUrl ?? undefined} alt={name} />
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{profile.fullName ?? 'No name set'}</p>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
                {profile.isSuperAdmin && (
                  <Badge className="mt-1" variant="default">Super Admin</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground text-center">
          Profile editing coming soon. To update your name or avatar, sign out and sign in again with an OAuth provider.
        </p>
      </div>
    </div>
  )
}
