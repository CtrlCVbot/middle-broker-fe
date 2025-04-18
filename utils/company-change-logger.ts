import { db } from '@/db';
import { companyChangeLogs } from '@/db/schema/companies';
import { v4 as uuidv4 } from 'uuid';

interface ILogCompanyChangeParams {
  companyId: string;
  changedBy: string;
  changedByName?: string;
  changedByEmail?: string;
  changedByAccessLevel?: string;
  changeType: 'create' | 'update' | 'status_change' | 'delete';
  oldData?: Record<string, any>;
  newData?: Record<string, any>;
  reason?: string;
}

/**
 * 업체 정보 변경 로그를 기록하는 함수
 * @param params 변경 로그 데이터
 */
export async function logCompanyChange(params: ILogCompanyChangeParams) {
  try {
    // changedBy가 'system' 또는 'system-user-id'와 같은 값이면 UUIDv4로 변환
    const changedBy = 
      params.changedBy === 'system' || 
      params.changedBy === 'system-user-id' || 
      !params.changedBy ? 
      uuidv4() : params.changedBy;

    // 변경된 데이터 생성
    const diff: Record<string, [any, any]> = {};
    
    // oldData와 newData가 둘 다 있는 경우에만 diff 계산
    if (params.oldData && params.newData) {
      // 모든 키를 병합
      const allKeys = new Set([
        ...Object.keys(params.oldData || {}),
        ...Object.keys(params.newData || {})
      ]);
      
      // 각 키에 대해 변경 사항 확인
      for (const key of allKeys) {
        const oldValue = params.oldData[key];
        const newValue = params.newData[key];
        
        // 값이 다른 경우에만 diff에 추가
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          diff[key] = [oldValue, newValue];
        }
      }
    }
    
    await db.insert(companyChangeLogs).values({
      id: uuidv4(),
      companyId: params.companyId,
      changedById: changedBy,
      changedByName: params.changedByName || 'System',
      changedByEmail: params.changedByEmail || 'system@example.com',
      changedByAccessLevel: params.changedByAccessLevel || 'system',
      changeType: params.changeType,
      diff: diff as any,
      reason: params.reason || '',
      createdAt: new Date()
    });
    
    console.log(`[SUCCESS] 업체 ${params.companyId} 변경 로그 기록 성공`);
  } catch (error) {
    console.error('[ERROR] 업체 변경 로그 기록 실패:', error);
  }
} 