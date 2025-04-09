import { 
  pgTable, 
  uuid, 
  varchar, 
  timestamp, 
  text, 
  boolean, 
  json,
  pgEnum
} from 'drizzle-orm/pg-core';
import { companies } from './companies';
import { 
  SYSTEM_ACCESS_LEVELS,
  USER_DOMAINS,
  USER_STATUSES
} from '@/types/user';

// 시스템 접근 레벨 타입
export const systemAccessLevelEnum = pgEnum('system_access_level', SYSTEM_ACCESS_LEVELS);

// 사용자 도메인 타입
export const userDomainEnum = pgEnum('user_domain', USER_DOMAINS);

// 사용자 상태 타입
export const userStatusEnum = pgEnum('user_status', USER_STATUSES);

// 사용자 테이블
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  auth_id: uuid('auth_id').notNull().unique(), // Supabase Auth ID
  
  email: varchar('email', { length: 100 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(), // 해시 처리된 비밀번호
  name: varchar('name', { length: 100 }).notNull(),
  phone_number: varchar('phone_number', { length: 20 }).notNull(),
  
  company_id: uuid('company_id').references(() => companies.id, { onDelete: 'cascade' }), // 소속 업체 ID
  system_access_level: systemAccessLevelEnum('system_access_level').notNull().default('guest'),
  domains: json('domains').$type<string[]>().notNull().default([]), // 도메인(logistics, settlement, sales, etc) - 다중 선택 가능
  status: userStatusEnum('status').notNull().default('active'),
  
  department: varchar('department', { length: 100 }), // 부서 (선택 사항)
  position: varchar('position', { length: 100 }), // 직책 (선택 사항)
  rank: varchar('rank', { length: 100 }), // 직급 (선택 사항)
  
  last_login_at: timestamp('last_login_at'),
  created_by: uuid('created_by').notNull(),
  updated_by: uuid('updated_by').notNull(),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

// 사용자 로그인 이력 테이블
export const user_login_logs = pgTable('user_login_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  login_at: timestamp('login_at').notNull().defaultNow(),
  ip_address: varchar('ip_address', { length: 50 }),
  user_agent: varchar('user_agent', { length: 500 }),
  success: boolean('success').notNull(),
  fail_reason: varchar('fail_reason', { length: 100 }),
});


// 사용자 변경 이력 테이블
export const user_change_logs = pgTable('user_change_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  changed_by: uuid('changed_by').notNull().references(() => users.id, { onDelete: 'set null' }),
  changed_by_name: varchar('changed_by_name', { length: 100 }).notNull(),
  changed_by_email: varchar('changed_by_email', { length: 100 }).notNull(),
  changed_by_access_level: varchar('changed_by_access_level', { length: 50 }),
  change_type: varchar('change_type', { length: 20 }).notNull(), // 'update', 'status_change', 'delete' 등
  diff: json('diff').notNull(), // 변경 내용 (Before → After)
  reason: varchar('reason', { length: 255 }),
  created_at: timestamp('created_at').notNull().defaultNow(),
});
