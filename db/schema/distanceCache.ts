import { 
  pgTable, 
  uuid, 
  varchar, 
  numeric, 
  integer, 
  boolean, 
  timestamp, 
  json, 
  pgEnum, 
  index 
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { addresses } from '@/db/schema/addresses';
import { IKakaoDirectionsResponse, ICoordinates } from '@/types/distance';

// 경로 우선순위 Enum 정의
export const routePriorityEnum = pgEnum('route_priority', [
  'RECOMMEND',  // 추천 경로 (기본)
  'TIME',       // 빠른 경로
  'DISTANCE'    // 짧은 경로
]);

// 거리 계산 방법 Enum 정의
export const calculationMethodEnum = pgEnum('calculation_method', [
  'api',        // API 호출로 계산
  'cached',     // 캐시에서 조회
  'manual'      // 수동 입력
]);

// 거리 캐시 테이블
export const distanceCache = pgTable('distance_cache', {
  id: uuid('id').defaultRandom().primaryKey(),

  // 주소 정보 (외래키 참조)
  pickupAddressId: uuid('pickup_address_id')
    .notNull()
    .references(() => addresses.id),
  deliveryAddressId: uuid('delivery_address_id')
    .notNull()
    .references(() => addresses.id),

  // 좌표 정보 (JSON으로 저장)
  pickupCoordinates: json('pickup_coordinates').$type<ICoordinates>().notNull(),
  deliveryCoordinates: json('delivery_coordinates').$type<ICoordinates>().notNull(),

  // 거리 및 시간 정보
  distanceKm: numeric('distance_km', { precision: 10, scale: 2 }).notNull(),
  durationMinutes: integer('duration_minutes').notNull(),

  // 경로 설정
  routePriority: routePriorityEnum('route_priority').notNull().default('RECOMMEND'),
  
  // 카카오 API 원본 응답 저장
  kakaoResponse: json('kakao_response').$type<IKakaoDirectionsResponse>(),

  // 유효성 검증
  isValid: boolean('is_valid').notNull().default(true),
  
  // 생성/수정 정보
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  // 주소 쌍별 조회 최적화 (복합 인덱스)
  index('idx_distance_cache_address_pair')
    .on(table.pickupAddressId, table.deliveryAddressId, table.routePriority),
  
  // 최신 데이터 조회 최적화
  index('idx_distance_cache_latest')
    .on(table.pickupAddressId, table.deliveryAddressId, table.createdAt.desc()),
  
  // 유효한 캐시 데이터 조회
  index('idx_distance_cache_valid')
    .on(table.isValid, table.createdAt.desc())
    .where(sql`${table.isValid} = true`),

  // 좌표 기반 조회 (위치 기반 검색 시 사용) => json은 btree 인덱스 불가
  // index('idx_distance_cache_coordinates')
  //   .on(table.pickupCoordinates, table.deliveryCoordinates),
]);

// TypeScript 타입 추론을 위한 타입 export
export type DistanceCache = typeof distanceCache.$inferSelect;
export type NewDistanceCache = typeof distanceCache.$inferInsert; 