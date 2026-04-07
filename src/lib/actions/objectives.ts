'use server'

import { createClient } from '@/lib/supabase/server'
import { db } from '@/db/drizzle'
import { objectives, memberships, activityLog } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

const createObjectiveSchema = z.object({
  orgId: z.string().uuid(),
  title: z.string().min(3).max(300),
  description: z.string().optional(),
  period: z.string().min(1),
})

export async function createObjective(input: z.infer<typeof createObjectiveSchema>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const parsed = createObjectiveSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  // Verify membership
  const [membership] = await db
    .select({ role: memberships.role })
    .from(memberships)
    .where(and(eq(memberships.userId, user.id), eq(memberships.orgId, parsed.data.orgId)))
    .limit(1)

  if (!membership) return { error: 'You are not a member of this organization' }

  try {
    const [objective] = await db
      .insert(objectives)
      .values({
        orgId: parsed.data.orgId,
        ownerId: user.id,
        title: parsed.data.title,
        description: parsed.data.description || null,
        period: parsed.data.period,
      })
      .returning()

    // Log activity via service role (bypass RLS)
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const adminClient = createAdminClient()
    await adminClient.from('activity_log').insert({
      org_id: parsed.data.orgId,
      user_id: user.id,
      entity_type: 'objective',
      entity_id: objective.id,
      action: 'created',
      metadata: { title: objective.title },
    })

    return { id: objective.id }
  } catch {
    return { error: 'Failed to create objective' }
  }
}
