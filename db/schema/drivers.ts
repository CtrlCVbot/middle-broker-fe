import { 
  pgTable, 
  uuid, 
  varchar, 
  timestamp, 
  json,
  pgEnum,
  integer,
  boolean,
  decimal,
  foreignKey
} from 'drizzle-orm/pg-core';
import { companies } from './companies';
import { users } from './users';
import { IAddressSnapshot, IUserSnapshot } from '@/types/order-ver01';
import { vehicleWeightEnum, vehicleTypeEnum } from './orders';


// 권한 유형 열거형
export const permissionTypeEnum = pgEnum('permission_type', ['일반']);

// 차주 타입 열거형
export const drivercompanyTypeEnum = pgEnum('driver_company_type', ['개인', '소속']);


// 차주 테이블
export const drivers = pgTable('drivers', {
  id: uuid('id').defaultRandom().primaryKey(),  
  name: varchar('name', { length: 100 }).notNull(),
  phoneNumber: varchar('phone_number', { length: 20 }).notNull(),
  vehicleNumber: varchar('vehicle_number', { length: 20 }).notNull(),
  vehicleType: vehicleTypeEnum('vehicle_type').notNull(),
  vehicleWeight: vehicleWeightEnum('vehicle_weight').notNull(),
  
  addressSnapshot: json('address_snapshot').$type<IAddressSnapshot>(),

  companyType: drivercompanyTypeEnum('company_type').notNull().default('개인'),
  companyId: uuid('company_id').references(() => companies.id),
  businessNumber: varchar('business_number', { length: 20 }).notNull(),  

  manufactureYear: varchar('manufacture_year', { length: 10 }),
  isActive: boolean('is_active').default(true),
  inactiveReason: varchar('inactive_reason', { length: 200 }),
  
  lastDispatchedAt: timestamp('last_dispatched_at'), 
  
  createdBy: uuid('created_by').references(() => users.id),
  createdBySnapshot: json('created_by_snapshot').$type<IUserSnapshot>(),
  createdAt: timestamp('created_at').defaultNow(),
  
  updatedBy: uuid('updated_by').references(() => users.id),
  updatedBySnapshot: json('updated_by_snapshot').$type<IUserSnapshot>(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 차주 계정 테이블
export const driverAccounts = pgTable('driver_accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  driverId: uuid('driver_id').notNull().references(() => drivers.id),
  email: varchar('email', { length: 100 }),
  permission: permissionTypeEnum('permission').notNull().default('일반'),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedBy: uuid('updated_by').notNull().references(() => users.id),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 차주 특이사항 테이블
export const driverNotes = pgTable('driver_notes', {
  id: uuid('id').defaultRandom().primaryKey(),
  driverId: uuid('driver_id').notNull().references(() => drivers.id),
  content: varchar('content', { length: 500 }).notNull(),
  date: timestamp('date').notNull().defaultNow(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedBy: uuid('updated_by').notNull().references(() => users.id),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 차주 변경 이력 테이블
export const driverChangeLogs = pgTable('driver_change_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  driverId: uuid('driver_id').notNull().references(() => drivers.id),
  changedBy: uuid('changed_by').notNull().references(() => users.id),
  changedByName: varchar('changed_by_name', { length: 100 }).notNull(),
  changedByEmail: varchar('changed_by_email', { length: 100 }).notNull(),
  changedByAccessLevel: varchar('changed_by_access_level', { length: 50 }),
  changeType: varchar('change_type', { length: 30 }).notNull(),
  diff: json('diff').notNull(),
  reason: varchar('reason', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
});
