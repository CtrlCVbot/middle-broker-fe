import { db } from '@/db';
import { userChangeLogs } from '@/db/schema/users';
import { type IUser, type IUserChangeLog } from '@/types/user';

type LogUserChangeParams = Omit<IUserChangeLog, 'id' | 'created_at' | 'diff'> & {
  userId: string;
  changedBy: string;
  changedByName: string;
  changedByEmail: string;
  changedByAccessLevel: string | null;
  changeType: 'create' | 'update' | 'status_change' | 'delete';
  oldData?: Partial<IUser>;
  newData: Partial<IUser>;
  reason?: string | null;
};

/**
 * 사용자 변경 이력을 기록하는 함수
 */
export async function logUserChange({
  userId,
  changedBy,
  changedByName,
  changedByEmail,
  changedByAccessLevel,
  changeType,
  oldData,
  newData,
  reason
}: LogUserChangeParams) {
  try {
    // 변경된 필드 찾기
    const diff: Record<string, [any, any]> = {};
    
    if (oldData) {
      // 수정된 경우: 이전 값과 새로운 값 비교
      for (const [key, newValue] of Object.entries(newData)) {
        const oldValue = oldData[key as keyof typeof oldData];
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          diff[key] = [oldValue, newValue];
        }
      }
    } else {
      // 새로 생성된 경우: 모든 필드를 신규 생성으로 기록
      for (const [key, value] of Object.entries(newData)) {
        diff[key] = [null, value];
      }
    }

    // 변경 이력 기록
    await db.insert(userChangeLogs).values({
      user_id: userId,
      changed_by: changedBy,
      changed_by_name: changedByName,
      changed_by_email: changedByEmail,
      changed_by_access_level: changedByAccessLevel,
      change_type: changeType,
      diff,
      reason: reason || `사용자 ${changeType === 'create' ? '생성' : '정보 변경'}`,
      created_at: new Date()
    });

  } catch (error) {
    console.error('변경 이력 기록 중 오류 발생:', error);
    throw error;
  }
} 