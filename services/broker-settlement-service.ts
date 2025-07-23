import { IOrderSale } from "@/types/settlement";
import { ISalesData } from "@/types/broker-sale";

// 디스패치 매출 정산 요약 정보 조회 함수
async function fetchSalesSummary(dispatchId: string): Promise<ISalesData> {
  try {
    const response = await fetch(`/api/broker/dispatches/${dispatchId}/sales-summary`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '디스패치 매출 정산 요약 정보 조회에 실패했습니다.');
    }
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('디스패치 매출 정산 요약 정보 조회 중 오류 발생:', error);
    throw error;
  }
}

// 디스패치 매출 정산 요약 정보 조회 함수
async function fetchPurchaseSummary(dispatchId: string): Promise<ISalesData> {
  try {
    const response = await fetch(`/api/broker/dispatches/${dispatchId}/purchase-summary`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '디스패치 매입 정산 요약 정보 조회에 실패했습니다.');
    }
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('디스패치 매입 정산 요약 정보 조회 중 오류 발생:', error);
    throw error;
  }
}

// 디스패치 마감 처리 함수
async function closeDispatch(dispatchId: string): Promise<void> {
  try {
    const response = await fetch(`/api/broker/dispatches/${dispatchId}/close`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '디스패치 마감 처리에 실패했습니다.');
    }
    
    console.log('디스패치 마감 처리 완료:', dispatchId);
  } catch (error) {
    console.error('디스패치 마감 처리 중 오류 발생:', error);
    throw error;
  }
}

// 주문 매출 정산 데이터 생성 함수
export async function createSale(orderId: string, dispatchId: string): Promise<IOrderSale> {
  try {
    console.log("createSale 호출됨");
    console.log("orderId:", orderId);
    console.log("dispatchId:", dispatchId);
    
    // 1. 디스패치 매출 정산 요약 정보 조회
    console.log("디스패치 매출 정산 요약 정보 조회 시작");
    const salesSummary = await fetchSalesSummary(dispatchId);
    console.log("디스패치 매출 정산 요약 정보:", salesSummary);
    
    // 2. 매출 정산 데이터 생성 API 호출
    console.log("매출 정산 데이터 생성 API 호출 시작");
    const response = await fetch('/api/charge/sales', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(salesSummary),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '매출 정산 데이터 생성에 실패했습니다.');
    }
    
    const result = await response.json();
    console.log("매출 정산 데이터 생성 완료:", result.data);
    
    // 3. 디스패치 마감 처리
    console.log("디스패치 마감 처리 시작");
    await closeDispatch(dispatchId);
    
    return result.data;
  } catch (error) {
    console.error('매출 정산 데이터 생성 중 오류 발생:', error);
    throw error;
  }
}

// 특정 주문의 매출 정산 데이터가 이미 존재하는지 확인하는 함수
export async function checkSaleExists(orderId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/charge/sales?orderId=${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('매출 정산 데이터 확인에 실패했습니다.');
    }
    
    const result = await response.json();
    return result.total > 0; // 해당 주문 ID로 생성된 매출 정산 데이터가 있는지 확인
  } catch (error) {
    console.error('매출 정산 데이터 확인 중 오류 발생:', error);
    throw error;
  }
}

// 주문 매입 정산 데이터 생성 함수
export async function createPurchase(orderId: string, dispatchId: string): Promise<IOrderSale> {
  try {        
    // 1. 디스패치 매출 정산 요약 정보 조회
    console.log("디스패치 매출 정산 요약 정보 조회 시작");
    const purchaseSummary = await fetchPurchaseSummary(dispatchId);
    console.log("디스패치 매입 정산 요약 정보:", purchaseSummary);
    
    // 2. 매입 정산 데이터 생성 API 호출
    console.log("매입 정산 데이터 생성 API 호출 시작");
    const response = await fetch('/api/charge/purchase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(purchaseSummary),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '매입 정산 데이터 생성에 실패했습니다.');
    }
    
    const result = await response.json();
    console.log("매입 정산 데이터 생성 완료:", result.data);
    
    // 3. 디스패치 마감 처리
    console.log("디스패치 마감 처리 시작");
    await closeDispatch(dispatchId);
    
    return result.data;
  } catch (error) {
    console.error('매입 정산 데이터 생성 중 오류 발생:', error);
    throw error;
  }
}

