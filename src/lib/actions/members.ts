'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { db } from '@/db/drizzle'
import { organizations, invitations, memberships } from '@/db/schema'
import { and, eq } from 'drizzle-orm'
import { randomBytes } from 'crypto'
import { z } from 'zod'

const inviteSchema = z.object({
  orgSlug: z.string(),
  email: z.string().email(),
  role: z.enum(['org_admin', 'org_member']),
})

export async function inviteMember(input: { orgSlug: string; email: string; role: 'org_admin' | 'org_member' }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const parsed = inviteSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const [org] = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(eq(organizations.slug, parsed.data.orgSlug))
    .limit(1)

  if (!org) return { error: 'Organization not found' }

  // Check caller is org_admin
  const [membership] = await db
    .select({ role: memberships.role })
    .from(memberships)
    .where(and(eq(memberships.userId, user.id), eq(memberships.orgId, org.id)))
    .limit(1)

  if (!membership || membership.role !== 'org_admin') {
    return { error: 'Only org admins can invite members' }
  }

  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  try {
    // Use admin client to bypass RLS for invitation insert
    const adminClient = createAdminClient()
    await adminClient.from('invitations').insert({
      org_id: org.id,
      email: parsed.data.email,
      role: parsed.data.role,
      invited_by: user.id,
      token,
      expires_at: expiresAt.toISOString(),
    })

    // TODO: Send invitation email via Resend
    // await sendInvitationEmail({ email, orgName, token })

    return { success: true }
  } catch {
    return { error: 'Failed to send invitation' }
  }
}
