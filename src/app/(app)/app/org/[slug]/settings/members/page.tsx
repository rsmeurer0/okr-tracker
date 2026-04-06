import { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { getOrgBySlug } from '@/lib/queries/orgs'
import { db } from '@/db/drizzle'
import { memberships, profiles } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { InviteMemberButton } from '@/components/org/invite-member-button'

export const metadata: Metadata = { title: 'Members' }

interface MembersPageProps {
  params: Promise<{ slug: string }>
}

export default async function MembersPage({ params }: MembersPageProps) {
  const { slug } = await params
  const org = await getOrgBySlug(slug)
  if (!org) notFound()

  const members = await db
    .select({
      id: profiles.id,
      fullName: profiles.fullName,
      email: profiles.email,
      avatarUrl: profiles.avatarUrl,
      role: memberships.role,
    })
    .from(memberships)
    .innerJoin(profiles, eq(memberships.userId, profiles.id))
    .where(eq(memberships.orgId, org.id))

  return (
    <>
      <Header title="Members" />
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Members</h2>
            <p className="text-sm text-muted-foreground">{members.length} member{members.length !== 1 ? 's' : ''}</p>
          </div>
          <InviteMemberButton orgSlug={slug} />
        </div>

        <div className="space-y-2">
          {members.map((member) => {
            const name = member.fullName ?? member.email
            const initials = name.slice(0, 2).toUpperCase()
            return (
              <div key={member.id} className="flex items-center gap-3 rounded-lg border p-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={member.avatarUrl ?? undefined} alt={name} />
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{name}</p>
                  <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                </div>
                <Badge variant={member.role === 'org_admin' ? 'default' : 'secondary'}>
                  {member.role === 'org_admin' ? 'Admin' : 'Member'}
                </Badge>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
