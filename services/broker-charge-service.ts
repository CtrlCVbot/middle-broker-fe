import { 
  IChargeGroup, 
  IChargeLine, 
  IChargeGroupWithLines,
  CreateChargeGroupInput,
  CreateChargeLineInput,
  IAdditionalFeeInput,
  IApiResponse
} from '@/types/broker-charge';
import { mapAdditionalFeeToChargeGroup, mapAdditionalFeeToChargeLine } from '@/utils/charge-mapper';

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