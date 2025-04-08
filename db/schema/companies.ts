import { 
  pgTable, 
  uuid, 
  varchar, 
  timestamp, 
  text, 
  json,
  pgEnum
} from 'drizzle-orm/pg-core';

// 업체 구분 타입
export const companyTypeEnum = pgEnum('company_type', ['화주', '운송사', '주선사']);

// 전표 구분 타입
export const statementTypeEnum = pgEnum('statement_type', ['매입처', '매출처']);

// 업체 상태 타입
export const companyStatusEnum = pgEnum('company_status', ['활성', '비활성']);

// 업체 테이블
export const companies = pgTable('companies', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  type: companyTypeEnum('type').notNull(),
  statementType: statementTypeEnum('statement_type').notNull(),
  businessNumber: varchar('business_number', { length: 20 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  representative: varchar('representative', { length: 100 }).notNull(),
  email: varchar('email', { length: 100 }),
  phoneNumber: varchar('phone_number', { length: 20 }).notNull(),
  faxNumber: varchar('fax_number', { length: 20 }),
  managerName: varchar('manager_name', { length: 100 }),
  managerPhoneNumber: varchar('manager_phone_number', { length: 20 }),
  status: companyStatusEnum('status').notNull().default('활성'),
  warnings: json('warnings').$type<{ id: string; text: string }[]>().default([]),
  files: json('files').$type<{ id: string; name: string; url: string; type: string }[]>().default([]),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// 업체 상태 변경 이력 테이블
export const companyStatusChangeLogs = pgTable('company_status_change_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  previousStatus: companyStatusEnum('previous_status').notNull(),
  newStatus: companyStatusEnum('new_status').notNull(),
  changedBy: uuid('changed_by').notNull(),
  reason: text('reason'),
  changedAt: timestamp('changed_at').notNull().defaultNow(),
});
