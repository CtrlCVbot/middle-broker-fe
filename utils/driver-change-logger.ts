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
    console.log('차주 변경 이력 기록 시작:', {
      driverId: params.driverId,
      changedBy: params.changedBy,
      changeType: params.changeType,
      reason: params.reason
    });

    // 변경 데이터 로깅
    if (params.oldData) {
      console.log('이전 데이터:', JSON.stringify(params.oldData, null, 2));
    }
    console.log('새 데이터:', JSON.stringify(params.newData, null, 2));

    // diff 객체 생성
    const diffObj = {
      old: params.oldData,
      new: params.newData
    };
    
    console.log('변경 이력 데이터 준비 완료:', {
      id: uuidv4(),
      driverId: params.driverId,
      changedBy: params.changedBy,
      changedByName: params.changedByName,
      changeType: params.changeType,
    });

    // DB 삽입 수행
    await db.insert(driverChangeLogs).values({
      id: uuidv4(),
      driverId: params.driverId,
      changedBy: params.changedBy,
      changedByName: params.changedByName,
      changedByEmail: params.changedByEmail,
      changedByAccessLevel: params.changedByAccessLevel || 'user',
      changeType: params.changeType,
      diff: JSON.stringify(diffObj),
      reason: params.reason || '차주 정보 변경',
      createdAt: new Date()
    });

    console.log('차주 변경 이력 기록 완료!');
  } catch (error) {
    console.error('차주 변경 이력 기록 중 오류 발생:', error);
    console.error('오류 세부 정보:', {
      name: error instanceof Error ? error.name : 'UnknownError',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw new Error('차주 변경 이력 저장에 실패했습니다.');
  }
} 