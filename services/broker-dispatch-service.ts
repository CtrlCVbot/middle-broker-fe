import { BrokerOrderStatusType } from '@/types/broker-order';
import { IUser } from '@/types/user';
import { UUID } from 'crypto';

/**
 * 주문 상태를 변경하는 함수
 * @param orderId 주문 ID
 * @param newStatus 새로운 상태
 * @param reason 상태 변경 사유 (선택사항)
 * @returns 성공 여부
 */
export async function changeOrderStatus(
  orderId: string,
  newStatus: BrokerOrderStatusType,
  reason?: string
): Promise<boolean> {
  try {
    const response = await fetch(`/api/orders/${orderId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        flowStatus: newStatus,
        reason: reason || `상태 변경: ${newStatus}`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "상태 변경에 실패했습니다.");
    }

    return true;
  } catch (error) {
    console.error("주문 상태 변경 중 오류:", error);
    throw error;
  }
}

/**
 * 배차 정보를 조회하는 함수 (dispatch_id 기준이 아닌 order_id 기준으로 조회)
 * @param orderId 주문 ID
 * @returns 배차 정보 또는 null
 */
export async function getDispatchByOrderId(orderId: string) {
  try {
    const response = await fetch(`/api/orders/with-dispatch/${orderId}`);

    if (!response.ok) {
      throw new Error("배차 정보 조회에 실패했습니다.");
    }

    const data = await response.json();
    
    if (!data.data.dispatch) {
      return null; // 배차 정보 없음
    }
    
    return data.data.dispatch;
  } catch (error) {
    console.error("배차 정보 조회 중 오류:", error);
    throw error;
  }
}

/**
 * 주문-배차 상세 정보를 조회하는 함수
 * @param orderId 주문 ID
 * @returns 주문-배차 상세 정보
 */
export async function getOrderWithDispatchDetail(orderId: string) {
  try {
    const response = await fetch(`/api/orders/with-dispatch/${orderId}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "주문-배차 정보 조회에 실패했습니다.");
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || "주문-배차 정보 조회에 실패했습니다.");
    }
    
    return data.data;
  } catch (error) {
    console.error("주문-배차 정보 조회 중 오류:", error);
    throw error;
  }
}

/**
 * 배차 정보를 업데이트하는 함수 (dispatch API 대신 order/dispatch API 사용)
 * @param orderId 주문 ID
 * @param dispatchId 배차 ID
 * @param updateData 업데이트할 데이터
 * @returns 업데이트된 배차 정보
 */
export async function updateDispatchInfo(
  orderId: string,
  dispatchId: string,
  updateData: any
): Promise<any> {
  try {
    const response = await fetch(`/api/orders/${orderId}/dispatch`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...updateData,
        id: dispatchId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "배차 정보 업데이트에 실패했습니다.");
    }

    return await response.json();
  } catch (error) {
    console.error("배차 정보 업데이트 중 오류:", error);
    throw error;
  }
}

/**
 * 배차 정보를 취소하는 함수 (dispatch API 대신 order/dispatch API 사용)
 * @param orderId 주문 ID
 * @param dispatchId 배차 ID
 * @returns 성공 여부
 */
export async function cancelDispatch(
  orderId: string, 
  dispatchId: string
): Promise<boolean> {
  try {
    // 1. 배차 상태를 '취소'로 변경
    const response = await fetch(`/api/orders/${orderId}/dispatch`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: dispatchId,
        status: "취소",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "배차 취소에 실패했습니다.");
    }
    
    // 2. 주문 상태를 '배차대기'로 되돌림
    await changeOrderStatus(orderId, "배차대기", "배차 취소로 인한 상태 변경");

    return true;
  } catch (error) {
    console.error("배차 취소 중 오류:", error);
    throw error;
  }
}

/**
 * 화물 운송 수락 API
 * @param orderIds 수락할 화물 ID 배열
 * @returns 결과 정보
 */
export async function acceptOrders(
  orderIds: string[],
  currentUser: IUser,
): Promise<{ success: boolean; message: string; data: any }> {
  try {
    

    console.log('orderIds:', orderIds);

    const response = await fetch(`/api/orders/accept-dispatches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderIds,
        currentUser
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '운송 수락 처리 중 오류가 발생했습니다');
    }

    return await response.json();
  } catch (error: any) {
    console.error('운송 수락 처리 중 오류1:', error);
    throw new Error(`운송 수락 처리에 실패했습니다: ${error.message}`);
  }
}

/**
 * 배차 필드만 업데이트하는 함수
 * @param dispatchId 배차 ID
 * @param fields 업데이트할 필드 (key-value 객체)
 * @param reason 업데이트 사유 (선택사항)
 * @returns 업데이트된 배차 정보
 */
export async function updateDispatchFields(
  dispatchId: string,
  fields: Record<string, any>,
  reason?: string
): Promise<any> {
  try {
    // // dispatchId 유효성 검사
    // if (!dispatchId || typeof dispatchId !== 'string') {
    //   throw new Error("유효하지 않은 배차 ID입니다.");
    // }
    
    // fields 유효성 검사
    if (!fields || Object.keys(fields).length === 0) {
      throw new Error("업데이트할 필드가 지정되지 않았습니다.");
    }
    
    console.log(`배차 필드 업데이트 요청: dispatchId=${dispatchId}, fields=`, fields);
    
    const response = await fetch(`/api/broker/dispatches/${dispatchId}/fields`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields,
        reason: reason || "상태 변경"
      }),
    });

    // 응답 확인
    if (!response.ok) {
      // 서버 응답이 JSON이 아닌 경우를 대비한 에러 처리
      const errorText = await response.text();
      let errorData = {};
      
      try {
        // JSON 형식이면 파싱
        errorData = JSON.parse(errorText);
      } catch (e) {
        // JSON 형식이 아니면 원본 텍스트를 사용
        console.error("서버 응답이 JSON 형식이 아닙니다:", errorText);
      }
      
      const errorMessage = 
        (errorData as any).error || 
        `배차 필드 업데이트에 실패했습니다 (HTTP ${response.status})`;
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("배차 필드 업데이트 성공:", result);
    return result;
  } catch (error) {
    console.error("배차 필드 업데이트 중 오류:", error);
    
    // 네트워크 관련 오류인 경우 더 명확한 메시지 제공
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error("네트워크 연결에 실패했습니다. 인터넷 연결을 확인해주세요.");
    }
    
    throw error;
  }
} 