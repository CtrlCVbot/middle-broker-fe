import { db } from '@/db';
import { driverChangeLogs } from '@/db/schema/drivers';
import { v4 as uuidv4 } from 'uuid';

/**
 * 차주 정보 변경 이력을 기록하는 함수
 * 
 * @param params 변경 이력 데이터
 */
export async function logDriverChange(params: {
  driverId: string;
  changedBy: string;
  changedByName: string;
  changedByEmail: string;
  changedByAccessLevel?: string;
  changeType: string;
  oldData: any;
  newData: any;
  reason?: string;
}) {
  try {
    await db.insert(driverChangeLogs).values({
      id: uuidv4(),
      driverId: params.driverId,
      changedBy: params.changedBy,
      changedByName: params.changedByName,
      changedByEmail: params.changedByEmail,
      changedByAccessLevel: params.changedByAccessLevel || 'user',
      changeType: params.changeType,
      diff: JSON.stringify({
        old: params.oldData,
        new: params.newData
      }),
      reason: params.reason || '차주 정보 변경',
      createdAt: new Date()
    });
  } catch (error) {
    console.error('차주 변경 이력 기록 중 오류 발생:', error);
    throw new Error('차주 변경 이력 저장에 실패했습니다.');
  }
} 