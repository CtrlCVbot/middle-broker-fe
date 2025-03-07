// 화물 상태 로그 상태값 타입
export type OrderStatusType = 
  | '배차대기' 
  | '배차완료' 
  | '상차완료' 
  | '운송중' 
  | '하차완료' 
  | '정산완료';

// 로그 항목 인터페이스
export interface IOrderLog {
  status: OrderStatusType;
  time: string;
  date: string;
  handler?: string;
  location?: string;
  remark?: string;
}

// 화물 상세 정보 인터페이스
export interface IOrderDetail {
  orderNumber: string;
  status: OrderStatusType;
  amount: string;
  registeredAt: string;
  statusProgress: OrderStatusType;
  departure: {
    address: string;
    detailedAddress?: string;
    name: string;
    company: string;
    contact: string;
    time: string;
    date: string;
  };
  destination: {
    address: string;
    detailedAddress?: string;
    name: string;
    company: string;
    contact: string;
    time: string;
    date: string;
  };
  cargo: {
    type: string;
    options?: string[];
    weight?: string;
    specialRequirements?: string;
  };
  vehicle: {
    type: string;
    licensePlate?: string;
    driver?: {
      name: string;
      contact: string;
    };
  };
  logs: IOrderLog[];
}

// 목업 화물 상세 데이터
export const mockOrderDetails: Record<string, IOrderDetail> = {
  "202103150123": {
    orderNumber: "202103150123",
    status: "배차대기",
    amount: "114,000원",
    registeredAt: "2023-03-14 14:30",
    statusProgress: "배차대기",
    departure: {
      address: "경기도 성남시 중원구 은행동",
      detailedAddress: "물류센터 B동",
      name: "김성철",
      company: "성남물류(주)",
      contact: "010-9104-1200",
      time: "11:00",
      date: "2023-03-15"
    },
    destination: {
      address: "경기도 성남시 중원구 은행동",
      detailedAddress: "물류센터 C동",
      name: "박준석",
      company: "성남유통(주)",
      contact: "010-2222-3333",
      time: "15:00",
      date: "2023-03-15"
    },
    cargo: {
      type: "생활용품",
      options: ["충격주의"],
      weight: "2.5톤",
      specialRequirements: "지정장소 하차"
    },
    vehicle: {
      type: "2.5톤 카고",
      licensePlate: "",
      driver: {
        name: "",
        contact: ""
      }
    },
    logs: [
      {
        status: "배차대기",
        time: "14:30",
        date: "2023-03-14",
        handler: "시스템",
        remark: "화물 등록 완료"
      }
    ]
  },
  "202103150124": {
    orderNumber: "202103150124",
    status: "배차완료",
    amount: "370,000원",
    registeredAt: "2023-03-14 15:20",
    statusProgress: "배차완료",
    departure: {
      address: "서울특별시 강남구 역삼동",
      detailedAddress: "강남빌딩 지하 2층",
      name: "이준호",
      company: "강남물류(주)",
      contact: "010-2345-6789",
      time: "09:00",
      date: "2023-03-16"
    },
    destination: {
      address: "부산광역시 해운대구 우동",
      detailedAddress: "해운대센터 1층",
      name: "박정훈",
      company: "해운대물류(주)",
      contact: "010-8765-4321",
      time: "17:00",
      date: "2023-03-16"
    },
    cargo: {
      type: "전자제품",
      options: ["충격주의", "고가품"],
      weight: "5톤",
      specialRequirements: "인수자 서명 필수"
    },
    vehicle: {
      type: "5톤 윙바디",
      licensePlate: "34나 5678",
      driver: {
        name: "이준호",
        contact: "010-2345-6789"
      }
    },
    logs: [
      {
        status: "배차대기",
        time: "15:20",
        date: "2023-03-14",
        handler: "시스템",
        remark: "화물 등록 완료"
      },
      {
        status: "배차완료",
        time: "16:00",
        date: "2023-03-14",
        handler: "이준호",
        remark: "운송사 배차 완료"
      }
    ]
  },
  "202103150126": {
    orderNumber: "202103150126",
    status: "운송중",
    amount: "200,000원",
    registeredAt: "2023-03-15 08:10",
    statusProgress: "운송중",
    departure: {
      address: "대전광역시 유성구 궁동",
      detailedAddress: "대전물류단지 A-12",
      name: "정도현",
      company: "대전물류(주)",
      contact: "010-1122-3344",
      time: "07:00",
      date: "2023-03-16"
    },
    destination: {
      address: "광주광역시 북구 용봉동",
      detailedAddress: "광주센터 2층",
      name: "김광주",
      company: "광주배송(주)",
      contact: "010-5555-6666",
      time: "14:00",
      date: "2023-03-16"
    },
    cargo: {
      type: "냉동식품",
      options: ["냉동보관 필수", "시간엄수"],
      weight: "3.5톤",
      specialRequirements: "온도 -18도 유지"
    },
    vehicle: {
      type: "3.5톤 냉동",
      licensePlate: "56다 7890",
      driver: {
        name: "정도현",
        contact: "010-1122-3344"
      }
    },
    logs: [
      {
        status: "배차대기",
        time: "08:10",
        date: "2023-03-15",
        handler: "시스템",
        remark: "화물 등록 완료"
      },
      {
        status: "배차완료",
        time: "10:30",
        date: "2023-03-15",
        handler: "이관리",
        remark: "운송사 배차 완료"
      },
      {
        status: "상차완료",
        time: "07:20",
        date: "2023-03-16",
        handler: "정도현",
        location: "대전광역시 유성구",
        remark: "화물 상차 완료"
      },
      {
        status: "운송중",
        time: "08:00",
        date: "2023-03-16",
        handler: "정도현",
        location: "고속도로 이동 중",
        remark: "정상 운행 중"
      }
    ]
  }
};

// 특정 화물 ID로 상세 정보를 불러오는 함수
export const getOrderDetailById = (id: string): Promise<IOrderDetail> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const order = mockOrderDetails[id];
      if (order) {
        resolve(order);
      } else {
        reject(new Error('화물 정보를 찾을 수 없습니다.'));
      }
    }, 300); // 실제 API 호출 시뮬레이션을 위한 지연
  });
};

// 배차 상태 진행도를 계산하는 함수
export const getProgressPercentage = (currentStatus: OrderStatusType): number => {
  const statusOrder: OrderStatusType[] = [
    '배차대기', 
    '배차완료', 
    '상차완료', 
    '운송중', 
    '하차완료', 
    '정산완료'
  ];
  
  const currentIndex = statusOrder.indexOf(currentStatus);
  if (currentIndex === -1) return 0;
  
  return (currentIndex / (statusOrder.length - 1)) * 100;
};

// 배차 상태가 특정 상태 이상인지 확인하는 함수
export const isStatusAtLeast = (currentStatus: OrderStatusType, targetStatus: OrderStatusType): boolean => {
  const statusOrder: OrderStatusType[] = [
    '배차대기', 
    '배차완료', 
    '상차완료', 
    '운송중', 
    '하차완료', 
    '정산완료'
  ];
  
  const currentIndex = statusOrder.indexOf(currentStatus);
  const targetIndex = statusOrder.indexOf(targetStatus);
  
  return currentIndex >= targetIndex;
}; 