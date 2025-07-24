import { 
    pgTable, 
    uuid, 
    varchar, 
    timestamp, 
    json,
    pgEnum
  } from 'drizzle-orm/pg-core';
 
  
  // 업체 상태 및 타입 열거형
  export const companyStatusEnum = pgEnum('company_status', ['active', 'inactive']);
  export const companyTypeEnum = pgEnum('company_type', ['broker', 'shipper', 'carrier']);

  export const bankCodeEnum = pgEnum('bank_code', [
    '001', // 한국은행
    '002', // 산업은행
    '003', // 기업은행
    '004', // 국민은행
    '007', // 수협은행
    '008', // 수출입은행
    '011', // 농협은행
    '020', // 우리은행
    '023', // SC제일은행
    '027', // 씨티은행
    '031', // 대구은행
    '032', // 부산은행
    '034', // 광주은행
    '035', // 제주은행
    '037', // 전북은행
    '039', // 경남은행
    '045', // 새마을금고중앙회
    '048', // 신협중앙회
    '050', // 상호저축은행
    '071', // 우체국
    '081', // 하나은행
    '088', // 신한은행
    '089', // 케이뱅크
    '090', // 카카오뱅크
    '092', // 토스뱅크
  ]);
  
  
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

    // 계좌 정보
    bankCode: bankCodeEnum('bank_code'),//은행코드    
    bankAccountNumber: varchar('bank_account_number', { length: 30 }),//계좌번호
    bankAccountHolder: varchar('bank_account_holder', { length: 50 }),//예금주

    createdBy: uuid('created_by'),
    updatedBy: uuid('updated_by'),
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
  