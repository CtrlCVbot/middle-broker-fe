import { IOrderSale } from "@/types/settlement";

// 주문 매출 정산 데이터 생성 함수
export async function createSale(orderId: string, dispatchId: string): Promise<IOrderSale> {
  try {
    // 현재 주문 및 배차 정보를 가져옴
    console.log("createSale 호출됨");
    console.log("orderId:", orderId);
    const orderResponse = await fetch(`/api/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!orderResponse.ok) {
      throw new Error('주문 정보 조회에 실패했습니다.');
    }
    
    const orderData = await orderResponse.json();
    
    // 운임 정보 조회
    const chargeResponse = await fetch(`/api/charge?orderId=${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!chargeResponse.ok) {
      throw new Error('운임 정보 조회에 실패했습니다.');
    }
    
    const chargeData = await chargeResponse.json();
    
    console.log("매출 정산 데이터 생성을 위한 orderData:", orderData);
    console.log("매출 정산 데이터 생성을 위한 chargeData:", chargeData);
    // 매출 정산 데이터 생성을 위한 요청 바디 구성
    const saleData = {
      orderId,
      companyId: orderData.companyId, // 화주 회사 IDs
      status: 'draft', // 초기 상태는 draft
      subtotalAmount: calculateSubtotal(chargeData.data), // 운임 데이터에서 소계 계산
      totalAmount: calculateTotal(chargeData.data), // 운임 데이터에서 총액 계산
      financialSnapshot: {
        order: orderData.data,
        charges: chargeData.data,
        timestamp: new Date().toISOString()
      },
      items: generateSaleItems(chargeData.data) // 운임 항목을 매출 항목으로 변환
    };
    console.log("매출 정산 데이터 생성을 위한 saleData:", saleData);
    
    // 매출 정산 데이터 생성 API 호출
    const response = await fetch('/api/charge/sales', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(saleData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '매출 정산 데이터 생성에 실패했습니다.');
    }
    
    const result = await response.json();
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