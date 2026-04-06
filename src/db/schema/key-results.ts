import { pgTable, uuid, text, numeric, integer, timestamp } from 'drizzle-orm/pg-core'
import { organizations } from './organizations'
import { objectives } from './objectives'
import { profiles } from './profiles'

export const metricTypes = ['percentage', 'number', 'currency', 'boolean'] as const
export type MetricType = typeof metricTypes[number]

export const keyResults = pgTable('key_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  objectiveId: uuid('objective_id').notNull().references(() => objectives.id, { onDelete: 'cascade' }),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  ownerId: uuid('owner_id').references(() => profiles.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  metricType: text('metric_type', { enum: metricTypes }).notNull().default('percentage'),
  startValue: numeric('start_value', { precision: 15, scale: 4 }).default('0').notNull(),
  targetValue: numeric('target_value', { precision: 15, scale: 4 }).notNull(),
  currentValue: numeric('current_value', { precision: 15, scale: 4 }).default('0').notNull(),
  progress: integer('progress').default(0).notNull(), // 0-100
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export type KeyResult = typeof keyResults.$inferSelect
export type NewKeyResult = typeof keyResults.$inferInsert
