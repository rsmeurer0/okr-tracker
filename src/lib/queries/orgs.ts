import { db } from '@/db/drizzle'
import { memberships, organizations, whitelabelConfigs } from '@/db/schema'
import { eq } from 'drizzle-orm'
import type { OrgContext } from '@/types'

export async function getUserOrgs(userId: string): Promise<OrgContext[]> {
  const rows = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      slug: organizations.slug,
      role: memberships.role,
      primaryColor: whitelabelConfigs.primaryColor,
      secondaryColor: whitelabelConfigs.secondaryColor,
      accentColor: whitelabelConfigs.accentColor,
      logoUrl: whitelabelConfigs.logoUrl,
    })
    .from(memberships)
    .innerJoin(organizations, eq(memberships.orgId, organizations.id))
    .leftJoin(whitelabelConfigs, eq(whitelabelConfigs.orgId, organizations.id))
    .where(eq(memberships.userId, userId))

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    role: r.role,
    whitelabel: r.primaryColor
      ? {
          id: '',
          orgId: r.id,
          primaryColor: r.primaryColor,
          secondaryColor: r.secondaryColor ?? '#8b5cf6',
          accentColor: r.accentColor ?? '#06b6d4',
          logoUrl: r.logoUrl ?? null,
          customDomain: null,
          faviconUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      : null,
  }))
}

export async function getOrgBySlug(slug: string) {
  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.slug, slug))
    .limit(1)
  return org ?? null
}
