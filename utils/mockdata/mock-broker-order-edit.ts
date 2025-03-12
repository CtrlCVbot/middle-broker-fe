// 중개 화물 수정 관련 목업 데이터
import { IBrokerOrderRegisterData } from "@/types/broker-order";
import { IBrokerOrderDetail, mockBrokerOrderDetails } from "./mock-broker-orders-detail";

// 중개 화물 수정 함수
export const updateBrokerOrder = (
  orderId: string,
  data: IBrokerOrderRegisterData
): Promise<IBrokerOrderDetail> => {
  return new Promise((resolve, reject) => {
    // 지연 시간 (500ms ~ 1500ms)
    const delay = Math.floor(Math.random() * 1000) + 500;

    setTimeout(() => {
      try {
        // 해당 ID의 중개 화물이 존재하는지 확인
        if (!mockBrokerOrderDetails[orderId]) {
          throw new Error(`ID ${orderId}에 해당하는 중개 화물을 찾을 수 없습니다.`);
        }

        // 기존 중개 화물 정보 가져오기
        const existingOrder = { ...mockBrokerOrderDetails[orderId] };

        // 수정 가능한 필드인지 확인
        if (existingOrder.status === "운송마감") {
          throw new Error("운송마감 상태의 중개 화물은 수정할 수 없습니다.");
        }

        // 상태에 따라 수정 가능한 필드 제한
        if (["배차완료", "상차완료", "운송중", "하차완료"].includes(existingOrder.status)) {
          // 배차완료 이후 상태에서는 비고만 수정 가능
          existingOrder.cargo.remark = data.remark || existingOrder.cargo.remark;
        } else if (existingOrder.status === "배차대기") {
          // 배차대기 상태에서는 모든 필드 수정 가능
          
          // 차량 정보 업데이트
          existingOrder.vehicle.type = data.vehicleType;
          existingOrder.vehicle.weight = data.weightType;
          
          // 화물 정보 업데이트
          existingOrder.cargo.type = data.cargoType;
          existingOrder.cargo.remark = data.remark;
          existingOrder.cargo.options = data.selectedOptions;
          
          // 출발지 정보 업데이트
          existingOrder.departure = {
            address: data.departure.address,
            detailedAddress: data.departure.detailedAddress,
            name: data.departure.name,
            company: data.departure.company,
            contact: data.departure.contact,
            date: data.departure.date,
            time: data.departure.time
          };
          
          // 도착지 정보 업데이트
          existingOrder.destination = {
            address: data.destination.address,
            detailedAddress: data.destination.detailedAddress,
            name: data.destination.name,
            company: data.destination.company,
            contact: data.destination.contact,
            date: data.destination.date,
            time: data.destination.time
          };
          
          // 금액 업데이트
          if (data.estimatedAmount) {
            existingOrder.amount = data.estimatedAmount.toLocaleString();
          }
          
          // 로그 추가
          existingOrder.logs.push({
            status: existingOrder.status,
            time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
            date: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '-').replace(/\./g, ''),
            handler: "시스템",
            remark: "중개 화물 정보 수정"
          });
        }

        // 목업 데이터 업데이트
        mockBrokerOrderDetails[orderId] = existingOrder;

        // 성공 응답
        resolve(existingOrder);
      } catch (error) {
        // 에러 응답
        reject(error);
      }
    }, delay);
  });
}; 