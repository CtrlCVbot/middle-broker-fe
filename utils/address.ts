import { db } from '@/db';
import { addresses } from '@/db/schema/addresses';
import { eq } from 'drizzle-orm';
import { IAddressSnapshot } from '@/types/order1';

/**
 * 주소 스냅샷 생성 함수
 */
export async function generateAddressSnapshot(addressId: string): Promise<IAddressSnapshot> {
  const address = await db.query.addresses.findFirst({
    where: eq(addresses.id, addressId),
  });

  if (!address) {
    throw new Error('주소가 존재하지 않습니다');
  }

  return {
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
}

/**
 * 주소 유효성 검사
 */
export async function validateAddress(addressId: string): Promise<boolean> {
  const address = await db.query.addresses.findFirst({
    where: eq(addresses.id, addressId),
  });

  return !!address;
} 