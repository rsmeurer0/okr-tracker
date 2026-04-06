import { pgTable, uuid, text, numeric, timestamp } from 'drizzle-orm/pg-core'
import { organizations } from './organizations'
import { keyResults } from './key-results'
import { profiles } from './profiles'

export const confidenceLevels = ['high', 'medium', 'low'] as const
export type ConfidenceLevel = typeof confidenceLevels[number]

export const checkIns = pgTable('check_ins', {
  id: uuid('id').primaryKey().defaultRandom(),
  keyResultId: uuid('key_result_id').notNull().references(() => keyResults.id, { onDelete: 'cascade' }),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  authorId: uuid('author_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  value: numeric('value', { precision: 15, scale: 4 }).notNull(),
  note: text('note'),
  confidence: text('confidence', { enum: confidenceLevels }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export type CheckIn = typeof checkIns.$inferSelect
export type NewCheckIn = typeof checkIns.$inferInsert
