// 중개 화물 상세 정보 목업 데이터
import { BrokerOrderStatusType, IBrokerOrderLog, BROKER_ORDER_STATUS, getBrokerProgressPercentage, isBrokerStatusAtLeast } from '@/types/broker-order';

// 중개 화물 상세 정보 인터페이스
export interface IBrokerOrderDetail {
  orderNumber: string;
  status: BrokerOrderStatusType;
  amount: string;
  registeredAt: string;
  statusProgress: BrokerOrderStatusType;
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
    remark?: string;
  };
  vehicle: {
    type: string;
    weight?: string;
    licensePlate?: string;
    driver?: {
      name: string;
      contact: string;
    };
  };
  logs: IBrokerOrderLog[];
}

// 목업 중개 화물 상세 데이터
export const mockBrokerOrderDetails: Record<string, IBrokerOrderDetail> = {
  "BRO-001001": {
    orderNumber: "BRO-001001",
    status: "배차대기",
    amount: "450,000",
    registeredAt: "2023-03-15 14:30",
    statusProgress: "배차대기",
    departure: {
      address: "서울특별시 강남구 테헤란로 152",
      detailedAddress: "강남파이낸스센터 3층",
      name: "김철수",
      company: "ABC물류",
      contact: "010-1234-5678",
      time: "09:00",
      date: "2023-03-20"
    },
    destination: {
      address: "부산광역시 해운대구 센텀중앙로 55",
      detailedAddress: "센텀시티 7층",
      name: "이영희",
      company: "XYZ상사",
      contact: "010-9876-5432",
      time: "16:00",
      date: "2023-03-20"
    },
    cargo: {
      type: "일반화물",
      options: ["직접운송", "착불"],
      weight: "1.5톤",
      remark: "깨지기 쉬운 물품 포함"
    },
    vehicle: {
      type: "카고",
      weight: "2.5톤"
    },
    logs: [
      {
        status: "배차대기",
        time: "14:30",
        date: "2023-03-15",
        handler: "시스템",
        remark: "화물 등록 완료"
      }
    ]
  },
  "BRO-001002": {
    orderNumber: "BRO-001002",
    status: "배차완료",
    amount: "550,000",
    registeredAt: "2023-03-16 10:15",
    statusProgress: "배차완료",
    departure: {
      address: "인천광역시 연수구 컨벤시아대로 165",
      detailedAddress: "송도컨벤시아 1층",
      name: "박지민",
      company: "송도물류센터",
      contact: "010-2345-6789",
      time: "08:30",
      date: "2023-03-21"
    },
    destination: {
      address: "대전광역시 유성구 엑스포로 107",
      detailedAddress: "대전컨벤션센터 2층",
      name: "최동욱",
      company: "대전유통",
      contact: "010-3456-7890",
      time: "15:30",
      date: "2023-03-21"
    },
    cargo: {
      type: "전자제품",
      options: ["직접운송", "선불"],
      weight: "2톤",
      remark: "충격에 주의"
    },
    vehicle: {
      type: "탑차",
      weight: "2.5톤",
      licensePlate: "12가 3456",
      driver: {
        name: "홍길동",
        contact: "010-5678-9012"
      }
    },
    logs: [
      {
        status: "배차대기",
        time: "10:15",
        date: "2023-03-16",
        handler: "시스템",
        remark: "화물 등록 완료"
      },
      {
        status: "배차완료",
        time: "14:20",
        date: "2023-03-16",
        handler: "김관리자",
        remark: "배차 완료"
      }
    ]
  },
  "BRO-001003": {
    orderNumber: "BRO-001003",
    status: "상차완료",
    amount: "650,000",
    registeredAt: "2023-03-17 09:45",
    statusProgress: "상차완료",
    departure: {
      address: "경기도 성남시 분당구 판교로 228",
      detailedAddress: "판교테크노밸리 3층",
      name: "정수민",
      company: "판교전자",
      contact: "010-4567-8901",
      time: "10:00",
      date: "2023-03-22"
    },
    destination: {
      address: "광주광역시 서구 상무중앙로 110",
      detailedAddress: "상무지구 5층",
      name: "강민준",
      company: "광주유통",
      contact: "010-5678-9012",
      time: "17:00",
      date: "2023-03-22"
    },
    cargo: {
      type: "가전제품",
      options: ["직접운송", "선불", "지게차하차"],
      weight: "3톤",
      remark: "냉장고 포함"
    },
    vehicle: {
      type: "윙바디",
      weight: "5톤",
      licensePlate: "34나 5678",
      driver: {
        name: "이운송",
        contact: "010-6789-0123"
      }
    },
    logs: [
      {
        status: "배차대기",
        time: "09:45",
        date: "2023-03-17",
        handler: "시스템",
        remark: "화물 등록 완료"
      },
      {
        status: "배차완료",
        time: "13:10",
        date: "2023-03-17",
        handler: "박관리자",
        remark: "배차 완료"
      },
      {
        status: "상차완료",
        time: "10:15",
        date: "2023-03-22",
        handler: "이운송",
        location: "경기도 성남시 분당구",
        remark: "상차 완료"
      }
    ]
  },
  "BRO-001004": {
    orderNumber: "BRO-001004",
    status: "운송중",
    amount: "750,000",
    registeredAt: "2023-03-18 11:30",
    statusProgress: "운송중",
    departure: {
      address: "대구광역시 동구 동대구로 489",
      detailedAddress: "대구무역회관 2층",
      name: "송지은",
      company: "대구물류",
      contact: "010-7890-1234",
      time: "09:30",
      date: "2023-03-23"
    },
    destination: {
      address: "울산광역시 남구 삼산로 282",
      detailedAddress: "울산상공회의소 1층",
      name: "임현우",
      company: "울산산업",
      contact: "010-8901-2345",
      time: "16:30",
      date: "2023-03-23"
    },
    cargo: {
      type: "기계부품",
      options: ["직접운송", "선불", "중량물"],
      weight: "4톤",
      remark: "정밀기계 포함"
    },
    vehicle: {
      type: "카고",
      weight: "5톤",
      licensePlate: "56다 7890",
      driver: {
        name: "박배송",
        contact: "010-9012-3456"
      }
    },
    logs: [
      {
        status: "배차대기",
        time: "11:30",
        date: "2023-03-18",
        handler: "시스템",
        remark: "화물 등록 완료"
      },
      {
        status: "배차완료",
        time: "15:45",
        date: "2023-03-18",
        handler: "최관리자",
        remark: "배차 완료"
      },
      {
        status: "상차완료",
        time: "09:50",
        date: "2023-03-23",
        handler: "박배송",
        location: "대구광역시 동구",
        remark: "상차 완료"
      },
      {
        status: "운송중",
        time: "10:15",
        date: "2023-03-23",
        handler: "박배송",
        location: "경부고속도로",
        remark: "운송 시작"
      }
    ]
  },
  "BRO-001005": {
    orderNumber: "BRO-001005",
    status: "하차완료",
    amount: "850,000",
    registeredAt: "2023-03-19 13:20",
    statusProgress: "하차완료",
    departure: {
      address: "강원도 원주시 시청로 1",
      detailedAddress: "원주시청 앞 물류센터",
      name: "한동훈",
      company: "강원물류",
      contact: "010-0123-4567",
      time: "08:00",
      date: "2023-03-24"
    },
    destination: {
      address: "충청북도 청주시 상당구 상당로 155",
      detailedAddress: "청주시청 옆 창고",
      name: "윤서연",
      company: "충북유통",
      contact: "010-1234-5678",
      time: "14:00",
      date: "2023-03-24"
    },
    cargo: {
      type: "식품류",
      options: ["직접운송", "선불", "냉장"],
      weight: "2톤",
      remark: "신선식품 포함"
    },
    vehicle: {
      type: "냉장",
      weight: "3.5톤",
      licensePlate: "78라 9012",
      driver: {
        name: "최운송",
        contact: "010-2345-6789"
      }
    },
    logs: [
      {
        status: "배차대기",
        time: "13:20",
        date: "2023-03-19",
        handler: "시스템",
        remark: "화물 등록 완료"
      },
      {
        status: "배차완료",
        time: "16:30",
        date: "2023-03-19",
        handler: "정관리자",
        remark: "배차 완료"
      },
      {
        status: "상차완료",
        time: "08:15",
        date: "2023-03-24",
        handler: "최운송",
        location: "강원도 원주시",
        remark: "상차 완료"
      },
      {
        status: "운송중",
        time: "08:30",
        date: "2023-03-24",
        handler: "최운송",
        location: "영동고속도로",
        remark: "운송 시작"
      },
      {
        status: "하차완료",
        time: "14:20",
        date: "2023-03-24",
        handler: "최운송",
        location: "충청북도 청주시",
        remark: "하차 완료"
      }
    ]
  },
  "BRO-001006": {
    orderNumber: "BRO-001006",
    status: "운송마감",
    amount: "950,000",
    registeredAt: "2023-03-20 15:10",
    statusProgress: "운송마감",
    departure: {
      address: "충청남도 천안시 동남구 충절로 17",
      detailedAddress: "천안물류단지 5번 창고",
      name: "이준호",
      company: "천안물류",
      contact: "010-3456-7890",
      time: "09:00",
      date: "2023-03-25"
    },
    destination: {
      address: "전라북도 전주시 완산구 풍남문4길 53",
      detailedAddress: "전주한옥마을 인근 창고",
      name: "김민지",
      company: "전북유통",
      contact: "010-4567-8901",
      time: "15:00",
      date: "2023-03-25"
    },
    cargo: {
      type: "건축자재",
      options: ["직접운송", "선불", "중량물"],
      weight: "8톤",
      remark: "철근 포함"
    },
    vehicle: {
      type: "카고",
      weight: "11톤",
      licensePlate: "90마 1234",
      driver: {
        name: "정화물",
        contact: "010-5678-9012"
      }
    },
    logs: [
      {
        status: "배차대기",
        time: "15:10",
        date: "2023-03-20",
        handler: "시스템",
        remark: "화물 등록 완료"
      },
      {
        status: "배차완료",
        time: "17:45",
        date: "2023-03-20",
        handler: "강관리자",
        remark: "배차 완료"
      },
      {
        status: "상차완료",
        time: "09:20",
        date: "2023-03-25",
        handler: "정화물",
        location: "충청남도 천안시",
        remark: "상차 완료"
      },
      {
        status: "운송중",
        time: "09:40",
        date: "2023-03-25",
        handler: "정화물",
        location: "호남고속도로",
        remark: "운송 시작"
      },
      {
        status: "하차완료",
        time: "15:30",
        date: "2023-03-25",
        handler: "정화물",
        location: "전라북도 전주시",
        remark: "하차 완료"
      },
      {
        status: "운송마감",
        time: "16:00",
        date: "2023-03-25",
        handler: "김관리자",
        remark: "운송 완료 확인"
      }
    ]
  }
};

// ID로 중개 화물 상세 정보 조회 함수
export const getBrokerOrderDetailById = (id: string): Promise<IBrokerOrderDetail> => {
  return new Promise((resolve, reject) => {
    // 지연 시간 (500ms ~ 1500ms)
    const delay = Math.floor(Math.random() * 1000) + 500;
    
    setTimeout(() => {
      // ID가 존재하는지 확인
      if (mockBrokerOrderDetails[id]) {
        resolve(mockBrokerOrderDetails[id]);
      } else {
        reject(new Error(`ID ${id}에 해당하는 중개 화물 정보를 찾을 수 없습니다.`));
      }
    }, delay);
  });
}; 