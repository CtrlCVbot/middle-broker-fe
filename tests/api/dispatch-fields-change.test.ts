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

describe('배차 정보 변경 이력 기록', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('배차 정보 변경 시 updateDispatch 타입으로 기록되어야 함', async () => {
    const testData = {
      orderId: 'test-order-id',
      changedBy: 'test-user-id',
      changedByRole: 'broker' as const,
      changedByName: '테스트 사용자',
      changedByEmail: 'test@example.com',
      changedByAccessLevel: 'broker_member',
      changeType: 'updateDispatch' as const,
      oldData: { 
        assignedDriverId: 'old-driver-id',
        assignedVehicleNumber: 'old-vehicle-123'
      },
      newData: { 
        assignedDriverId: 'new-driver-id',
        assignedVehicleNumber: 'new-vehicle-456'
      },
      reason: '배차 정보 변경: assignedDriverId, assignedVehicleNumber'
    };

    await logOrderChange(testData);

    expect(mockDb.insert).toHaveBeenCalled();
    expect(mockDb.values).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: 'test-order-id',
        changeType: 'updateDispatch',
        changedByRole: 'broker',
        reason: '배차 정보 변경: assignedDriverId, assignedVehicleNumber'
      })
    );
  });

  it('상태 변경 시 updateDispatch 타입으로 기록되어야 함', async () => {
    const testData = {
      orderId: 'test-order-id',
      changedBy: 'test-user-id',
      changedByRole: 'broker' as const,
      changedByName: '테스트 사용자',
      changedByEmail: 'test@example.com',
      changedByAccessLevel: 'broker_member',
      changeType: 'updateDispatch' as const,
      oldData: { 
        brokerFlowStatus: '배차대기'
      },
      newData: { 
        brokerFlowStatus: '배차완료'
      },
      reason: '상태 변경: 배차대기 → 배차완료'
    };

    await logOrderChange(testData);

    expect(mockDb.insert).toHaveBeenCalled();
    expect(mockDb.values).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: 'test-order-id',
        changeType: 'updateDispatch',
        changedByRole: 'broker',
        reason: '상태 변경: 배차대기 → 배차완료'
      })
    );
  });
}); 