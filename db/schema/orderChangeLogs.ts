import { pgTable, uuid, varchar, timestamp, json, pgEnum } from 'drizzle-orm/pg-core';

// 변경 유형 Enum 정의
export const orderChangeTypeEnum = pgEnum('order_change_type', [
  'create',
  'update',
  'updateStatus',
  'cancel',
  'delete'
]);

// 화물 변경 이력 테이블
export const orderChangeLogs = pgTable('order_change_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // 변경된 화물 정보
  orderId: uuid('order_id').notNull(),
  
  // 변경 정보
  changeType: orderChangeTypeEnum('change_type').notNull(),
  changedBy: uuid('changed_by').notNull(),
  changedByName: varchar('changed_by_name', { length: 100 }),
  changedByEmail: varchar('changed_by_email', { length: 100 }),
  changedByAccessLevel: varchar('changed_by_access_level', { length: 50 }),
  changedAt: timestamp('changed_at').defaultNow().notNull(),
  
  // 데이터 스냅샷
  oldData: json('old_data'),
  newData: json('new_data'),
  
  // 변경 이유
  reason: varchar('reason', { length: 500 })
}); 