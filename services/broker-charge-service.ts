import { 
  IChargeGroup, 
  IChargeLine, 
  IChargeGroupWithLines,
  CreateChargeGroupInput,
  CreateChargeLineInput,
  IAdditionalFeeInput,
  IApiResponse,
  IOrderSale,
  ISettlementWaitingItem,
  ISettlementWaitingResponse,
  ISettlementSummary
} from '@/types/broker-charge';
import { mapAdditionalFeeToChargeGroup, mapAdditionalFeeToChargeLine } from '@/utils/charge-mapper';
import { IBrokerOrder } from '@/types/broker-order';

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
    console.error('운임 라인 생성 중 오류 발생:', error);
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
 * 매출 인보이스 목록 조회
 */
export async function getOrderSales(params: {
  page?: number;
  pageSize?: number;
  status?: string;
  companyId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<IApiResponse<IOrderSale[]>> {
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
    
    const response = await fetch(`/api/charge/sales?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('매출 인보이스 조회에 실패했습니다.');
    }

    return await response.json();
  } catch (error) {
    console.error('매출 인보이스 조회 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 정산 대기 중인 화물 목록 조회
 */
export async function getSettlementWaitingItems(params: {
  page?: number;
  pageSize?: number;
  companyId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<ISettlementWaitingResponse> {
  try {
    // 파라미터로 쿼리 문자열 구성
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params.companyId) queryParams.append('companyId', params.companyId);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);

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
    const response = await fetch(`/api/charge/sales/summary?orderIds=${orderIdsParam}`, {
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
 * 매출 인보이스 생성
 */
export async function createOrderSale(data: {
  orderId: string;
  companyId: string;
  totalAmount: number;
  taxAmount?: number;
  memo?: string;
}): Promise<IApiResponse<IOrderSale>> {
  try {
    const response = await fetch('/api/charge/sales', {
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
      throw new Error(error.error || '매출 인보이스 생성에 실패했습니다.');
    }

    return await response.json();
  } catch (error) {
    console.error('매출 인보이스 생성 중 오류 발생:', error);
    throw error;
  }
} 