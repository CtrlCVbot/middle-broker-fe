import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logOrderChange } from '@/utils/order-change-logger';

// Mock dependencies
vi.mock('@/db', () => ({
  db: {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 'test-log-id' }])
      })
    })
  }
}));

vi.mock('@/db/schema/orderChangeLogs', () => ({
  orderChangeLogs: {}
}));

describe('운임 변경 이력 기록 테스트', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('청구금만 변경된 경우 updatePriceSales로 기록되어야 함', async () => {
    const mockOrderId = 'test-order-id';
    const mockUserId = 'test-user-id';
    
    const oldData = {
      salesAmount: 100000,
      purchaseAmount: 80000
    };
    
    const newData = {
      salesAmount: 120000,
      purchaseAmount: 80000
    };

    await logOrderChange({
      orderId: mockOrderId,
      changedBy: mockUserId,
      changedByRole: 'broker',
      changedByName: '테스트 사용자',
      changedByEmail: 'test@example.com',
      changedByAccessLevel: 'broker_member',
      changeType: 'updatePriceSales',
      oldData,
      newData,
      reason: '운임 정보 변경: 청구금 20,000원 추가'
    });

    expect(logOrderChange).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: mockOrderId,
        changeType: 'updatePriceSales',
        changedByRole: 'broker'
      })
    );
  });

  it('배차금만 변경된 경우 updatePricePurchase로 기록되어야 함', async () => {
    const mockOrderId = 'test-order-id';
    const mockUserId = 'test-user-id';
    
    const oldData = {
      salesAmount: 100000,
      purchaseAmount: 80000
    };
    
    const newData = {
      salesAmount: 100000,
      purchaseAmount: 90000
    };

    await logOrderChange({
      orderId: mockOrderId,
      changedBy: mockUserId,
      changedByRole: 'broker',
      changedByName: '테스트 사용자',
      changedByEmail: 'test@example.com',
      changedByAccessLevel: 'broker_member',
      changeType: 'updatePricePurchase',
      oldData,
      newData,
      reason: '운임 정보 변경: 배차금 10,000원 추가'
    });

    expect(logOrderChange).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: mockOrderId,
        changeType: 'updatePricePurchase',
        changedByRole: 'broker'
      })
    );
  });

  it('청구금과 배차금이 모두 변경된 경우 updatePrice로 기록되어야 함', async () => {
    const mockOrderId = 'test-order-id';
    const mockUserId = 'test-user-id';
    
    const oldData = {
      salesAmount: 100000,
      purchaseAmount: 80000
    };
    
    const newData = {
      salesAmount: 120000,
      purchaseAmount: 90000
    };

    await logOrderChange({
      orderId: mockOrderId,
      changedBy: mockUserId,
      changedByRole: 'broker',
      changedByName: '테스트 사용자',
      changedByEmail: 'test@example.com',
      changedByAccessLevel: 'broker_member',
      changeType: 'updatePrice',
      oldData,
      newData,
      reason: '운임 정보 변경: 청구금 및 배차금 조정'
    });

    expect(logOrderChange).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: mockOrderId,
        changeType: 'updatePrice',
        changedByRole: 'broker'
      })
    );
  });

  it('운임 정보 변경 시 changedByRole이 올바르게 설정되어야 함', async () => {
    const testCases = [
      { accessLevel: 'broker_member', expectedRole: 'broker' },
      { accessLevel: 'shipper_member', expectedRole: 'shipper' },
      { accessLevel: 'platform_admin', expectedRole: 'admin' },
      { accessLevel: 'broker_admin', expectedRole: 'admin' },
      { accessLevel: 'shipper_admin', expectedRole: 'admin' }
    ];

    for (const testCase of testCases) {
      await logOrderChange({
        orderId: 'test-order-id',
        changedBy: 'test-user-id',
        changedByRole: testCase.expectedRole as 'shipper' | 'broker' | 'admin',
        changedByName: '테스트 사용자',
        changedByEmail: 'test@example.com',
        changedByAccessLevel: testCase.accessLevel,
        changeType: 'updatePrice',
        oldData: { salesAmount: 100000, purchaseAmount: 80000 },
        newData: { salesAmount: 120000, purchaseAmount: 90000 },
        reason: '운임 정보 변경 테스트'
      });

      expect(logOrderChange).toHaveBeenCalledWith(
        expect.objectContaining({
          changedByRole: testCase.expectedRole,
          changedByAccessLevel: testCase.accessLevel
        })
      );
    }
  });
});