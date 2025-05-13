import { IOrderWithDispatchListResponse } from '@/types/order-with-dispatch';

/**
 * 주선사 배차 목록 Mock 데이터 생성 함수
 */
export function generateMockDispatchData(searchParams: URLSearchParams): IOrderWithDispatchListResponse {
  // 디버깅을 위한 로그 추가
  console.log('Mock 데이터 생성 함수 호출됨', Object.fromEntries(searchParams.entries()));
  
  // 페이지네이션 파라미터
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '10');
  const total = 15; // 전체 데이터 수
  const totalPages = Math.ceil(total / pageSize);
  
  // 샘플 데이터 생성
  const mockData = [];
  
  // 데이터 항목 10개 생성
  for (let i = 0; i < Math.min(pageSize, total - (page - 1) * pageSize); i++) {
    const id = `ORD${100000 + i + (page - 1) * pageSize}`;
    const dispatchId = `DISP${200000 + i + (page - 1) * pageSize}`;
    
    // 가상의 상차/하차 주소
    const pickupAddresses = ['서울시 강남구', '서울시 강동구', '경기도 성남시', '인천시 연수구', '부산시 해운대구'];
    const deliveryAddresses = ['경기도 파주시', '강원도 원주시', '충남 천안시', '전북 전주시', '대구시 동구'];
    
    // 가상의 차량 유형 및 무게
    const vehicleTypes = ['카고', '윙바디', '탑차', '냉장', '냉동'];
    const vehicleWeights = ['1톤', '2.5톤', '3.5톤', '5톤', '11톤'];
    
    // 배차 상태
    const statuses = ['배차대기', '배차완료', '상차완료', '운송중', '하차완료', '운송완료'];
    
    // 랜덤 값 생성
    const pickupIdx = Math.floor(Math.random() * pickupAddresses.length);
    const deliveryIdx = Math.floor(Math.random() * deliveryAddresses.length);
    const vehicleTypeIdx = Math.floor(Math.random() * vehicleTypes.length);
    const vehicleWeightIdx = Math.floor(Math.random() * vehicleWeights.length);
    const statusIdx = Math.floor(Math.random() * statuses.length);
    
    // 날짜 생성
    const today = new Date();
    const pickupDate = new Date(today);
    pickupDate.setDate(today.getDate() + Math.floor(Math.random() * 7));
    const deliveryDate = new Date(pickupDate);
    deliveryDate.setDate(pickupDate.getDate() + Math.floor(Math.random() * 3) + 1);
    
    // 금액 계산
    const estimatedAmount = Math.floor(Math.random() * 500000) + 500000;
    const freightCost = Math.floor(Math.random() * 100000) + estimatedAmount;
    
    mockData.push({
      order: {
        id: id,
        flowStatus: statuses[statusIdx],
        cargoName: `테스트 화물 ${i + 1}`,
        requestedVehicleType: vehicleTypes[vehicleTypeIdx],
        requestedVehicleWeight: vehicleWeights[vehicleWeightIdx],
        pickup: {
          name: `상차지 업체 ${i + 1}`,
          contactName: `상차지 담당자 ${i + 1}`,
          contactPhone: `010-1234-${1000 + i}`,
          address: {
            roadAddress: pickupAddresses[pickupIdx],
            jibunAddress: '',
            detailAddress: '123번지',
            metadata: {
              lat: 37.5 + Math.random() * 0.5,
              lng: 127 + Math.random() * 0.5
            }
          },
          date: pickupDate.toISOString().split('T')[0],
          time: `${10 + Math.floor(Math.random() * 8)}:00`,
        },
        delivery: {
          name: `하차지 업체 ${i + 1}`,
          contactName: `하차지 담당자 ${i + 1}`,
          contactPhone: `010-5678-${1000 + i}`,
          address: {
            roadAddress: deliveryAddresses[deliveryIdx],
            jibunAddress: '',
            detailAddress: '456번지',
            metadata: {
              lat: 36.5 + Math.random() * 0.5,
              lng: 128 + Math.random() * 0.5
            }
          },
          date: deliveryDate.toISOString().split('T')[0],
          time: `${10 + Math.floor(Math.random() * 8)}:00`,
        },
        estimatedPriceAmount: estimatedAmount,
        memo: `화물 메모 ${i + 1}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      dispatch: {
        id: dispatchId,
        brokerCompanyId: 'BROKER001',
        brokerCompanySnapshot: {
          name: '테스트 주선사',
          address: '서울시 강남구',
          phone: '02-123-4567',
        },
        assignedDriverId: `DRIVER${1000 + i}`,
        assignedDriverSnapshot: {
          name: `운전기사 ${i + 1}`,
          mobile: `010-9876-${1000 + i}`,
        },
        assignedDriverPhone: `010-9876-${1000 + i}`,
        assignedVehicleNumber: `12가 ${1234 + i}`,
        assignedVehicleType: vehicleTypes[vehicleTypeIdx],
        assignedVehicleWeight: vehicleWeights[vehicleWeightIdx],
        agreedFreightCost: freightCost,
        brokerMemo: `배차 메모 ${i + 1}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    });
  }
  
  // 데이터 생성 후 검증 로그 추가
  console.log('생성된 Mock 데이터 구조 확인:', {
    totalCount: mockData.length,
    hasDispatch: mockData.length > 0 && mockData.every(item => item.dispatch !== null),
  });
  
  // 최종 반환
  return {
    success: true,
    data: mockData,
    total: total,
    page: page,
    pageSize: pageSize,
    totalPages: totalPages,
  };
} 