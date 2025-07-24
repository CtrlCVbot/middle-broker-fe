import { IOrderDetail, mockOrderDetails } from './mock-orders-detail';
import { IOrderRegisterData } from '@/types/order';

// 화물 수정 함수 (목업)
export const updateOrder = async (
  orderId: string, 
  updateData: Partial<IOrderRegisterData>
): Promise<IOrderDetail> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 기존 화물 정보 확인
      const existingOrder = mockOrderDetails[orderId];
      if (!existingOrder) {
        reject(new Error("화물을 찾을 수 없습니다."));
        return;
      }
      
      // 화물 정보 업데이트 로직
      const updatedOrder: IOrderDetail = {
        ...existingOrder,
      };
      
      // 차량 타입
      if (updateData.vehicleType) {
        updatedOrder.vehicle.type = updateData.vehicleType;
      }
      
      // 중량
      if (updateData.weightType) {
        updatedOrder.vehicle.weight = updateData.weightType;
      }
      
      // 화물 품목
      if (updateData.cargoType) {
        updatedOrder.cargo.type = updateData.cargoType;
      }
      
      // 비고
      if (updateData.remark !== undefined) {
        updatedOrder.cargo.remark = updateData.remark;
      }
      
      // 출발지 정보
      if (updateData.departure) {
        updatedOrder.departure = {
          ...updatedOrder.departure,
          address: updateData.departure.address || updatedOrder.departure.address,
          detailedAddress: updateData.departure.detailedAddress || updatedOrder.departure.detailedAddress,
          name: updateData.departure.name || updatedOrder.departure.name,
          company: updateData.departure.company || updatedOrder.departure.company,
          contact: updateData.departure.contact || updatedOrder.departure.contact,
          date: updateData.departure.date || updatedOrder.departure.date,
          time: updateData.departure.time || updatedOrder.departure.time,
        };
      }
      
      // 도착지 정보
      if (updateData.destination) {
        updatedOrder.destination = {
          ...updatedOrder.destination,
          address: updateData.destination.address || updatedOrder.destination.address,
          detailedAddress: updateData.destination.detailedAddress || updatedOrder.destination.detailedAddress,
          name: updateData.destination.name || updatedOrder.destination.name,
          company: updateData.destination.company || updatedOrder.destination.company,
          contact: updateData.destination.contact || updatedOrder.destination.contact,
          date: updateData.destination.date || updatedOrder.destination.date,
          time: updateData.destination.time || updatedOrder.destination.time,
        };
      }
      
      // 옵션
      if (updateData.selectedOptions) {
        updatedOrder.cargo.options = updateData.selectedOptions;
      }
      
      // 금액
      if (updateData.estimatedAmount) {
        updatedOrder.amount = updateData.estimatedAmount.toLocaleString();
      }
      
      // 실제로는 여기서 mockOrderDetails 객체를 업데이트
      // 이 예제에서는 간단히 응답만 리턴합니다.
      
      // 모든 처리가 완료되면 업데이트된 주문 정보 반환
      resolve(updatedOrder);
    }, 1000); // 1초의 지연으로 API 응답 시뮬레이션
  });
};

// 필드별 수정 가능 여부를 판단하는 함수
export const isFieldEditable = (status: string, fieldName: string): boolean => {
  // 배차대기 상태에서는 모든 필드 수정 가능
  if (status === '배차대기') {
    return true;
  }
  
  // 배차완료, 상차완료, 운송중 상태에서는 비고만 수정 가능
  if (['배차완료', '상차완료', '운송중'].includes(status)) {
    return fieldName === 'remark';
  }
  
  // 하차완료, 운송완료 상태에서는 모든 필드 수정 불가
  return false;
};

// 상태에 따른 UI 컬러 제공
export const getStatusColor = (status: string): string => {
  switch (status) {
    case '배차대기':
      return 'bg-blue-100 text-blue-800';
    case '배차완료':
      return 'bg-purple-100 text-purple-800';
    case '상차완료':
      return 'bg-indigo-100 text-indigo-800';
    case '운송중':
      return 'bg-amber-100 text-amber-800';
    case '하차완료':
      return 'bg-emerald-100 text-emerald-800';
    case '운송완료':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}; 