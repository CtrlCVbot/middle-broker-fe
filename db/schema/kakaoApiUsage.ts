import { 
  pgTable, 
  uuid, 
  varchar, 
  integer, 
  boolean, 
  timestamp, 
  json, 
  pgEnum, 
  index 
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '@/db/schema/users';

// API 타입 Enum 정의
export const apiTypeEnum = pgEnum('kakao_api_type', [
  'directions',      // 길찾기 API
  'search-address'   // 주소 검색 API
]);

// API 사용량 기록 테이블
export const kakaoApiUsage = pgTable('kakao_api_usage', {
  id: uuid('id').defaultRandom().primaryKey(),

  // API 정보
  apiType: apiTypeEnum('api_type').notNull(),
  endpoint: varchar('endpoint', { length: 200 }), // 호출된 엔드포인트

  // 요청/응답 정보
  requestParams: json('request_params').notNull(), // 요청 파라미터
  responseStatus: integer('response_status').notNull(), // HTTP 상태 코드
  responseTimeMs: integer('response_time_ms').notNull(), // 응답 시간 (밀리초)

  // 결과 정보
  success: boolean('success').notNull(), // 성공 여부
  errorMessage: varchar('error_message', { length: 500 }), // 에러 메시지 (실패 시)
  resultCount: integer('result_count'), // 반환된 결과 개수

  // 사용자 정보
  userId: uuid('user_id').references(() => users.id), // 요청한 사용자
  ipAddress: varchar('ip_address', { length: 45 }).notNull(), // 요청자 IP (IPv6 지원)
  userAgent: varchar('user_agent', { length: 500 }), // 브라우저 정보

  // 비용 정보
  estimatedCost: integer('estimated_cost'), // 예상 비용 (원 단위)

  // 생성 정보
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  // API 타입별 통계 조회 최적화
  index('idx_kakao_api_usage_type_date')
    .on(table.apiType, table.createdAt.desc()),
  
  // 사용자별 사용량 조회 최적화
  index('idx_kakao_api_usage_user_date')
    .on(table.userId, table.createdAt.desc()),
  
  // 성공/실패별 조회 최적화
  index('idx_kakao_api_usage_success_date')
    .on(table.success, table.createdAt.desc()),
  
  // 응답 시간 성능 분석용
  index('idx_kakao_api_usage_performance')
    .on(table.responseTimeMs, table.createdAt.desc()),

  // 일일/월간 통계 집계용
  index('idx_kakao_api_usage_daily_stats')
    .on(sql`DATE(${table.createdAt})`, table.apiType, table.success),

  // 에러 분석용 (실패한 케이스만)
  index('idx_kakao_api_usage_errors')
    .on(table.responseStatus, table.createdAt.desc())
    .where(sql`${table.success} = false`),
]);

// TypeScript 타입 추론을 위한 타입 export
export type KakaoApiUsage = typeof kakaoApiUsage.$inferSelect;
export type NewKakaoApiUsage = typeof kakaoApiUsage.$inferInsert; 