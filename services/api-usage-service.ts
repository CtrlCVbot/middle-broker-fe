import { db } from '@/db';
import { kakaoApiUsage } from '@/db/schema';
import { eq, and, desc, gte, lt, sql } from 'drizzle-orm';
import { 
  IApiUsageRecord, 
  IApiUsageStats, 
  ICreateApiUsageRequest,
  IApiUsageFilter,
  IDailyApiStats,
  IApiUsageSummary,
  IRateLimitInfo,
  ApiType
} from '@/types/api-usage';

/**
 * API 사용량 관리 서비스
 * 
 * 주요 기능:
 * 1. API 호출 기록 저장
 * 2. 사용량 통계 조회
 * 3. Rate Limiting 관리
 * 4. 비용 계산
 */
export class ApiUsageService {
  
  // Rate Limiting 설정
  private static readonly RATE_LIMIT_WINDOW = 60 * 1000; // 1분
  private static readonly RATE_LIMIT_MAX_CALLS = 10; // 1분에 최대 10회
  private static rateLimitMap = new Map<string, IRateLimitInfo>();
  
  /**
   * API 사용량 기록
   */
  static async recordUsage(record: ICreateApiUsageRequest): Promise<string> {
    try {
      const result = await db
        .insert(kakaoApiUsage)
        .values({
          apiType: record.apiType,
          endpoint: record.endpoint,
          requestParams: record.requestParams,
          responseStatus: record.responseStatus,
          responseTimeMs: record.responseTimeMs,
          success: record.success,
          errorMessage: record.errorMessage,
          resultCount: record.resultCount,
          userId: record.userId,
          ipAddress: record.ipAddress,
          userAgent: record.userAgent,
          estimatedCost: record.estimatedCost ||  0
        })
        .returning({ id: kakaoApiUsage.id });
        
      const usageId = result[0].id;
      console.log(`📊 API 사용량 기록됨: ${usageId} (${record.apiType})`);
      return usageId;
    } catch (error) {
      console.error('API 사용량 기록 실패:에러 너무 길수있어 출력 안함');//, error);
      throw new Error(`API 사용량 기록 실패: ${error instanceof Error ? 
        "에러 너무 길수있어 출력 안함"//error.message 
        : 'Unknown error'}`);
    }
  }
  
