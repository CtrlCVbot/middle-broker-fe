import { pgTable, text, timestamp, uuid, varchar, jsonb } from 'drizzle-orm/pg-core';
import { addresses } from './addresses';

export const addressChangeLogs = pgTable('address_change_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  addressId: uuid('address_id').notNull().references(() => addresses.id),  
  changedBy: uuid('changed_by').notNull(),
  changedByName: varchar('changed_by_name', { length: 100 }).notNull(),
  changedByEmail: varchar('changed_by_email', { length: 255 }).notNull(),
  changedByAccessLevel: varchar('changed_by_access_level', { length: 50 }),
  changeType: varchar('change_type', { length: 20 }).notNull(),
  changes: jsonb('changes').notNull(),
  reason: text('reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}); 