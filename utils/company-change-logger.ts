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
 * Base64로 인코딩된 문자열을 디코딩
 * @param encodedStr Base64로 인코딩된 문자열
 * @returns 디코딩된 문자열
 */
function decodeBase64IfNeeded(encodedStr: string | null): string {
  if (!encodedStr) return 'System';
  
  // base64: 접두사가 있는 경우 디코딩
  if (encodedStr.startsWith('base64:')) {
    try {
      const base64Value = encodedStr.substring(7); // 'base64:' 제거
      return decodeURIComponent(escape(atob(base64Value)));
    } catch (error) {
      console.error('Base64 디코딩 오류:', error);
      return 'System';
    }
  }
  
  return encodedStr;
}

/**
 * 업체 정보 변경 로그를 기록하는 함수
 * @param params 변경 로그 데이터
 */
export async function logCompanyChange(params: ILogCompanyChangeParams) {
  try {
    // changedBy가 유효하지 않은 경우 UUIDv4로 변환
    const changedBy = 
      !params.changedBy || 
      params.changedBy === 'system' || 
      params.changedBy === 'system-user-id' || 
      (params.changedBy && params.changedBy.trim() === '') ? 
      uuidv4() : params.changedBy;
    
    // Base64로 인코딩된 사용자 이름 디코딩
    const changedByName = decodeBase64IfNeeded(params.changedByName || null);

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
      changedBy: changedBy,
      changedByName: changedByName || 'System',
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