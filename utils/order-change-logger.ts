import { db } from '@/db';
import { orderChangeLogs } from '@/db/schema/orderChangeLogs';

interface IOrderChangeLogParams {
  orderId: string;
  changedBy: string;
  changedByName: string;
  changedByEmail: string;
  changedByAccessLevel: string;
  changeType: 'create' | 'update' | 'updateStatus' | 'cancel' | 'delete';
  oldData?: any;
  newData?: any;
  reason?: string;
}

/**
 * 화물 변경 이력을 데이터베이스에 기록하는 함수
 */
export async function logOrderChange({
  orderId,
  changedBy,
  changedByName,
  changedByEmail,
  changedByAccessLevel,
  changeType,
  oldData,
  newData,
  reason
}: IOrderChangeLogParams) {
  try {
    await db
      .insert(orderChangeLogs)
      .values({
        orderId,
        changedBy,
        changedByName,
        changedByEmail,
        changedByAccessLevel,
        changeType,
        oldData,
        newData,
        reason,
        changedAt: new Date()
      })
      .execute();
    
    console.log(`화물 변경 이력 기록 성공: ${orderId}, 유형: ${changeType}`);
  } catch (error) {
    console.error('화물 변경 이력 기록 중 오류 발생:', error);
    // 로깅 실패 시에도 비즈니스 로직은 계속 진행
  }
} 