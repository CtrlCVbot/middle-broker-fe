import { db } from '@/db';
import { distanceCache, kakaoApiUsage } from '@/db/schema';
import { addressChangeLogs } from '@/db/schema/addressChangeLogs';
import { eq, and, desc, gt, sql } from 'drizzle-orm';
import { 
  IDistanceCalculationRequest, 
  IDistanceCalculationResult, 
  ICreateDistanceCacheRequest,
  ICoordinates,
  RoutePriority
} from '@/types/distance';
import { KakaoDirectionsService } from './kakao-directions-service';
import { IKakaoDirectionsParams } from '@/types/kakao-directions';
import { useAuthStore } from '@/store/auth-store';
import { headers } from 'next/headers';

/**
 * 거리 계산 서비스
 * 
 * 주요 기능:
 * 1. DB 캐시에서 기존 거리 데이터 검색
 * 2. 주소 변경 여부 확인
 * 3. 필요시 카카오 API 호출
 * 4. 계산 결과를 캐시에 저장
 */
export class DistanceCalculationService {
 
  
  /**
   * 메인 거리 계산 함수
   * 캐시 우선 조회 -> 주소 변경 확인 -> API 호출 순으로 처리
   */
  static async calculateDistance(request: IDistanceCalculationRequest, userId?: string): Promise<IDistanceCalculationResult> {
    try {
      
      console.log(`🔍 거리 계산 요청: ${request.pickupAddressId} -> ${request.deliveryAddressId}`);
      console.log('userId--->', userId);
      // 1. DB에서 기존 데이터 검색
      const cachedDistance = await this.findCachedDistance(request);
      
      if (cachedDistance && !request.forceRefresh) {
        console.log('💾 캐시에서 거리 데이터 발견');
        
        // 2. 주소 변경 여부 확인
        const isAddressModified = await this.checkAddressModification(
          request.pickupAddressId,
          request.deliveryAddressId,
          cachedDistance.createdAt
        );
        
        if (!isAddressModified) {
          console.log('✅ 주소 변경 없음 - 캐시 데이터 사용');
          return {
            distanceKm: parseFloat(cachedDistance.distanceKm),
            durationMinutes: cachedDistance.durationMinutes,
            method: 'cached',
            cacheHit: true,
            cacheId: cachedDistance.id,
            accuracy: 'high',
            metadata: {
              calculatedAt: cachedDistance.createdAt,
              alternativeRoutes: 0,
              trafficConsidered: true
            }
          };
        } else {
          console.log('⚠️ 주소 변경 감지 - API 재호출 필요');
        }
      }
      
      // 3. 카카오 API 호출
      console.log('🌐 카카오 API 호출 중...');
      return await this.calculateDistanceFromAPI(request, userId);
      
    } catch (error) {
      console.error('❌ 거리 계산 실패:에러 너무 길수있어 출력 안함');//, error);
      throw new Error(`거리 계산 실패: ${error instanceof Error ? 
        "에러 너무 길수있어 출력 안함"//error.message 
        : 'Unknown error'}`);
    }
  }
  
  /**
   * DB에서 기존 거리 데이터 검색
   */
  private static async findCachedDistance(request: IDistanceCalculationRequest) {
    try {
      const priority = request.priority || 'RECOMMEND';
      
      const result = await db
        .select()
        .from(distanceCache)
        .where(
          and(
            eq(distanceCache.pickupAddressId, request.pickupAddressId),
            eq(distanceCache.deliveryAddressId, request.deliveryAddressId),
            eq(distanceCache.routePriority, priority),
            eq(distanceCache.isValid, true)
          )
        )
        .orderBy(desc(distanceCache.createdAt))
        .limit(1);
        
      return result[0] || null;
    } catch (error) {
      console.error('DB 캐시 조회 실패:', error);
      return null;
    }
  }
  
  /**
   * 주소 변경 여부 확인
   * 캐시 생성 이후 주소가 변경되었는지 확인
   */
  private static async checkAddressModification(
    pickupAddressId: string,
    deliveryAddressId: string,
    cacheCreatedAt: Date
  ): Promise<boolean> {
    try {
      const changeCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(addressChangeLogs)
        .where(
          and(
            sql`${addressChangeLogs.addressId} IN (${pickupAddressId}, ${deliveryAddressId})`,
            gt(addressChangeLogs.createdAt, cacheCreatedAt)
          )
        );
        
      return (changeCount[0]?.count || 0) > 0;
    } catch (error) {
      console.error('주소 변경 확인 실패:', error);
      // 에러 시 안전하게 true 반환 (재계산 유도)
      return true;
    }
  }
  
