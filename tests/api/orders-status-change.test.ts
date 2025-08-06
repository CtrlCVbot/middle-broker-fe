import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { logOrderChange } from '@/utils/order-change-logger';

// Mock database
const mockDb = {
  insert: jest.fn().mockReturnThis(),
  values: jest.fn().mockReturnThis(),
  execute: jest.fn().mockResolvedValue([{ id: 'test-id' }])
};

// Mock the database module
jest.mock('@/db', () => ({
  db: mockDb
}));

describe('배차 상태 변경 이력 기록', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('상태 변경 시 updateStatus 타입으로 기록되어야 함', async () => {
    const testData = {
      orderId: 'test-order-id',
      changedBy: 'test-user-id',
      changedByRole: 'broker' as const,
      changedByName: '테스트 사용자',
      changedByEmail: 'test@example.com',
      changedByAccessLevel: 'broker_member',
      changeType: 'updateStatus' as const,
      oldData: { flowStatus: '배차대기' },
      newData: { flowStatus: '배차완료' },
      reason: '상태 변경: 배차대기 → 배차완료'
    };

    await logOrderChange(testData);

    expect(mockDb.insert).toHaveBeenCalled();
    expect(mockDb.values).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: 'test-order-id',
        changeType: 'updateStatus',
        changedByRole: 'broker',
        reason: '상태 변경: 배차대기 → 배차완료'
      })
    );
  });

  it('일반 업데이트 시 update 타입으로 기록되어야 함', async () => {
    const testData = {
      orderId: 'test-order-id',
      changedBy: 'test-user-id',
      changedByRole: 'broker' as const,
      changedByName: '테스트 사용자',
      changedByEmail: 'test@example.com',
      changedByAccessLevel: 'broker_member',
      changeType: 'update' as const,
      oldData: { cargoName: '이전 화물명' },
      newData: { cargoName: '새 화물명' },
      reason: '화물 정보 업데이트'
    };

    await logOrderChange(testData);

    expect(mockDb.insert).toHaveBeenCalled();
    expect(mockDb.values).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: 'test-order-id',
        changeType: 'update',
        changedByRole: 'broker',
        reason: '화물 정보 업데이트'
      })
    );
  });
}); 