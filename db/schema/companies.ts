import { 
  pgTable, 
  uuid, 
  varchar, 
  timestamp, 
  json,
  pgEnum
} from 'drizzle-orm/pg-core';
import { type UserId } from '@/types/schema';

// 업체 상태 및 타입 열거형
export const companyStatusEnum = pgEnum('company_status', ['active', 'inactive']);
export const companyTypeEnum = pgEnum('company_type', ['broker', 'shipper', 'carrier']);

// 업체 테이블
export const companies = pgTable('companies', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  businessNumber: varchar('business_number', { length: 20 }).notNull().unique(),
  ceoName: varchar('ceo_name', { length: 50 }).notNull(),
  type: companyTypeEnum('type').notNull(),
  status: companyStatusEnum('status').notNull().default('active'),
  addressPostal: varchar('address_postal', { length: 10 }),
  addressRoad: varchar('address_road', { length: 200 }),
  addressDetail: varchar('address_detail', { length: 200 }),
  contactTel: varchar('contact_tel', { length: 20 }),
  contactMobile: varchar('contact_mobile', { length: 20 }),
  contactEmail: varchar('contact_email', { length: 100 }),
  createdBy: uuid('created_by').notNull(),
  updatedBy: uuid('updated_by').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 회사 변경 이력 테이블
export const companyChangeLogs = pgTable('company_change_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyId: uuid('company_id').notNull(),
  changedBy: uuid('changed_by').notNull(),
  changedByName: varchar('changed_by_name', { length: 100 }).notNull(),
  changedByEmail: varchar('changed_by_email', { length: 100 }).notNull(),
  changedByAccessLevel: varchar('changed_by_access_level', { length: 50 }),
  changeType: varchar('change_type', { length: 30 }).notNull(),
  diff: json('diff').notNull(),
  reason: varchar('reason', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
});
