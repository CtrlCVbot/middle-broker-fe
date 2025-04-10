import { db } from '@/db';
import { companyChangeLogs } from '@/db/schema/companies';
import { ICompany } from '@/types/company';

export interface LogCompanyChangeParams {
  companyId: string;
  changedBy: string;
  changedByName: string;
  changedByEmail: string;
  changedByAccessLevel: string;
  changeType: 'create' | 'update' | 'delete' | 'status' | 'fields';
  oldData?: Partial<ICompany>;
  newData?: Partial<ICompany>;
  reason?: string;
}

export async function logCompanyChange({
  companyId,
  changedBy,
  changedByName,
  changedByEmail,
  changedByAccessLevel,
  changeType,
  oldData,
  newData,
  reason
}: LogCompanyChangeParams) {
  // 변경 사항 diff 생성
  const diff = {
    ...(oldData && { old: oldData }),
    ...(newData && { new: newData })
  };

  // 변경 이력 저장
  await db.insert(companyChangeLogs).values({
    companyId,
    changedBy,
    changedByName,
    changedByEmail,
    changedByAccessLevel,
    changeType,
    diff,
    reason,
    createdAt: new Date()
  });
} 