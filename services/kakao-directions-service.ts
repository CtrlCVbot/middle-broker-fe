import { 
  IKakaoDirectionsParams, 
  IKakaoDirectionsResponse, 
  IKakaoDirectionsError 
} from '@/types/kakao-directions';

/**
 * 카카오모빌리티 길찾기 API 서비스
 */
export class KakaoDirectionsService {
  private static readonly BASE_URL = 'https://apis-navi.kakaomobility.com/v1/directions';

  /**
   * 자동차 길찾기 API 호출
   * @param params - 길찾기 요청 파라미터
   * @returns Promise<IKakaoDirectionsResponse>
   */
  static async getDirections(
    params: IKakaoDirectionsParams
  ): Promise<IKakaoDirectionsResponse> {
    const { origin, destination, ...optionalParams } = params;

    // URL 파라미터 구성
    const urlParams = new URLSearchParams();
    urlParams.append('origin', origin);
    urlParams.append('destination', destination);

    // 선택적 파라미터 추가
    Object.entries(optionalParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        urlParams.append(key, value.toString());
      }
    });

    const apiUrl = `${this.BASE_URL}?${urlParams.toString()}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `KakaoAK ${process.env.KAKAO_REST_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: IKakaoDirectionsResponse = await response.json();
      return data;

    } catch (error) {
      console.error('Error calling Kakao Directions API:', error);
      throw error;
    }
  }

  /**
   * 경로 탐색 우선순위 검증
   * @param priority - 우선순위 값
   * @returns boolean
   */
  static isValidPriority(priority: string): boolean {
    const validPriorities = ['RECOMMEND', 'TIME', 'DISTANCE'];
    return validPriorities.includes(priority);
  }

  /**
   * 차량 유종 검증
   * @param carFuel - 차량 유종
   * @returns boolean
   */
  static isValidCarFuel(carFuel: string): boolean {
    const validFuels = ['GASOLINE', 'DIESEL', 'LPG'];
    return validFuels.includes(carFuel);
  }

  /**
   * 좌표 형식 검증 (간단한 검증)
   * @param coordinate - 좌표 문자열
   * @returns boolean
   */
  static isValidCoordinate(coordinate: string): boolean {
    // 기본적인 좌표 형식 검증 (경도,위도)
    const coordPattern = /^[\d.-]+,[\d.-]+/;
    return coordPattern.test(coordinate);
  }

  /**
   * 경유지 형식 검증
   * @param waypoints - 경유지 문자열
   * @returns boolean
   */
  static isValidWaypoints(waypoints: string): boolean {
    // 경유지는 | 또는 %7C로 구분된 좌표들
    const waypointList = waypoints.split(/[|%7C]/);
    return waypointList.every(waypoint => this.isValidCoordinate(waypoint.trim()));
  }

  /**
   * 거리 포맷팅 (미터 -> km 변환)
   * @param meters - 미터 단위 거리
   * @returns string
   */
  static formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${meters}m`;
    } else {
      return `${(meters / 1000).toFixed(1)}km`;
    }
  }

  /**
   * 시간 포맷팅 (초 -> 분/시간 변환)
   * @param seconds - 초 단위 시간
   * @returns string
   */
  static formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}시간 ${minutes}분`;
    } else {
      return `${minutes}분`;
    }
  }

  /**
   * 요금 포맷팅
   * @param amount - 요금 (원)
   * @returns string
   */
  static formatFare(amount: number): string {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  }
} 