import { ICargo } from '@/types/order';

/**
 * 화물 정보 중복 제거 함수
 * 
 * @description
 * - cargoName + requestedVehicleWeight + requestedVehicleType 기준으로 중복 제거
 * - 더 최신의 updatedAt 데이터를 우선시하여 중복 제거
 * 
 * @param cargos 중복 제거할 화물 배열
 * @returns 중복이 제거된 화물 배열
 * 
 * @example
 * ```typescript
 * const uniqueCargos = deduplicateCargos(cargoList);
 * ```
 */
export function deduplicateCargos(cargos: ICargo[]): ICargo[] {
  const seen = new Map<string, ICargo>();
  
  for (const cargo of cargos) {
    // 중복 판단 기준: 화물명 + 중량 + 차량종류
    const key = `${cargo.cargoName}_${cargo.requestedVehicleWeight}_${cargo.requestedVehicleType}`;
    
    // 동일 키가 없거나, 더 최신 데이터인 경우에만 저장
    if (!seen.has(key) || new Date(cargo.updatedAt) > new Date(seen.get(key)!.updatedAt)) {
      seen.set(key, cargo);
    }
  }
  
  return Array.from(seen.values());
}

/**
 * 화물 정보 정렬 함수
 * 
 * @description
 * - updatedAt 기준으로 최신순 정렬
 * 
 * @param cargos 정렬할 화물 배열
 * @returns 최신순으로 정렬된 화물 배열
 */
export function sortCargosByDate(cargos: ICargo[]): ICargo[] {
  return cargos.sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

/**
 * 화물 정보 필터링 함수
 * 
 * @description
 * - 필수 필드가 있는 화물만 필터링
 * 
 * @param cargos 필터링할 화물 배열
 * @returns 필수 필드가 있는 화물 배열
 */
export function filterValidCargos(cargos: ICargo[]): ICargo[] {
  return cargos.filter(cargo => 
    cargo.cargoName && 
    cargo.requestedVehicleWeight && 
    cargo.requestedVehicleType
  );
} 