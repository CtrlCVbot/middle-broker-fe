import { db } from '@/db';
import { orderChangeLogs } from '@/db/schema/orderChangeLogs';

interface IOrderChangeLogParams {
  orderId: string;
  changedBy: string;
  changedByRole?: 'shipper' | 'broker' | 'admin';
  changedByName: string;
  changedByEmail: string;
  changedByAccessLevel: string;
  changeType: 'create' | 'update' | 'updateStatus' | 'updatePrice' | 'updatePriceSales' | 'updatePricePurchase' | 'updateDispatch' | 'cancelDispatch' | 'cancel' | 'delete';
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
  changedByRole = 'broker', // 기본값을 broker로 설정
  changedByName,
  changedByEmail,
  changedByAccessLevel,
  changeType,
  oldData,
  newData,
  reason
}: IOrderChangeLogParams) {
  try {
    console.log('logOrderChange!!!', orderId);
    await db
      .insert(orderChangeLogs)
      .values({
        orderId,
        changedBy,
        changedByRole,
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
    
    console.log(`화물 변경 이력 기록 성공: ${orderId}, 유형: ${changeType}, 역할: ${changedByRole}`);
  } catch (error) {
    console.error('화물 변경 이력 기록 중 오류 발생:', error);
    // 로깅 실패 시에도 비즈니스 로직은 계속 진행
  }
} 