  /**
   * 사용량 통계 조회
   */
  static async getUsageStats(period: 'day' | 'week' | 'month' = 'day'): Promise<IApiUsageStats> {
    try {
      const dateCondition = this.getDateCondition(period);
      
      // 전체 통계
      const totalStatsResult = await db
        .select({
          totalCalls: sql<number>`count(*)`,
          successfulCalls: sql<number>`sum(case when success = true then 1 else 0 end)`,
          failedCalls: sql<number>`sum(case when success = false then 1 else 0 end)`,
          avgResponseTime: sql<number>`avg(response_time_ms)`,
          totalCost: sql<number>`sum(estimated_cost)`
        })
        .from(kakaoApiUsage)
        .where(dateCondition);
        
      const totalStats = totalStatsResult[0];
      
      // API 타입별 통계
      const apiBreakdownResult = await db
        .select({
          apiType: kakaoApiUsage.apiType,
          calls: sql<number>`count(*)`,
          successfulCalls: sql<number>`sum(case when success = true then 1 else 0 end)`,
          avgResponseTime: sql<number>`avg(response_time_ms)`
        })
        .from(kakaoApiUsage)
        .where(dateCondition)
        .groupBy(kakaoApiUsage.apiType);
        
      // API 타입별 성공률 계산
      const apiBreakdown: { [key: string]: { calls: number; successRate: number; avgResponseTime: number } } = {};
      
      apiBreakdownResult.forEach(stat => {
        apiBreakdown[stat.apiType] = {
          calls: stat.calls,
          successRate: stat.calls > 0 ? (stat.successfulCalls / stat.calls) * 100 : 0,
          avgResponseTime: Math.round(stat.avgResponseTime || 0)
        };
      });
      
      return {
        period,
        totalCalls: totalStats.totalCalls || 0,
        successfulCalls: totalStats.successfulCalls || 0,
        failedCalls: totalStats.failedCalls || 0,
        avgResponseTime: Math.round(totalStats.avgResponseTime || 0),
        totalCost: totalStats.totalCost || 0,
        apiBreakdown
      };
    } catch (error) {
      console.error('사용량 통계 조회 실패:', error);
      throw new Error(`사용량 통계 조회 실패: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * 일별 통계 조회
   */
  static async getDailyStats(days: number = 7): Promise<IDailyApiStats[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const result = await db
        .select({
          date: sql<string>`DATE(created_at)`,
          apiType: kakaoApiUsage.apiType,
          totalCalls: sql<number>`count(*)`,
          successfulCalls: sql<number>`sum(case when success = true then 1 else 0 end)`,
          failedCalls: sql<number>`sum(case when success = false then 1 else 0 end)`,
          avgResponseTime: sql<number>`avg(response_time_ms)`,
          totalCost: sql<number>`sum(estimated_cost)`
        })
        .from(kakaoApiUsage)
        .where(gte(kakaoApiUsage.createdAt, startDate))
        .groupBy(sql`DATE(created_at)`, kakaoApiUsage.apiType)
        .orderBy(sql`DATE(created_at) DESC`);
        
      return result.map(stat => ({
        date: stat.date,
        apiType: stat.apiType as ApiType,
        totalCalls: stat.totalCalls,
        successfulCalls: stat.successfulCalls,
        failedCalls: stat.failedCalls,
        avgResponseTime: Math.round(stat.avgResponseTime || 0),
        totalCost: stat.totalCost
      }));
    } catch (error) {
      console.error('일별 통계 조회 실패:', error);
      throw new Error(`일별 통계 조회 실패: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * 사용량 요약 조회 (오늘, 이번주, 이번달)
   */
  static async getUsageSummary(): Promise<IApiUsageSummary> {
    try {
      const [todayStats, weekStats, monthStats] = await Promise.all([
        this.getUsageStats('day'),
        this.getUsageStats('week'),
        this.getUsageStats('month')
      ]);
      
      return {
        today: {
          totalCalls: todayStats.totalCalls,
          successRate: todayStats.totalCalls > 0 
            ? (todayStats.successfulCalls / todayStats.totalCalls) * 100 
            : 0,
          avgResponseTime: todayStats.avgResponseTime,
          totalCost: todayStats.totalCost
        },
        thisWeek: {
          totalCalls: weekStats.totalCalls,
          successRate: weekStats.totalCalls > 0 
            ? (weekStats.successfulCalls / weekStats.totalCalls) * 100 
            : 0,
          avgResponseTime: weekStats.avgResponseTime,
          totalCost: weekStats.totalCost
        },
        thisMonth: {
          totalCalls: monthStats.totalCalls,
          successRate: monthStats.totalCalls > 0 
            ? (monthStats.successfulCalls / monthStats.totalCalls) * 100 
            : 0,
          avgResponseTime: monthStats.avgResponseTime,
          totalCost: monthStats.totalCost
        }
      };
    } catch (error) {
      console.error('사용량 요약 조회 실패:', error);
      throw new Error(`사용량 요약 조회 실패: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Rate Limiting 체크
   */
  static checkRateLimit(userId: string): IRateLimitInfo {
    const now = Date.now();
    const windowStart = now - this.RATE_LIMIT_WINDOW;
    
    // 기존 사용자 정보 가져오기
    let userInfo = this.rateLimitMap.get(userId);
    
    if (!userInfo) {
      // 새 사용자
      userInfo = {
        userId,
        callCount: 1,
        windowStart: new Date(now),
        isLimited: false
      };
    } else {
      // 기존 사용자 - 윈도우 시간 체크
      if (userInfo.windowStart.getTime() < windowStart) {
        // 새 윈도우 시작
        userInfo.callCount = 1;
        userInfo.windowStart = new Date(now);
        userInfo.isLimited = false;
      } else {
        // 기존 윈도우 내 호출
        userInfo.callCount++;
        userInfo.isLimited = userInfo.callCount > this.RATE_LIMIT_MAX_CALLS;
      }
    }
    
    this.rateLimitMap.set(userId, userInfo);
    
    // 메모리 정리 (10분마다)
    if (Math.random() < 0.01) {
      this.cleanupRateLimitMap();
    }
    
    return { ...userInfo };
  }
  
  /**
   * 특정 조건으로 사용량 기록 조회
   */
  static async getUsageRecords(filter: IApiUsageFilter): Promise<IApiUsageRecord[]> {
    try {
      const conditions = [];
      
      if (filter.apiType) {
        conditions.push(eq(kakaoApiUsage.apiType, filter.apiType));
      }
      
      if (filter.success !== undefined) {
        conditions.push(eq(kakaoApiUsage.success, filter.success));
      }
      
      if (filter.userId) {
        conditions.push(eq(kakaoApiUsage.userId, filter.userId));
      }
      
      if (filter.dateFrom) {
        conditions.push(gte(kakaoApiUsage.createdAt, filter.dateFrom));
      }
      
      if (filter.dateTo) {
        conditions.push(lt(kakaoApiUsage.createdAt, filter.dateTo));
      }
      
      // 조건부 쿼리 구성을 위한 새로운 접근
      const baseQuery = db.select().from(kakaoApiUsage);
      const whereQuery = conditions.length > 0 
        ? baseQuery.where(and(...conditions))
        : baseQuery;
      const orderedQuery = whereQuery.orderBy(desc(kakaoApiUsage.createdAt));
      const limitedQuery = filter.limit 
        ? orderedQuery.limit(filter.limit)
        : orderedQuery;
      const finalQuery = filter.offset 
        ? limitedQuery.offset(filter.offset)
        : limitedQuery;
      
      const results = await finalQuery;
      
      return results.map(record => ({
        id: record.id,
        apiType: record.apiType as ApiType,
        endpoint: record.endpoint || undefined,
        requestParams: record.requestParams,
        responseStatus: record.responseStatus,
        responseTimeMs: record.responseTimeMs,
        success: record.success,
        errorMessage: record.errorMessage || undefined,
        resultCount: record.resultCount || undefined,
        userId: record.userId || undefined,
        ipAddress: record.ipAddress,
        userAgent: record.userAgent || undefined,
        estimatedCost: record.estimatedCost || undefined,
        createdAt: record.createdAt
      }));
    } catch (error) {
      console.error('사용량 기록 조회 실패:', error);
      throw new Error(`사용량 기록 조회 실패: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * 에러 로그 조회
   */
  static async getErrorLogs(limit: number = 50): Promise<IApiUsageRecord[]> {
    return this.getUsageRecords({
      success: false,
      limit,
      offset: 0
    });
  }
  
  /**
   * 느린 API 호출 조회
   */
  static async getSlowCalls(thresholdMs: number = 5000, limit: number = 50): Promise<IApiUsageRecord[]> {
    try {
      const result = await db
        .select()
        .from(kakaoApiUsage)
        .where(gte(kakaoApiUsage.responseTimeMs, thresholdMs))
        .orderBy(desc(kakaoApiUsage.responseTimeMs))
        .limit(limit);
        
      return result.map(record => ({
        id: record.id,
        apiType: record.apiType as ApiType,
        endpoint: record.endpoint || undefined,
        requestParams: record.requestParams,
        responseStatus: record.responseStatus,
        responseTimeMs: record.responseTimeMs,
        success: record.success,
        errorMessage: record.errorMessage || undefined,
        resultCount: record.resultCount || undefined,
        userId: record.userId || undefined,
        ipAddress: record.ipAddress,
        userAgent: record.userAgent || undefined,
        estimatedCost: record.estimatedCost || undefined,
        createdAt: record.createdAt
      }));
    } catch (error) {
      console.error('느린 API 호출 조회 실패:', error);
      throw new Error(`느린 API 호출 조회 실패: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * 기간별 날짜 조건 생성
   */
  private static getDateCondition(period: 'day' | 'week' | 'month') {
    const now = new Date();
    
    switch (period) {
      case 'day':
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return gte(kakaoApiUsage.createdAt, today);
        
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return gte(kakaoApiUsage.createdAt, weekAgo);
        
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return gte(kakaoApiUsage.createdAt, monthAgo);
        
      default:
        return gte(kakaoApiUsage.createdAt, new Date(0));
    }
  }
  
  /**
   * Rate Limit 메모리 정리
   */
  private static cleanupRateLimitMap(): void {
    const now = Date.now();
    const expiredTime = now - (this.RATE_LIMIT_WINDOW * 2); // 윈도우의 2배 시간 지난 것들 삭제
    
    for (const [userId, userInfo] of this.rateLimitMap.entries()) {
      if (userInfo.windowStart.getTime() < expiredTime) {
        this.rateLimitMap.delete(userId);
      }
    }
    
    console.log(`🧹 Rate Limit 메모리 정리 완료. 현재 추적 중인 사용자: ${this.rateLimitMap.size}명`);
  }
  
  /**
   * 월별 비용 리포트 생성
   */
  static async getMonthlyReport(year: number, month: number): Promise<{
    totalCalls: number;
    totalCost: number;
    dailyBreakdown: { date: string; calls: number; cost: number }[];
  }> {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      
      const result = await db
        .select({
          date: sql<string>`DATE(created_at)`,
          calls: sql<number>`count(*)`,
          cost: sql<number>`sum(estimated_cost)`
        })
        .from(kakaoApiUsage)
        .where(
          and(
            gte(kakaoApiUsage.createdAt, startDate),
            lt(kakaoApiUsage.createdAt, endDate)
          )
        )
        .groupBy(sql`DATE(created_at)`)
        .orderBy(sql`DATE(created_at)`);
        
      const totalCalls = result.reduce((sum, day) => sum + day.calls, 0);
      const totalCost = result.reduce((sum, day) => sum + day.cost, 0);
      
      return {
        totalCalls,
        totalCost,
        dailyBreakdown: result.map(day => ({
          date: day.date,
          calls: day.calls,
          cost: day.cost
        }))
      };
    } catch (error) {
      console.error('월별 리포트 생성 실패:', error);
      throw new Error(`월별 리포트 생성 실패: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 