/**
 * 카카오모빌리티 길찾기 API 관련 타입 정의
 */

// 요청 파라미터 타입
export interface IKakaoDirectionsParams {
  /** 출발지 좌표 (필수) */
  origin: string;
  /** 목적지 좌표 (필수) */
  destination: string;
  /** 경유지 좌표 (선택) */
  waypoints?: string;
  /** 경로 탐색 우선순위 */
  priority?: 'RECOMMEND' | 'TIME' | 'DISTANCE';
  /** 경로 탐색 제한 옵션 */
  avoid?: string;
  /** 유고 정보 반영 옵션 */
  roadevent?: '0' | '1' | '2';
  /** 대안 경로 제공 여부 */
  alternatives?: boolean;
  /** 상세 도로 정보 제공 여부 */
  road_details?: boolean;
  /** 차종 */
  car_type?: number;
  /** 차량 유종 */
  car_fuel?: 'GASOLINE' | 'DIESEL' | 'LPG';
  /** 하이패스 장착 여부 */
  car_hipass?: boolean;
  /** 요약 정보만 제공 여부 */
  summary?: boolean;
}

// 좌표 타입
export interface ICoordinate {
  /** X 좌표 (경도) */
  x: number;
  /** Y 좌표 (위도) */
  y: number;
  /** 장소명 */
  name?: string;
}

// 바운딩 박스 타입
export interface IBoundingBox {
  /** 바운딩 박스 왼쪽 하단 X 좌표 */
  min_x: number;
  /** 바운딩 박스 왼쪽 하단 Y 좌표 */
  min_y: number;
  /** 바운딩 박스 오른쪽 상단 X 좌표 */
  max_x: number;
  /** 바운딩 박스 오른쪽 상단 Y 좌표 */
  max_y: number;
}

// 요금 정보 타입
export interface IFareInfo {
  /** 택시 요금 (원) */
  taxi: number;
  /** 통행 요금 (원) */
  toll: number;
}

// 도로 정보 타입
export interface IRoadInfo {
  /** 도로명 */
  name: string;
  /** 도로 길이 (미터) */
  distance: number;
  /** 예상 이동 시간 (초) */
  duration: number;
  /** 현재 교통 정보 속도 (km/h) */
  traffic_speed: number;
  /** 현재 교통 정보 상태 */
  traffic_state: number;
  /** X, Y 좌표 배열 */
  vertexes: number[];
}

// 안내 정보 타입
export interface IGuideInfo {
  /** 명칭 */
  name: string;
  /** X 좌표 (경도) */
  x: number;
  /** Y 좌표 (위도) */
  y: number;
  /** 이전 가이드 지점부터 현재 가이드 지점까지 거리 (미터) */
  distance: number;
  /** 이전 가이드 지점부터 현재 가이드 지점까지 시간 (초) */
  duration: number;
  /** 안내 타입 */
  type: number;
  /** 안내 문구 */
  guidance: string;
  /** 현재 가이드에 대한 링크 인덱스 */
  road_index: number;
}

// 구간별 경로 정보 타입
export interface ISectionInfo {
  /** 섹션 거리 (미터) */
  distance: number;
  /** 전체 검색 결과 이동 시간 (초) */
  duration: number;
  /** 바운딩 박스 */
  bound?: IBoundingBox;
  /** 도로 정보 */
  roads?: IRoadInfo[];
  /** 안내 정보 */
  guides?: IGuideInfo[];
}

// 경로 요약 정보 타입
export interface IRouteSummary {
  /** 출발지 정보 */
  origin: ICoordinate;
  /** 목적지 정보 */
  destination: ICoordinate;
  /** 경유지 정보 */
  waypoints: ICoordinate[];
  /** 경로 탐색 우선순위 옵션 */
  priority: string;
  /** 바운딩 박스 */
  bound?: IBoundingBox;
  /** 요금 정보 */
  fare: IFareInfo;
  /** 전체 검색 결과 거리 (미터) */
  distance: number;
  /** 목적지까지 소요 시간 (초) */
  duration: number;
}

// 경로 정보 타입
export interface IRouteInfo {
  /** 결과 코드 */
  result_code: number;
  /** 결과 메시지 */
  result_msg: string;
  /** 경로 요약 정보 */
  summary: IRouteSummary;
  /** 구간별 경로 정보 */
 // sections: ISectionInfo[]; --> 너무 긴 텍스트 때문에 제외
}

// API 응답 타입
export interface IKakaoDirectionsResponse {
  /** 거래 ID */
  trans_id: string;
  /** 경로 정보 배열 */
  routes: IRouteInfo[];
}

// 에러 응답 타입
export interface IKakaoDirectionsError {
  /** 에러 메시지 */
  error: string;
  /** 상세 에러 정보 */
  details?: string;
} 