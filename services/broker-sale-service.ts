import {   
  IOrderDispatchWithSalesStatus, 
  ISalesData, 
  IOrderSale, 
  ISalesStatusResponse 
} from '@/types/broker-sale';
import { IOrderDispatch } from '@/types/broker-dispatch';

/**
 * 운송 완료된 디스패치 목록을 조회하는 함수
 * @returns 운송 완료된 디스패치 목록
 */
export async function getCompletedDispatches(): Promise<IOrderDispatch[]> {
  try {
    // 운송 완료 상태의 디스패치만 필터링
    const response = await fetch('/api/broker/dispatches?status=운송완료', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('운송 완료된 디스패치 목록 조회에 실패했습니다.');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('운송 완료된 디스패치 목록 조회 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 특정 디스패치의 매출 정산 상태를 확인하는 함수
 * @param dispatchId 디스패치 ID
 * @returns 매출 정산 상태 정보 (정산 존재 여부, 정산 ID)
 */
export async function getSalesStatus(dispatchId: string): Promise<ISalesStatusResponse> {
  try {
    const response = await fetch(`/api/broker/dispatches/${dispatchId}/sales-status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('디스패치 매출 정산 상태 확인에 실패했습니다.');
    }

    const data = await response.json();
    return {
      hasSales: !!data.data?.hasSales,
      salesId: data.data?.salesId,
      salesStatus: data.data?.salesStatus,
    };
  } catch (error) {
    console.error('디스패치 매출 정산 상태 확인 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 매출 정산 데이터를 생성하는 함수
 * @param salesData 매출 정산 데이터
 * @returns 생성된 매출 정산 정보
 */
export async function createSales(salesData: ISalesData): Promise<IOrderSale> {
  try {
    const response = await fetch('/api/charge/sales', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(salesData),
    });

    if (!response.ok) {
      throw new Error('매출 정산 데이터 생성에 실패했습니다.');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('매출 정산 데이터 생성 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 디스패치 마감 처리를 하는 함수
 * @param dispatchId 디스패치 ID
 * @returns 마감 처리 결과
 */
export async function closeSalesDispatch(dispatchId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/broker/dispatches/${dispatchId}/close`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('디스패치 마감 처리에 실패했습니다.');
    }

    const data = await response.json();
    return !!data.data?.isClosed;
  } catch (error) {
    console.error('디스패치 마감 처리 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 매출 정산 데이터 생성 및 디스패치 마감 처리를 한번에 수행하는 함수
 * @param dispatchId 디스패치 ID
 * @param salesData 매출 정산 데이터
 * @returns 생성된 매출 정산 정보
 */
export async function createSalesAndCloseDispatch(
  dispatchId: string,
  salesData: ISalesData
): Promise<IOrderSale> {
  try {
    // 1. 매출 정산 데이터 생성
    const sale = await createSales(salesData);
    
    // 2. 디스패치 마감 처리
    await closeSalesDispatch(dispatchId);
    
    return sale;
  } catch (error) {
    console.error('매출 정산 및 디스패치 마감 처리 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 디스패치 정보를 기반으로 매출 정산 데이터 요약을 생성하는 함수
 * @param dispatchId 디스패치 ID
 * @returns 매출 정산 데이터 요약
 */
export async function generateSalesSummary(dispatchId: string): Promise<ISalesData> {
  try {
    const response = await fetch(`/api/broker/dispatches/${dispatchId}/sales-summary`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('매출 정산 데이터 요약 생성에 실패했습니다.');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('매출 정산 데이터 요약 생성 중 오류 발생:', error);
    throw error;
  }
} 