// 특정 주문의 매입 정산 데이터가 이미 존재하는지 확인하는 함수
export async function checkPurchaseExists(orderId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/charge/purchase?orderId=${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('매입 정산 데이터 확인에 실패했습니다.');
    }
    
    const result = await response.json();
    return result.total > 0; // 해당 주문 ID로 생성된 매입 정산 데이터가 있는지 확인
  } catch (error) {
    console.error('매입 정산 데이터 확인 중 오류 발생:', error);
    throw error;
  }
}


// 주문 매입 정산 데이터 생성 함수
export async function createSettlement(orderId: string, dispatchId: string): Promise<IOrderSale> {
  try {        
    // 1. 디스패치 매출, 매입 정산 요약 정보 조회
    console.log("디스패치 매출, 매입 정산 요약 정보 조회 시작");
    // const salesSummary = await fetchSalesSummary(dispatchId);
    // const purchaseSummary = await fetchPurchaseSummary(dispatchId);
    const [salesSummary, purchaseSummary] = await Promise.all([
      fetchSalesSummary(dispatchId),
      fetchPurchaseSummary(dispatchId),
    ]);
    
    console.log("디스패치 매출 정산 요약 정보:", salesSummary);
    console.log("디스패치 매입 정산 요약 정보:", purchaseSummary);

    
    
    // 2. 매입, 매출 정산 데이터 생성 API 호출
    console.log("매입, 매출 정산 데이터 생성 API 호출 시작");
    const response = await fetch('/api/charge/settlement', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({sales: salesSummary, purchase: purchaseSummary}),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '매입 정산 데이터 생성에 실패했습니다.');
    }
    
    const result = await response.json();
    console.log("매입 정산 데이터 생성 완료:", result.data);
    
    // 3. 디스패치 마감 처리
    console.log("디스패치 마감 처리 시작");
    await closeDispatch(dispatchId);
    
    return result.data;
  } catch (error) {
    console.error('매입 정산 데이터 생성 중 오류 발생:', error);
    throw error;
  }
}

// 운임 데이터에서 소계 계산 함수
function calculateSubtotal(chargeData: any): number {
  let subtotal = 0;
  
  // 운임 그룹 데이터가 있으면 각 그룹의 금액 합산
  if (Array.isArray(chargeData.chargeGroups)) {
    chargeData.chargeGroups.forEach((group: any) => {
      if (Array.isArray(group.lines)) {
        group.lines.forEach((line: any) => {
          subtotal += Number(line.amount) || 0;
        });
      }
    });
  }
  
  return subtotal;
}

// 운임 데이터에서 총액 계산 함수
function calculateTotal(chargeData: any): number {
  // 간단하게 소계와 동일하게 처리 (향후 세금 등 추가 가능)
  return calculateSubtotal(chargeData);
}

// 운임 항목을 매출 항목으로 변환하는 함수
function generateSaleItems(chargeData: any): any[] {
  const items: any[] = [];
  
  // 운임 그룹 데이터가 있으면 각 라인을 매출 항목으로 변환
  if (Array.isArray(chargeData.chargeGroups)) {
    chargeData.chargeGroups.forEach((group: any) => {
      if (Array.isArray(group.lines)) {
        group.lines.forEach((line: any) => {
          items.push({
            description: line.description || '운송 비용',
            amount: Number(line.amount) || 0,
            originalChargeLineId: line.id
          });
        });
      }
    });
  }
  
  // 항목이 없으면 기본 항목 추가
  if (items.length === 0) {
    items.push({
      description: '기본 운송 비용',
      amount: 0
    });
  }
  
  return items;
} 