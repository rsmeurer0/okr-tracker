import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core'
import { organizations } from './organizations'
import { profiles } from './profiles'

export const objectiveStatuses = ['on_track', 'at_risk', 'behind', 'completed'] as const
export type ObjectiveStatus = typeof objectiveStatuses[number]

export const objectives = pgTable('objectives', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  ownerId: uuid('owner_id').references(() => profiles.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  description: text('description'),
  period: text('period').notNull(), // e.g. '2026-Q2'
  status: text('status', { enum: objectiveStatuses }).notNull().default('on_track'),
  progress: integer('progress').default(0).notNull(), // 0-100
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export type Objective = typeof objectives.$inferSelect
export type NewObjective = typeof objectives.$inferInsert
