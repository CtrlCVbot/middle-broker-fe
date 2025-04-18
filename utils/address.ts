import { db } from '@/db';
import { addresses } from '@/db/schema/addresses';
import { eq } from 'drizzle-orm';
import { IAddressSnapshot } from '@/types/order1';

// 메모이제이션을 위한 캐시 맵
const addressSnapshotCache = new Map<string, { data: IAddressSnapshot, timestamp: number }>();
const addressValidationCache = new Map<string, { isValid: boolean, timestamp: number }>();

// 캐시 수명 (5분)
const CACHE_LIFETIME = 5 * 60 * 1000;

/**
 * 주소 스냅샷 생성 함수 (메모이제이션 적용)
 * @param addressId 주소 ID
 * @returns 주소 스냅샷 객체
 */
export async function generateAddressSnapshot(addressId: string): Promise<IAddressSnapshot> {
  try {
    // 캐시 확인
    const cached = addressSnapshotCache.get(addressId);
    if (cached && (Date.now() - cached.timestamp) < CACHE_LIFETIME) {
      return cached.data;
    }

    // DB에서 주소 조회
    const address = await db.query.addresses.findFirst({
      where: eq(addresses.id, addressId),
    });

    if (!address) {
      const error = new Error(`주소가 존재하지 않습니다 (ID: ${addressId})`);
      console.error('[AddressUtils] 주소 스냅샷 생성 실패:', error);
      throw error;
    }

    // 스냅샷 생성
    const snapshot: IAddressSnapshot = {
      name: address.name,
      roadAddress: address.roadAddress,
      jibunAddress: address.jibunAddress,
      detailAddress: address.detailAddress,
      postalCode: address.postalCode,
      contactName: address.contactName,
      contactPhone: address.contactPhone,
      metadata: {
        originalInput: address.metadata?.originalInput,
        source: address.metadata?.source,
        lat: address.metadata?.lat,
        lng: address.metadata?.lng,
        buildingName: address.metadata?.buildingName,
        floor: address.metadata?.floor,
        tags: address.metadata?.tags ?? [],
      },
      memo: address.memo,
    };

    // 캐시에 저장
    addressSnapshotCache.set(addressId, { 
      data: snapshot, 
      timestamp: Date.now() 
    });

    return snapshot;
  } catch (error) {
    console.error('[AddressUtils] 주소 스냅샷 생성 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 주소 유효성 검사 (메모이제이션 적용)
 * @param addressId 주소 ID
 * @returns 유효성 검사 결과 (boolean)
 */
export async function validateAddress(addressId: string): Promise<boolean> {
  try {
    // 캐시 확인
    const cached = addressValidationCache.get(addressId);
    if (cached && (Date.now() - cached.timestamp) < CACHE_LIFETIME) {
      return cached.isValid;
    }

    // DB에서 주소 조회
    const address = await db.query.addresses.findFirst({
      where: eq(addresses.id, addressId),
    });

    const isValid = !!address;
    
    // 캐시에 저장
    addressValidationCache.set(addressId, { 
      isValid, 
      timestamp: Date.now() 
    });

    return isValid;
  } catch (error) {
    console.error('[AddressUtils] 주소 유효성 검사 중 오류 발생:', error);
    // 오류 발생 시 false 반환 (안전한 처리)
    return false;
  }
}

/**
 * 주소 관련 캐시 초기화
 * @param addressId 특정 주소 ID (선택적)
 */
export function clearAddressCache(addressId?: string): void {
  if (addressId) {
    addressSnapshotCache.delete(addressId);
    addressValidationCache.delete(addressId);
  } else {
    addressSnapshotCache.clear();
    addressValidationCache.clear();
  }
} 