/**
 * API 타입 열거형
 */
export type ApiType = 'directions' | 'search-address';

/**
 * API 사용량 기록 인터페이스
 */
export interface IApiUsageRecord {
  id: string;
  apiType: ApiType;
  endpoint?: string;
  requestParams: any;
  responseStatus: number;
  responseTimeMs: number;
  success: boolean;
  errorMessage?: string;
  resultCount?: number;
  userId?: string;
  ipAddress: string;
  userAgent?: string;
  estimatedCost?: number;
  createdAt: Date;
}

/**
 * API 사용량 통계 인터페이스
 */
export interface IApiUsageStats {
  period: 'day' | 'week' | 'month';
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  avgResponseTime: number;
  totalCost: number;
  apiBreakdown: {
    [apiType: string]: {
      calls: number;
      successRate: number;
      avgResponseTime: number;
    };
  };
}

/**
 * API 사용량 생성 요청 인터페이스
 */
export interface ICreateApiUsageRequest {
  apiType: ApiType;
  endpoint?: string;
  requestParams: any;
  responseStatus: number;
  responseTimeMs: number;
  success: boolean;
  errorMessage?: string;
  resultCount?: number;
  userId?: string;
  ipAddress: string;
  userAgent?: string;
  estimatedCost?: number;
}

/**
 * API 사용량 조회 필터 인터페이스
 */
export interface IApiUsageFilter {
  apiType?: ApiType;
  success?: boolean;
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}

/**
 * API 사용량 일별 통계 인터페이스
 */
export interface IDailyApiStats {
  date: string;
  apiType: ApiType;
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  avgResponseTime: number;
  totalCost: number;
}

/**
 * API 사용량 요약 인터페이스
 */
export interface IApiUsageSummary {
  today: {
    totalCalls: number;
    successRate: number;
    avgResponseTime: number;
    totalCost: number;
  };
  thisWeek: {
    totalCalls: number;
    successRate: number;
    avgResponseTime: number;
    totalCost: number;
  };
  thisMonth: {
    totalCalls: number;
    successRate: number;
    avgResponseTime: number;
    totalCost: number;
  };
}

/**
 * Rate Limit 정보 인터페이스
 */
export interface IRateLimitInfo {
  userId: string;
  callCount: number;
  windowStart: Date;
  isLimited: boolean;
} 