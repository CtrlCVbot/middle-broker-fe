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