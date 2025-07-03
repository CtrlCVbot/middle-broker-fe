import { IDistanceCalculationRequest, IDistanceCalculationResult } from '@/types/distance';

/**
 * 거리 계산 클라이언트 서비스
 * 프론트엔드에서 거리 계산 API를 호출하는 서비스
 */
export class DistanceClientService {
  
  /**
   * API 기본 URL
   */
  private static readonly API_BASE_URL = '/api/distance/calculate';
  
  /**
   * 거리 계산 API 호출
   */
  static async calculateDistance(request: IDistanceCalculationRequest): Promise<IDistanceCalculationResult> {
    try {
      console.log('🔍 거리 계산 API 호출 시작:', request);
      
      const response = await fetch(this.API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || `API 호출 실패: ${response.status}`);
      }
      
      if (!responseData.success) {
        throw new Error(responseData.error || 'API 응답 실패');
      }
      
      console.log('✅ 거리 계산 완료:', responseData.data);
      return responseData.data;
      
    } catch (error) {
      console.error('❌ 거리 계산 API 호출 실패:', error);
      throw error;
    }
  }
  
  /**
   * 주소 ID와 좌표를 이용한 거리 계산 (컨비니언스 메서드)
   */
  static async calculateDistanceByAddresses(params: {
    pickupAddressId: string;
    deliveryAddressId: string;
    pickupCoordinates: { lat: number; lng: number };
    deliveryCoordinates: { lat: number; lng: number };
    priority?: 'RECOMMEND' | 'TIME' | 'DISTANCE';
    forceRefresh?: boolean;
  }): Promise<{
    success: boolean;
    distanceKm?: number;
    durationMinutes?: number;
    error?: string;
  }> {
    try {
      const result = await this.calculateDistance({
        pickupAddressId: params.pickupAddressId,
        deliveryAddressId: params.deliveryAddressId,
        pickupCoordinates: params.pickupCoordinates,
        deliveryCoordinates: params.deliveryCoordinates,
        priority: params.priority || 'RECOMMEND',
        forceRefresh: params.forceRefresh || false
      });
      
      return {
        success: true,
        distanceKm: result.distanceKm,
        durationMinutes: result.durationMinutes
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Mock 거리 계산 (기존 코드와의 호환성을 위한 임시 메서드)
   * 실제 API 호출 후 제거될 예정
   */
  static async calculateMockDistance(
    pickupLat: number,
    pickupLng: number,
    deliveryLat: number,
    deliveryLng: number
  ): Promise<number> {
    try {
      // 임시 주소 ID 생성 (실제로는 주소 데이터에서 가져와야 함)
      const tempPickupId = `temp_pickup_${Math.random().toString(36).substr(2, 9)}`;
      const tempDeliveryId = `temp_delivery_${Math.random().toString(36).substr(2, 9)}`;
      
      const result = await this.calculateDistance({
        pickupAddressId: tempPickupId,
        deliveryAddressId: tempDeliveryId,
        pickupCoordinates: { lat: pickupLat, lng: pickupLng },
        deliveryCoordinates: { lat: deliveryLat, lng: deliveryLng },
        priority: 'RECOMMEND',  
        forceRefresh: false
      });
      
      return result.distanceKm;
      
    } catch (error) {
      console.warn('거리 계산 실패, Mock 값 반환:', error);
      // API 실패 시 임시로 직선 거리 계산
      return this.calculateStraightLineDistance(pickupLat, pickupLng, deliveryLat, deliveryLng);
    }
  }
  
  /**
   * 직선 거리 계산 (Fallback용)
   */
  private static calculateStraightLineDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // 지구 반지름 (km)
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return Math.round(distance * 100) / 100; // 소수점 2자리
  }
  
  /**
   * 도를 라디안으로 변환
   */
  private static deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
  
  /**
   * API 상태 확인
   */
  static async checkApiStatus(): Promise<{
    isHealthy: boolean;
    message: string;
    stats?: any;
  }> {
    try {
      const response = await fetch(this.API_BASE_URL, {
        method: 'GET',
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        return {
          isHealthy: true,
          message: data.message,
          stats: data.status
        };
      } else {
        return {
          isHealthy: false,
          message: data.error || 'API 상태 확인 실패'
        };
      }
      
    } catch (error) {
      return {
        isHealthy: false,
        message: error instanceof Error ? error.message : 'API 연결 실패'
      };
    }
  }
  
  /**
   * Rate Limit 정보 확인
   */
  static async getRateLimitInfo(): Promise<{
    windowMs: number;
    maxCalls: number;
    remainingCalls?: number;
  }> {
    try {
      const status = await this.checkApiStatus();
      
      if (status.isHealthy && status.stats?.rateLimit) {
        return {
          windowMs: status.stats.rateLimit.windowMs,
          maxCalls: status.stats.rateLimit.maxCalls
        };
      }
      
      // 기본값 반환
      return {
        windowMs: 60000, // 1분
        maxCalls: 10
      };
      
    } catch (error) {
      console.error('Rate Limit 정보 조회 실패:', error);
      return {
        windowMs: 60000,
        maxCalls: 10
      };
    }
  }
} 