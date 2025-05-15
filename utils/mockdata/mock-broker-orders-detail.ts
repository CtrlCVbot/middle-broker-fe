// 중개 화물 상세 정보 목업 데이터
import { BrokerOrderStatusType, IBrokerOrderLog, BROKER_ORDER_STATUS, getBrokerProgressPercentage, isBrokerStatusAtLeast } from '@/types/broker-order';

// 중개 화물 상세 정보 인터페이스
export interface IBrokerOrderDetail {
  orderNumber: string;
  status: BrokerOrderStatusType;
  amount: string;
  fee?: string;
  registeredAt: string;
  statusProgress: BrokerOrderStatusType;
  shipper: {
    name: string;
    manager: {
      name: string;
      contact: string;
      email: string;
    }
  };
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
    connection?: string;
    type: string;
    weight?: string;
    licensePlate?: string;
    driver?: {
      name: string;
      contact: string;
    };
  };
  logs: IBrokerOrderLog[];
  settlement?: {
    id?: string;
    status?: string;
  };
}

// 목업 중개 화물 상세 데이터
export const mockBrokerOrderDetails: Record<string, IBrokerOrderDetail> = {
  "BRO-001001": {
    orderNumber: "BRO-001001",
    status: "배차대기",
    amount: "450,000",
    fee: "45,000",
    registeredAt: "2023-03-15 14:30",
    statusProgress: "배차대기",
    shipper: {
      name: "ABC화주",
      manager: {
        name: "김철수",
        contact: "010-1234-5678",
        email: "kim@example.com"
      }
    },
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
    ],
    settlement: {
      status: "정산대기"
    }
  },
  "BRO-001002": {
    orderNumber: "BRO-001002",
    status: "배차완료",
    amount: "550,000",
    fee: "55,000",
    registeredAt: "2023-03-16 10:15",
    statusProgress: "배차완료",
    shipper: {
      name: "송도화주",
      manager: {
        name: "김철수",
        contact: "010-1234-5678",
        email: "kim@example.com"
      }
    },
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
      connection: "화물맨",
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
    ],
    settlement: {
      status: "정산대기"
    }
  },
  "BRO-001003": {
    orderNumber: "BRO-001003",
    status: "상차완료",
    amount: "650,000",
    fee: "65,000",
    registeredAt: "2023-03-17 09:45",
    statusProgress: "상차완료",
    shipper: {
      name: "판교화주",
      manager: {
        name: "김철수",
        contact: "010-1234-5678",
        email: "kim@example.com"
      }
    },
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
      connection: "화물맨",
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
    ],
    settlement: {
      status: "정산대기"
    }
  },
  "BRO-001004": {
    orderNumber: "BRO-001004",
    status: "운송중",
    amount: "750,000",
    fee: "75,000",
    registeredAt: "2023-03-18 11:30",
    statusProgress: "운송중",
    shipper: {
      name: "대구화주",
      manager: {
        name: "김철수",
        contact: "010-1234-5678",
        email: "kim@example.com"
      }
    },
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
      connection: "24시",
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
        time: "09:40",
        date: "2023-03-23",
        handler: "박배송",
        location: "대구광역시 동구",
        remark: "상차 완료"
      },
      {
        status: "운송중",
        time: "10:30",
        date: "2023-03-23",
        handler: "박배송",
        location: "경북 경산시",
        remark: "운송 시작"
      }
    ],
    settlement: {
      status: "정산대기"
    }
  },
  "BRO-001005": {
    orderNumber: "BRO-001005",
    status: "하차완료",
    amount: "850,000",
    fee: "85,000",
    registeredAt: "2023-03-19 13:20",
    statusProgress: "하차완료",
    shipper: {
      name: "광주화주",
      manager: {
        name: "김철수",
        contact: "010-1234-5678",
        email: "kim@example.com"
      }
    },
    departure: {
      address: "광주광역시 광산구 첨단과기로 123",
      detailedAddress: "광주과학기술원 1층",
      name: "윤하준",
      company: "광주첨단산업",
      contact: "010-0123-4567",
      time: "08:00",
      date: "2023-03-24"
    },
    destination: {
      address: "서울특별시 강서구 공항대로 376",
      detailedAddress: "김포공항 화물터미널 3층",
      name: "조현우",
      company: "서울항공물류",
      contact: "010-1234-5678",
      time: "17:00",
      date: "2023-03-24"
    },
    cargo: {
      type: "항공부품",
      options: ["직접운송", "선불", "특수화물"],
      weight: "3.5톤",
      remark: "항공부품 취급주의"
    },
    vehicle: {
      connection: "화물맨",
      type: "윙바디",
      weight: "5톤",
      licensePlate: "78라 9012",
      driver: {
        name: "정배달",
        contact: "010-0123-4567"
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
        handler: "양관리자",
        remark: "배차 완료"
      },
      {
        status: "상차완료",
        time: "08:15",
        date: "2023-03-24",
        handler: "정배달",
        location: "광주광역시 광산구",
        remark: "상차 완료"
      },
      {
        status: "운송중",
        time: "09:00",
        date: "2023-03-24",
        handler: "정배달",
        location: "광주광역시 북구",
        remark: "운송 시작"
      },
      {
        status: "하차완료",
        time: "17:30",
        date: "2023-03-24",
        handler: "정배달",
        location: "서울특별시 강서구",
        remark: "하차 완료"
      }
    ],
    settlement: {
      status: "정산대기"
    }
  },
  "BRO-001006": {
    orderNumber: "BRO-001006",
    status: "운송마감",
    amount: "950,000",
    fee: "95,000",
    registeredAt: "2023-03-20 15:10",
    statusProgress: "운송마감",
    shipper: {
      name: "부산화주",
      manager: {
        name: "김철수",
        contact: "010-1234-5678",
        email: "kim@example.com"
      }
    },
    departure: {
      address: "부산광역시 해운대구 APEC로 55",
      detailedAddress: "부산항 국제전시컨벤션센터 2층",
      name: "이서연",
      company: "부산물류센터",
      contact: "010-2345-6789",
      time: "09:30",
      date: "2023-03-25"
    },
    destination: {
      address: "서울특별시 송파구 올림픽로 300",
      detailedAddress: "롯데월드타워 12층",
      name: "김준호",
      company: "서울유통",
      contact: "010-3456-7890",
      time: "18:00",
      date: "2023-03-25"
    },
    cargo: {
      type: "의류",
      options: ["직접운송", "선불", "빠른배송"],
      weight: "2톤",
      remark: "고가의류 포함"
    },
    vehicle: {
      connection: "화물맨",
      type: "탑차",
      weight: "2.5톤",
      licensePlate: "90마 1234",
      driver: {
        name: "김택배",
        contact: "010-4567-8901"
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
        time: "17:25",
        date: "2023-03-20",
        handler: "이관리자",
        remark: "배차 완료"
      },
      {
        status: "상차완료",
        time: "09:40",
        date: "2023-03-25",
        handler: "김택배",
        location: "부산광역시 해운대구",
        remark: "상차 완료"
      },
      {
        status: "운송중",
        time: "10:15",
        date: "2023-03-25",
        handler: "김택배",
        location: "경남 김해시",
        remark: "운송 시작"
      },
      {
        status: "하차완료",
        time: "18:20",
        date: "2023-03-25",
        handler: "김택배",
        location: "서울특별시 송파구",
        remark: "하차 완료"
      },
      {
        status: "운송마감",
        time: "18:30",
        date: "2023-03-25",
        handler: "김택배",
        location: "서울특별시 송파구",
        remark: "운송 마감"
      }
    ],
    settlement: {
      id: "SET-001006",
      status: "정산완료"
    }
  },
  "BRO-001007": {
    orderNumber: "BRO-001007",
    status: "배차대기",
    amount: "500,000",
    fee: "50,000",
    registeredAt: "2023-03-21 09:30",
    statusProgress: "배차대기",
    shipper: {
      name: "대전화주",
      manager: {
        name: "김철수",
        contact: "010-1234-5678",
        email: "kim@example.com"
      }
    },
    departure: {
      address: "대전광역시 유성구 대학로 99",
      detailedAddress: "대전대학교 2층",
      name: "박민서",
      company: "대전과학산업",
      contact: "010-5678-9012",
      time: "10:00",
      date: "2023-03-26"
    },
    destination: {
      address: "강원도 춘천시 강원대학길 1",
      detailedAddress: "강원대학교 1층",
      name: "김지훈",
      company: "강원유통",
      contact: "010-6789-0123",
      time: "16:00",
      date: "2023-03-26"
    },
    cargo: {
      type: "실험장비",
      options: ["직접운송", "선불", "특수화물"],
      weight: "2톤",
      remark: "정밀실험장비 취급주의"
    },
    vehicle: {
      connection: "화물맨",
      type: "탑차",
      weight: "2.5톤"
    },
    logs: [
      {
        status: "배차대기",
        time: "09:30",
        date: "2023-03-21",
        handler: "시스템",
        remark: "화물 등록 완료"
      }
    ],
    settlement: {
      status: "정산대기"
    }
  },
  "BRO-001008": {
    orderNumber: "BRO-001008",
    status: "배차완료",
    amount: "600,000",
    fee: "60,000",
    registeredAt: "2023-03-22 11:40",
    statusProgress: "배차완료",
    shipper: {
      name: "수원화주",
      manager: {
        name: "김철수",
        contact: "010-1234-5678",
        email: "kim@example.com"
      }
    },
    departure: {
      address: "경기도 수원시 영통구 광교중앙로 145",
      detailedAddress: "광교테크노밸리 3층",
      name: "최예준",
      company: "수원테크",
      contact: "010-7890-1234",
      time: "09:00",
      date: "2023-03-27"
    },
    destination: {
      address: "전라북도 전주시 덕진구 백제대로 567",
      detailedAddress: "전북대학교 1층",
      name: "손현진",
      company: "전주물류",
      contact: "010-8901-2345",
      time: "17:00",
      date: "2023-03-27"
    },
    cargo: {
      type: "식품",
      options: ["직접운송", "선불", "빠른배송"],
      weight: "1.5톤",
      remark: "냉장 식품"
    },
    vehicle: {
      connection: "화물맨",
      type: "냉장",
      weight: "2.5톤",
      licensePlate: "12바 3456",
      driver: {
        name: "박냉동",
        contact: "010-9012-3456"
      }
    },
    logs: [
      {
        status: "배차대기",
        time: "11:40",
        date: "2023-03-22",
        handler: "시스템",
        remark: "화물 등록 완료"
      },
      {
        status: "배차완료",
        time: "15:50",
        date: "2023-03-22",
        handler: "정관리자",
        remark: "배차 완료"
      }
    ],
    settlement: {
      status: "정산대기"
    }
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
        // 존재하지 않는 ID일 경우 기본 데이터 반환 (오류 발생 대신)
        console.warn(`ID ${id}에 해당하는 중개 화물 정보를 찾을 수 없습니다. 기본 데이터를 반환합니다.`);
        
        // 목록의 첫 번째 항목을 대체 데이터로 사용 (객체의 첫 번째 키를 가져옴)
        const firstId = Object.keys(mockBrokerOrderDetails)[2];
        const defaultData = {...mockBrokerOrderDetails[firstId]};
        
        // 조회된 ID로 orderNumber 값 변경
        defaultData.orderNumber = id;
        
        resolve(defaultData);
      }
    }, delay);
  });
}; 