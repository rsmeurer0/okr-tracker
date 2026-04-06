import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core'
import { organizations } from './organizations'
import { profiles } from './profiles'

export const activityLog = pgTable('activity_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'set null' }),
  entityType: text('entity_type').notNull(), // 'objective' | 'key_result' | 'check_in' | 'membership'
  entityId: uuid('entity_id').notNull(),
  action: text('action').notNull(), // 'created' | 'updated' | 'deleted' | 'checked_in'
  metadata: jsonb('metadata').default({}).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export type ActivityLog = typeof activityLog.$inferSelect
export type NewActivityLog = typeof activityLog.$inferInsert
