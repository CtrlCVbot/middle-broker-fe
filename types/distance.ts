import { IKakaoDirectionsResponse } from './kakao-directions';

/**
 * 좌표 정보 인터페이스
 */
export interface ICoordinates {
  lat: number;  // 위도
  lng: number;  // 경도
}

/**
 * 거리 계산 방법 타입
 */
export type CalculationMethod = 'cached' | 'api' | 'manual';

/**
 * 경로 우선순위 타입
 */
export type RoutePriority = 'RECOMMEND' | 'TIME' | 'DISTANCE';

/**
 * 데이터 정확도 타입
 */
export type DataAccuracy = 'high' | 'medium' | 'low';

/**
 * 거리 캐시 데이터 인터페이스
 */
export interface IDistanceCache {
  id: string;
  pickupAddressId: string;
  deliveryAddressId: string;
  pickupCoordinates: ICoordinates;
  deliveryCoordinates: ICoordinates;
  distanceKm: number;
  durationMinutes: number;
  routePriority: RoutePriority;
  kakaoResponse?: IKakaoDirectionsResponse;
  isValid: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 거리 계산 요청 인터페이스
 */
export interface IDistanceCalculationRequest {
  pickupAddressId: string;
  deliveryAddressId: string;
  pickupCoordinates: ICoordinates;
  deliveryCoordinates: ICoordinates;
  priority?: RoutePriority;
  forceRefresh?: boolean; // 캐시 무시하고 새로 계산
}

/**
 * 거리 계산 결과 인터페이스
 */
export interface IDistanceCalculationResult {
  distanceKm: number;
  durationMinutes: number;
  method: CalculationMethod;
  cacheHit: boolean;
  apiCallId?: string;
  accuracy: DataAccuracy;
  metadata?: {
    alternativeRoutes?: number;
    trafficConsidered?: boolean;
    calculatedAt: Date;
  };
}

/**
 * 거리 메타데이터 인터페이스 (orders 테이블용)
 */
export interface IDistanceMetadata {
  cacheHit: boolean;           // 캐시에서 가져온 데이터인지
  apiCallCount: number;        // API 호출 횟수
  alternativeRoutes?: number;  // 대안 경로 개수
  trafficConsidered?: boolean; // 교통정보 반영 여부
}

/**
 * 거리 캐시 조회 필터 인터페이스
 */
export interface IDistanceCacheFilter {
  pickupAddressId?: string;
  deliveryAddressId?: string;
  routePriority?: RoutePriority;
  isValid?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}

/**
 * 거리 캐시 생성 요청 인터페이스
 */
export interface ICreateDistanceCacheRequest {
  pickupAddressId: string;
  deliveryAddressId: string;
  pickupCoordinates: ICoordinates;
  deliveryCoordinates: ICoordinates;
  distanceKm: number;
  durationMinutes: number;
  routePriority: RoutePriority;
  kakaoResponse?: IKakaoDirectionsResponse;
} 