  /**
   * 카카오 API로부터 거리 계산
   */
  private static async calculateDistanceFromAPI(request: IDistanceCalculationRequest, userId?: string): Promise<IDistanceCalculationResult> {
    const startTime = Date.now();
    let apiUsageId: string | undefined;
    
    try {
      // 카카오 API 호출 파라미터 구성
      const apiParams: IKakaoDirectionsParams = {
        origin: `${request.pickupCoordinates.lng},${request.pickupCoordinates.lat}`,
        destination: `${request.deliveryCoordinates.lng},${request.deliveryCoordinates.lat}`,
        priority: request.priority || 'RECOMMEND'
      };
      
      console.log('📞 카카오 API 호출:', apiParams);
      
      // API 호출
      const result = await KakaoDirectionsService.getDirections(apiParams);
      const responseTime = Date.now() - startTime;
      
      console.log(`✅ API 응답 시간: ${responseTime}ms`);
      console.log('userId--->', userId);
      
      // API 사용량 기록
      apiUsageId = await this.recordApiUsage({
        apiType: 'directions',
        requestParams: apiParams,
        responseStatus: 200,
        responseTimeMs: responseTime,
        success: true,
        userId: userId,
        resultCount: result.routes?.length || 0
      });
      
      // 첫 번째 경로에서 거리와 시간 추출
      const route = result.routes[0];
      if (!route) {
        throw new Error('경로를 찾을 수 없습니다');
      }
      //console.log('route--->', route);
      const distanceKm = Math.round(route.summary.distance / 1000 * 100) / 100; // 소수점 2자리
      const durationMinutes = Math.round(route.summary.duration / 60);
      
      console.log(`📏 계산된 거리: ${distanceKm}km, 소요시간: ${durationMinutes}분`);
      console.log('request.pickupAddressId--->', request.pickupAddressId);
      console.log('request.deliveryAddressId--->', request.deliveryAddressId);
      
      // 캐시에 저장
      const cacheId = await this.saveCachedDistance({
        pickupAddressId: request.pickupAddressId,
        deliveryAddressId: request.deliveryAddressId,
        pickupCoordinates: request.pickupCoordinates,
        deliveryCoordinates: request.deliveryCoordinates,
        distanceKm,
        durationMinutes,
        routePriority: request.priority || 'RECOMMEND',
        kakaoResponse: result
      });
      
      return {
        distanceKm,
        durationMinutes,
        method: 'api',
        cacheHit: false,
        cacheId: cacheId,
        apiCallId: apiUsageId,
        accuracy: 'high',
        metadata: {
          alternativeRoutes: result.routes.length - 1,
          trafficConsidered: true,
          calculatedAt: new Date()
        }
      };
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      console.error('거리 계산 API 호출 실패:');//, error);
      
      // 실패 기록
      await this.recordApiUsage({
        apiType: 'directions',
        requestParams: request,
        responseStatus: error instanceof Error && 'status' in error ? (error as any).status : 500,
        responseTimeMs: responseTime,
        success: false,
        userId: userId,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  }
  
  /**
   * 계산된 거리를 캐시에 저장
   */
  private static async saveCachedDistance(data: ICreateDistanceCacheRequest): Promise<string> {
    try {
      const result = await db
        .insert(distanceCache)
        .values({
          pickupAddressId: data.pickupAddressId,
          deliveryAddressId: data.deliveryAddressId,
          pickupCoordinates: data.pickupCoordinates,
          deliveryCoordinates: data.deliveryCoordinates,
          distanceKm: data.distanceKm.toString(),
          durationMinutes: data.durationMinutes,
          routePriority: data.routePriority,
          kakaoResponse: data.kakaoResponse,
        })
        .returning({ id: distanceCache.id });
        
      const cacheId = result[0].id;
      console.log(`💾 거리 캐시 저장 완료: ${cacheId}`);
      return cacheId;
    } catch (error) {
      console.error('캐시 저장 실패:', error);
      throw error;
    }
  }
  
  /**
   * API 사용량 기록
   */
  private static async recordApiUsage(data: {
    apiType: 'directions';
    requestParams: any;
    responseStatus: number;
    responseTimeMs: number;
    success: boolean;
    errorMessage?: string;
    resultCount?: number;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<string> {
    try {
      console.log('data.userId--->', data.userId);

      const headersList = await headers();
      const userAgent = headersList.get('user-agent') || '';
      const ipAddress = headersList.get('x-forwarded-for') || 
                        headersList.get('x-real-ip') || 
                        '127.0.0.1';
      console.log('ipAddress--->', ipAddress);
      console.log('userAgent--->', userAgent);
      const result = await db
        .insert(kakaoApiUsage)
        .values({
          apiType: data.apiType,
          endpoint: '/api/external/kakao/local/directions',
          requestParams: data.requestParams,
          responseStatus: data.responseStatus,
          responseTimeMs: data.responseTimeMs,
          success: data.success,
          errorMessage: data.errorMessage,
          resultCount: data.resultCount,
          userId: data.userId,
          ipAddress: ipAddress,
          userAgent: userAgent,
          estimatedCost: data.success ? 8 : 0, // 성공시 8원 비용
        })
        .returning({ id: kakaoApiUsage.id });
        
      const usageId = result[0].id;
      console.log(`📊 API 사용량 기록 완료: ${usageId}`);
      return usageId;
    } catch (error) {
      console.error('API 사용량 기록 실패:', error);
      // 사용량 기록 실패가 메인 로직을 방해하지 않도록 에러를 던지지 않음
      return '';
    }
  }
  
  /**
   * 특정 주소 쌍의 거리 캐시 무효화
   */
  static async invalidateCache(pickupAddressId: string, deliveryAddressId: string): Promise<void> {
    try {
      await db
        .update(distanceCache)
        .set({ isValid: false })
        .where(
          and(
            eq(distanceCache.pickupAddressId, pickupAddressId),
            eq(distanceCache.deliveryAddressId, deliveryAddressId)
          )
        );
        
      console.log(`🗑️ 거리 캐시 무효화 완료: ${pickupAddressId} -> ${deliveryAddressId}`);
    } catch (error) {
      console.error('캐시 무효화 실패:', error);
    }
  }
  
  /**
   * 좌표 기반 유사 경로 검색
   * 정확한 주소 매칭이 안 될 때 좌표 기반으로 유사한 경로 찾기
   */
  static async findSimilarRoute(
    pickupCoordinates: ICoordinates,
    deliveryCoordinates: ICoordinates,
    threshold: number = 0.01 // 약 1km 오차 허용
  ): Promise<IDistanceCalculationResult | null> {
    try {
      // PostgreSQL의 거리 계산 함수 사용 (간단한 유클리드 거리)
      const result = await db
        .select()
        .from(distanceCache)
        .where(
          and(
            eq(distanceCache.isValid, true),
            sql`
              ABS((${distanceCache.pickupCoordinates}->>'lat')::FLOAT - ${pickupCoordinates.lat}) < ${threshold}
              AND ABS((${distanceCache.pickupCoordinates}->>'lng')::FLOAT - ${pickupCoordinates.lng}) < ${threshold}
              AND ABS((${distanceCache.deliveryCoordinates}->>'lat')::FLOAT - ${deliveryCoordinates.lat}) < ${threshold}
              AND ABS((${distanceCache.deliveryCoordinates}->>'lng')::FLOAT - ${deliveryCoordinates.lng}) < ${threshold}
            `
          )
        )
        .orderBy(desc(distanceCache.createdAt))
        .limit(1);
        
      if (result[0]) {
        const cache = result[0];
        return {
          distanceKm: parseFloat(cache.distanceKm),
          durationMinutes: cache.durationMinutes,
          method: 'cached',
          cacheHit: true,
          accuracy: 'medium', // 유사 경로이므로 정확도 medium
          metadata: {
            calculatedAt: cache.createdAt,
            alternativeRoutes: 0,
            trafficConsidered: true
          }
        };
      }
      
      return null;
    } catch (error) {
      console.error('유사 경로 검색 실패:', error);
      return null;
    }
  }
} 