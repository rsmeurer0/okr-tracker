'use server'

import { createClient } from '@/lib/supabase/server'
import { db } from '@/db/drizzle'
import { organizations, memberships, whitelabelConfigs } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const createOrgSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
})

export async function createOrg(input: { name: string; slug: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const parsed = createOrgSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  // Check slug uniqueness
  const [existing] = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(eq(organizations.slug, parsed.data.slug))
    .limit(1)

  if (existing) return { error: 'This slug is already taken' }

  try {
    const [org] = await db
      .insert(organizations)
      .values({ name: parsed.data.name, slug: parsed.data.slug })
      .returning()

    // Make the creator an org_admin
    await db.insert(memberships).values({
      userId: user.id,
      orgId: org.id,
      role: 'org_admin',
    })

    // Create default whitelabel config
    await db.insert(whitelabelConfigs).values({ orgId: org.id })

    return { slug: org.slug }
  } catch {
    return { error: 'Failed to create organization. Please try again.' }
  }
}
