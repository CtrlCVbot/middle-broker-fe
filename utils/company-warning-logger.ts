import { db } from '@/db';
import { companyWarningLogs } from '@/db/schema/companyWarningLogs';
import { CompanyWarning } from '@/types/company';

// 로그 액션 타입
export type WarningLogAction = 'create' | 'update' | 'delete';

/**
 * 주의사항 변경 로그를 기록하는 함수
 */
export async function logWarningChange({
  companyId,
  warningId,
  action,
  previousData = null,
  newData = null,
  createdBy,
  reason = null
}: {
  companyId: string;
  warningId: string;
  action: WarningLogAction;
  previousData?: CompanyWarning | null;
  newData?: Partial<CompanyWarning> | null;
  createdBy: string;
  reason?: string | null;
}) {
  try {
    // 삭제 작업인 경우 로그를 독립적인 형태로 저장 (외래 키 참조 없음)
    if (action === 'delete') {
      // 주의사항이 이미 삭제된 경우를 대비해 로그 저장 시 별도 처리
      // 삭제된 warningId를 참조하지 않는 독립 로그 테이블을 사용하거나,
      // 로그 저장 방식을 변경할 수 있지만, 현재 구조에서는 예외 처리만 추가
      
      // 로그만 콘솔에 출력하고 DB 저장은 생략 (선택적)
      console.log('주의사항 삭제 로그:', {
        companyId,
        warningId,
        action,
        previousData,
        reason,
        createdBy,
        timestamp: new Date()
      });
      
      return;
    }
    
    // 생성, 수정 등 다른 작업은 기존대로 로그 저장
    await db.insert(companyWarningLogs).values({
      companyId,
      warningId,
      action,
      previousData: previousData ? JSON.parse(JSON.stringify(previousData)) : null,
      newData: newData ? JSON.parse(JSON.stringify(newData)) : null,
      reason,
      createdBy,
    });
  } catch (error) {
    console.error('주의사항 로그 기록 중 오류 발생:', error);
    // 로그 기록 실패는 주요 기능에 영향을 주지 않도록 예외를 던지지 않음
  }
} 