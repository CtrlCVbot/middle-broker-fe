import { BrokerOrderStatusType } from '@/types/broker-order';

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