import { 
  pgTable, 
  uuid, 
  varchar, 
  timestamp, 
  text,
  jsonb
} from 'drizzle-orm/pg-core';
import { companies } from './companies';
import { companyWarnings } from './companyWarnings';

// 업체 주의사항 변경 로그 테이블
export const companyWarningLogs = pgTable('company_warning_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyId: uuid('company_id'),
  warningId: uuid('warning_id'),
  action: varchar('action', { length: 20 }).notNull(), // create, update, delete
  previousData: jsonb('previous_data'), // 이전 데이터 (수정/삭제 시)
  newData: jsonb('new_data'), // 새 데이터 (생성/수정 시)
  reason: text('reason'), // 변경 사유
  createdBy: uuid('created_by').notNull(), // 변경한 사용자
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}); 