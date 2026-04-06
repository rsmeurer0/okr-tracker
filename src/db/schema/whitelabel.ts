import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'
import { organizations } from './organizations'

export const whitelabelConfigs = pgTable('whitelabel_configs', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').unique().notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  logoUrl: text('logo_url'),
  primaryColor: text('primary_color').default('#6366f1').notNull(),
  secondaryColor: text('secondary_color').default('#8b5cf6').notNull(),
  accentColor: text('accent_color').default('#06b6d4').notNull(),
  customDomain: text('custom_domain').unique(),
  faviconUrl: text('favicon_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export type WhitelabelConfig = typeof whitelabelConfigs.$inferSelect
export type NewWhitelabelConfig = typeof whitelabelConfigs.$inferInsert
