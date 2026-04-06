import { pgTable, uuid, text, timestamp, unique } from 'drizzle-orm/pg-core'
import { profiles } from './profiles'
import { organizations } from './organizations'

export const membershipRoles = ['org_admin', 'org_member'] as const
export type MembershipRole = typeof membershipRoles[number]

export const memberships = pgTable('memberships', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  role: text('role', { enum: membershipRoles }).notNull().default('org_member'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  uniqueUserOrg: unique().on(t.userId, t.orgId),
}))

export type Membership = typeof memberships.$inferSelect
export type NewMembership = typeof memberships.$inferInsert
