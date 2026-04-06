'use server'

import { createClient } from '@/lib/supabase/server'
import { db } from '@/db/drizzle'
import { organizations, memberships, whitelabelConfigs } from '@/db/schema'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

const brandingSchema = z.object({
  orgSlug: z.string(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  logoUrl: z.string().url().or(z.literal('')).optional(),
})

export async function updateBranding(input: z.infer<typeof brandingSchema>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const parsed = brandingSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const [org] = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(eq(organizations.slug, parsed.data.orgSlug))
    .limit(1)

  if (!org) return { error: 'Organization not found' }

  const [membership] = await db
    .select({ role: memberships.role })
    .from(memberships)
    .where(and(eq(memberships.userId, user.id), eq(memberships.orgId, org.id)))
    .limit(1)

  if (!membership || membership.role !== 'org_admin') {
    return { error: 'Only org admins can update branding' }
  }

  try {
    await db
      .update(whitelabelConfigs)
      .set({
        primaryColor: parsed.data.primaryColor,
        secondaryColor: parsed.data.secondaryColor,
        accentColor: parsed.data.accentColor,
        logoUrl: parsed.data.logoUrl || null,
        updatedAt: new Date(),
      })
      .where(eq(whitelabelConfigs.orgId, org.id))

    return { success: true }
  } catch {
    return { error: 'Failed to update branding' }
  }
}
