import { db } from '@/db';
import { addressChangeLogs } from '@/db/schema/addressChangeLogs';
import { IAddress } from '@/types/address';

interface ILogAddressChangeParams {
  addressId: string;
  changedBy: string;
  changedByName: string;
  changedByEmail: string;
  changedByAccessLevel?: string;
  changeType: 'create' | 'update' | 'delete';
  oldData?: Partial<IAddress>;
  newData?: Partial<IAddress>;
  reason?: string;
}

export async function logAddressChange({
  addressId,
  changedBy,
  changedByName,
  changedByEmail,
  changedByAccessLevel,
  changeType,
  oldData,
  newData,
  reason,
}: ILogAddressChangeParams) {
  try {
    // 변경된 필드 계산
    const changes: Record<string, any> = {};
    
    if (oldData && newData) {
      // 기본 필드 비교
      const fields = [
        'name',
        'type',
        'roadAddress',
        'jibunAddress',
        'detailAddress',
        'postalCode',
        'contactName',
        'contactPhone',
        'memo',
        'isFrequent'
      ];

      fields.forEach(field => {
        const oldValue = oldData[field as keyof typeof oldData];
        const newValue = newData[field as keyof typeof newData];
        
        if (oldValue !== newValue) {
          changes[field] = {
            old: oldValue,
            new: newValue
          };
        }
      });

      // metadata 필드 비교
      if (oldData.metadata || newData.metadata) {
        const metadataFields = [
          'originalInput',
          'source',
          'lat',
          'lng',
          'buildingName',
          'floor',
          'tags'
        ];

        metadataFields.forEach(field => {
          const oldValue = oldData.metadata?.[field as keyof typeof oldData.metadata];
          const newValue = newData.metadata?.[field as keyof typeof newData.metadata];
          
          if (oldValue !== newValue) {
            changes[`metadata.${field}`] = {
              old: oldValue,
              new: newValue
            };
          }
        });
      }
    } else if (newData) {
      // 신규 생성인 경우
      changes.all = newData;
    } else if (oldData) {
      // 삭제인 경우
      changes.all = oldData;
    }

    // 변경 이력 저장
    await db.insert(addressChangeLogs).values({
      addressId,
      changedBy,
      changedByName,
      changedByEmail,
      changedByAccessLevel,
      changeType,
      changes: JSON.stringify(changes),
      reason,
    });
  } catch (error) {
    console.error('주소 변경 이력 기록 중 오류 발생:', error);
    throw error;
  }
} 