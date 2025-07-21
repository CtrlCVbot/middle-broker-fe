import { 
  IChargeGroup, 
  IChargeLine, 
  IChargeGroupWithLines,
  CreateChargeGroupInput,
  CreateChargeLineInput,
  IAdditionalFeeInput,
  IApiResponse,
  IOrderPurchase,
  ISettlementWaitingItem,
  ISettlementWaitingResponse,
  ISettlementSummary,
  CreatePurchaseBundleInput,
  IPurchaseBundle,
  IPurchaseBundleListResponse,
  IPurchaseBundleFilter,
  IPurchaseBundleItem,
  IPurchaseBundleAdjustment,
  IPurchaseItemAdjustment,
  IPurchaseBundleItemWithDetails,
  ICreateBundleAdjustmentInput,
  IUpdateBundleAdjustmentInput,
  ICreateItemAdjustmentInput,
  IUpdateItemAdjustmentInput
} from '@/types/broker-charge-purchase';
import { mapAdditionalFeeToChargeGroup, mapAdditionalFeeToChargeLine } from '@/utils/charge-mapper';

import { IWaitingFilter } from '@/components/broker/sale/settlement-waiting-search';

/**
 * 주문 ID로 운임 그룹 목록 조회
 */
export async function getChargeGroupsByOrderId(orderId: string): Promise<IChargeGroupWithLines[]> {
  try {
    const response = await fetch(`/api/charge?orderId=${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('운임 그룹 조회에 실패했습니다.');
    }

    const result = await response.json();
    
    // 각 그룹에 대한 라인 정보 조회
    const groupsWithLines = await Promise.all(
      result.data.map(async (group: IChargeGroup) => {
        const lines = await getChargeLinesByGroupId(group.id);
        return { ...group, chargeLines: lines };
      })
    );
    
    return groupsWithLines;
  } catch (error) {
    console.error('운임 그룹 조회 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 그룹 ID로 운임 라인 목록 조회
 */
export async function getChargeLinesByGroupId(groupId: string): Promise<IChargeLine[]> {
  try {
    const response = await fetch(`/api/charge/lines?groupId=${groupId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('운임 라인 조회에 실패했습니다.');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('운임 라인 조회 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 운임 그룹 생성
 */
export async function createChargeGroup(data: CreateChargeGroupInput): Promise<IChargeGroup> {
  try {
    console.log("운임 그룹 생성 요청 data", data);
    const response = await fetch('/api/charge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '운임 그룹 생성에 실패했습니다.');
    }

    const result: IApiResponse<IChargeGroup> = await response.json();
    return result.data;
  } catch (error) {
    console.error('운임 그룹 생성 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 운임 라인 생성
 */
export async function createChargeLine(data: CreateChargeLineInput): Promise<IChargeLine> {
  try {
    const response = await fetch('/api/charge/lines', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '운임 라인 생성에 실패했습니다.');
    }

    const result: IApiResponse<IChargeLine> = await response.json();
    return result.data;
  } catch (error) {
    console.error('운임 라인 생성 중 오류 발생 최종:', error);
    throw error;
  }
}

/**
 * 추가 비용 정보로 운임 그룹 및 라인 생성 (통합 함수)
 */
export async function createChargeFromAdditionalFee(
  fee: IAdditionalFeeInput,
  orderId: string,
  dispatchId?: string
): Promise<IChargeGroupWithLines> {
  try {
    // 1. 운임 그룹 생성
    console.log("운임 그룹 생성 fee", fee);
    const groupInput = mapAdditionalFeeToChargeGroup(fee, orderId, dispatchId);
    console.log("groupInput", groupInput);
    const createdGroup = await createChargeGroup(groupInput);
    console.log("createdGroup", createdGroup);

    const chargeLines: IChargeLine[] = [];
    
    // 2. 청구(sales) 라인 생성 (필요한 경우)
    if (fee.target.charge) {
      const salesLineInput = mapAdditionalFeeToChargeLine(fee, createdGroup.id, 'sales');
      if (salesLineInput) {
        const createdSalesLine = await createChargeLine(salesLineInput);
        chargeLines.push(createdSalesLine);
      }
    }
    
    // 3. 배차(purchase) 라인 생성 (필요한 경우)
    if (fee.target.dispatch) {
      const purchaseLineInput = mapAdditionalFeeToChargeLine(fee, createdGroup.id, 'purchase');
      if (purchaseLineInput) {
        const createdPurchaseLine = await createChargeLine(purchaseLineInput);
        chargeLines.push(createdPurchaseLine);
      }
    }
    
    // 4. 결과 반환
    return {
      ...createdGroup,
      chargeLines
    };
  } catch (error) {
    console.error('운임 생성 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 매입 인보이스 목록 조회
 */
export async function getOrderPurchases(params: {
  page?: number;
  pageSize?: number;
  status?: string;
  companyId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<IApiResponse<IOrderPurchase[]>> {
  try {
    const queryParams = new URLSearchParams();
    
    // 선택적 파라미터 추가
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.companyId) queryParams.append('companyId', params.companyId);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    const response = await fetch(`/api/charge/purchase?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('매입 인보이스 조회에 실패했습니다.');
    }

    return await response.json();
  } catch (error) {
    console.error('매입 인보이스 조회 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 정산 대기 중인 화물 목록 조회
 */
export async function getSettlementWaitingItems(params: {
  page?: number;
  pageSize?: number;
  filter?: IWaitingFilter;
}): Promise<ISettlementWaitingResponse> {
  try {
    // 파라미터로 쿼리 문자열 구성
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    //if (params.companyId) queryParams.append('companyId', params.companyId);
    if (params.filter?.startDate) queryParams.append('startDate', params.filter.startDate);
    if (params.filter?.endDate) queryParams.append('endDate', params.filter.endDate);
    if (params.filter?.searchTerm) queryParams.append('searchTerm', params.filter.searchTerm);

    console.log("정산 대기 화물 조회 파라미터", queryParams.toString());
    
    // 임시 구현: 완료된 주문을 조회한 후 정산 대기 항목으로 변환
    // 실제 API가 구현되면 아래 코드는 수정해야 함
    const response = await fetch(`/api/charge/sales/waiting?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('정산 대기 화물 조회에 실패했습니다.');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('정산 대기 화물 조회 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 선택된 주문에 대한 정산 요약 정보 계산
 */
export async function calculateSettlementSummary(
  orderIds: string[],
  companies: { id: string; name: string }[]
): Promise<ISettlementSummary> {
  try {
    // 선택된 orderIds 문자열로 변환
    const orderIdsParam = orderIds.join(',');
    
    // 실제 API 호출
    const response = await fetch(`/api/charge/purchase/summary?orderIds=${orderIdsParam}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('정산 요약 정보 계산에 실패했습니다.');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('정산 요약 정보 계산 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 매입  인보이스 생성
 */
export async function createOrderPurchase(data: {
  orderId: string;
  companyId: string;
  totalAmount: number;
  taxAmount?: number;
  memo?: string;
}): Promise<IApiResponse<IOrderPurchase>> {
  try {
    const response = await fetch('/api/charge/purchase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...data,
        status: 'draft',
        subtotalAmount: data.totalAmount - (data.taxAmount || 0)
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '매입   인보이스 생성에 실패했습니다.');
    }

    return await response.json();
  } catch (error) {
    console.error('매입 인보이스 생성 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 매입 번들(정산 묶음) 생성
 */
export async function createPurchaseBundle(data: CreatePurchaseBundleInput): Promise<IPurchaseBundle> {
  try {
    const response = await fetch('/api/charge/purchase-bundles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '매출 번들 생성에 실패했습니다.');
    }
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('매출 번들 생성 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 매입 번들(정산 묶음) 목록 조회
 */
export async function getPurchaseBundles(
  page: number = 1,
  pageSize: number = 10,
  filter?: IPurchaseBundleFilter
): Promise<IPurchaseBundleListResponse> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString()
    });

    // 필터 파라미터 추가
    if (filter) {
      if (filter.companyId) params.append('companyId', filter.companyId);
      if (filter.shipperName) params.append('shipperName', filter.shipperName);
      if (filter.shipperBusinessNumber) params.append('shipperBusinessNumber', filter.shipperBusinessNumber);
      if (filter.status) params.append('status', filter.status);
      if (filter.startDate) params.append('startDate', filter.startDate);
      if (filter.endDate) params.append('endDate', filter.endDate);
      if (filter.sortBy) params.append('sortBy', filter.sortBy);
      if (filter.sortOrder) params.append('sortOrder', filter.sortOrder);
      if (filter.search) params.append('search', filter.search);
    }

    const response = await fetch(`/api/charge/purchase-bundles?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '매출 번들 목록 조회에 실패했습니다.');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('매출 번들 목록 조회 중 오류 발생:', error);
    throw error;
  }
} 

/**
 * 매입 번들(정산 묶음) 상세 조회
  */
export async function getPurchaseBundleItems(purchaseBundleId: string): Promise<IPurchaseBundleItem[]> {
  try {
    const response = await fetch(`/api/charge/purchase-bundles/items?purchaseBundleId=${purchaseBundleId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '매출 번들 상세 조회에 실패했습니다.');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('매출 번들 상세 조회 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 특정 매입 번들 상세 조회
 */
export async function getPurchaseBundleById(id: string): Promise<IPurchaseBundle> {
  try {
    const response = await fetch(`/api/charge/purchase-bundles/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '매출 번들 조회에 실패했습니다.');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('매출 번들 조회 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 매입 번들 필드 업데이트
 */
export async function updatePurchaseBundle(
  id: string, 
  fields: Record<string, any>, 
  reason?: string
): Promise<IPurchaseBundle> {
  try {
    const response = await fetch(`/api/charge/purchase-bundles/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'current-user-id' // TODO: 실제 사용자 ID로 교체
      },
      body: JSON.stringify({ fields, reason })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '매출 번들 수정에 실패했습니다.');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('매출 번들 수정 중 오류 발생:', error);
    throw error;
  }
}



/**
 * 매입 번들 삭제
 */
export async function deletePurchaseBundle(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/charge/purchase-bundles/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '매출 번들 삭제에 실패했습니다.');
    }
  } catch (error) {
    console.error('매출 번들 삭제 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 통합 추가금 목록 조회
 */
export async function getBundleAdjustments(bundleId: string): Promise<IPurchaseBundleAdjustment[]> {
  try {
    const response = await fetch(`/api/charge/purchase-bundles/${bundleId}/adjustments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('통합 추가금 조회에 실패했습니다.');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('통합 추가금 조회 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 통합 추가금 생성
 */
export async function createBundleAdjustment(
  bundleId: string, 
  data: ICreateBundleAdjustmentInput
): Promise<IPurchaseBundleAdjustment> {
  try {
    const response = await fetch(`/api/charge/purchase-bundles/${bundleId}/adjustments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '통합 추가금 생성에 실패했습니다.');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('통합 추가금 생성 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 통합 추가금 수정
 */
export async function updateBundleAdjustment(
  bundleId: string,
  adjustmentId: string,
  data: IUpdateBundleAdjustmentInput
): Promise<IPurchaseBundleAdjustment> {
  try {
    const response = await fetch(`/api/charge/purchase-bundles/${bundleId}/adjustments`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ adjustmentId, ...data })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '통합 추가금 수정에 실패했습니다.');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('통합 추가금 수정 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 통합 추가금 삭제
 */
export async function deleteBundleAdjustment(bundleId: string, adjustmentId: string): Promise<void> {
  try {
    const response = await fetch(`/api/charge/purchase-bundles/${bundleId}/adjustments?adjustmentId=${adjustmentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '통합 추가금 삭제에 실패했습니다.');
    }
  } catch (error) {
    console.error('통합 추가금 삭제 중 오류 발생:', error);
    throw error;
  }
}



/**
 * 개별 화물 추가금 목록 조회
 */
export async function getItemAdjustments(itemId: string): Promise<IPurchaseItemAdjustment[]> {
  try {
    const response = await fetch(`/api/charge/purchase-bundles/items/${itemId}/adjustments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('개별 화물 추가금 조회에 실패했습니다.');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('개별 화물 추가금 조회 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 개별 화물 추가금 생성
 */
export async function createItemAdjustment(
  itemId: string, 
  data: ICreateItemAdjustmentInput
): Promise<IPurchaseItemAdjustment> {
  try {
    const response = await fetch(`/api/charge/purchase-bundles/items/${itemId}/adjustments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '개별 화물 추가금 생성에 실패했습니다.');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('개별 화물 추가금 생성 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 개별 화물 추가금 수정
 */
export async function updateItemAdjustment(
  itemId: string,
  adjustmentId: string,
  data: IUpdateItemAdjustmentInput
): Promise<IPurchaseItemAdjustment> {
  try {
    const response = await fetch(`/api/charge/purchase-bundles/items/${itemId}/adjustments`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ adjustmentId, ...data })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '개별 화물 추가금 수정에 실패했습니다.');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('개별 화물 추가금 수정 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 개별 화물 추가금 삭제
 */
export async function deleteItemAdjustment(itemId: string, adjustmentId: string): Promise<void> {
  try {
    const response = await fetch(`/api/charge/purchase-bundles/items/${itemId}/adjustments?adjustmentId=${adjustmentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '개별 화물 추가금 삭제에 실패했습니다.');
    }
  } catch (error) {
    console.error('개별 화물 추가금 삭제 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 정산 그룹의 화물 목록 조회 (상세 정보 포함)
 */
export async function getPurchaseBundleFreightList(bundleId: string): Promise<IPurchaseBundleItemWithDetails[]> {
  try {
    const response = await fetch(`/api/charge/purchase-bundles/${bundleId}/order-list`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('화물 목록 조회에 실패했습니다.');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('화물 목록 조회 중 오류 발생:', error);
    throw error;
  }
}
