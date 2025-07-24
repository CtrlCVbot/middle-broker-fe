import { 
  pgTable, 
  uuid, 
  varchar, 
  timestamp, 
  text,
  integer
} from 'drizzle-orm/pg-core';
import { companies } from './companies';

// 업체 주의사항 테이블
export const companyWarnings = pgTable('company_warnings', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyId: uuid('company_id'),
  text: text('text').notNull(),
  category: varchar('category', { length: 50 }).default('기타'),
  sortOrder: integer('sort_order').default(0),
  createdBy: uuid('created_by'),
  updatedBy: uuid('updated_by'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
}); 