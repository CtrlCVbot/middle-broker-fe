import { 
  pgTable, 
  uuid, 
  varchar, 
  text, 
  boolean, 
  timestamp, 
  jsonb 
} from 'drizzle-orm/pg-core';

// 주소 테이블 정의
export const addresses = pgTable('addresses', {
  // 기본 정보
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),           // 장소명
  type: varchar('type', { length: 10 }).notNull(),            // 상/하차지 구분 (load, drop, any)
  
  // 주소 정보
  roadAddress: text('road_address').notNull(),                // 도로명 주소
  jibunAddress: text('jibun_address').notNull(),              // 지번 주소
  detailAddress: text('detail_address'),                      // 상세 주소
  postalCode: varchar('postal_code', { length: 10 }),         // 우편번호
  
  // 메타데이터
  metadata: jsonb('metadata').default({}).notNull(),          // 메타데이터 (originalInput, source, lat, lng, buildingName, floor, tags)
  
  // 연락처 정보
  contactName: varchar('contact_name', { length: 50 }),       // 담당자명
  contactPhone: varchar('contact_phone', { length: 20 }),     // 전화번호
  
  // 추가 정보
  memo: text('memo'),                                         // 메모
  isFrequent: boolean('is_frequent').default(false).notNull(),// 자주 쓰는 주소
  
  // 감사 로그
  createdAt: timestamp('created_at').defaultNow().notNull(),  // 등록일
  updatedAt: timestamp('updated_at').defaultNow().notNull(),  // 수정일
  createdBy: uuid('created_by'),                              // 등록자
  updatedBy: uuid('updated_by'),                              // 수정자
});

// 주소 변경 이력 테이블 정의
export const addressChangeLogs = pgTable('address_change_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  addressId: uuid('address_id').notNull().references(() => addresses.id),
  userId: uuid('user_id').notNull(),
  changedBy: uuid('changed_by').notNull(),
  changedByName: varchar('changed_by_name', { length: 100 }).notNull(),
  changedByEmail: varchar('changed_by_email', { length: 255 }).notNull(),
  changedByAccessLevel: varchar('changed_by_access_level', { length: 50 }),
  changeType: varchar('change_type', { length: 20 }).notNull(),
  diff: jsonb('diff').default({}).notNull(),
  reason: text('reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}); 