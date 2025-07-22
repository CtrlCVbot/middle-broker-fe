// 중개 화물 상세 정보 목업 데이터
import { BrokerOrderStatusType, IBrokerOrderLog, BROKER_ORDER_STATUS, getBrokerProgressPercentage, isBrokerStatusAtLeast } from '@/types/broker-order';

// 중개 화물 상세 정보 인터페이스
export interface IBrokerOrderDetail {
  orderNumber: string;
  dispatchId?: string;
  status: BrokerOrderStatusType;
  amount: string;
  fee?: string;
  registeredAt: string;
  statusProgress: BrokerOrderStatusType;
  shipper: {
    id: string;
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
    name?: string;
    remark?: string;
  };
  vehicle: {
    id?: string;
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
    dispatchId: "DIS-001001",
    status: "배차대기",
    amount: "450,000",
    fee: "45,000",
    registeredAt: "2023-03-15 14:30",
    statusProgress: "배차대기",
    shipper: {
      id: "1",
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
    dispatchId: "DIS-001002",
    status: "배차완료",
    amount: "550,000",
    fee: "55,000",
    registeredAt: "2023-03-16 10:15",
    statusProgress: "배차완료",
    shipper: {
      id: "2",
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
    dispatchId: "DIS-001003",
    status: "상차완료",
    amount: "650,000",
    fee: "65,000",
    registeredAt: "2023-03-17 09:45",
    statusProgress: "상차완료",
    shipper: {
      id: "3",
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
        const firstId = Object.keys(mockBrokerOrderDetails)[0];
        const defaultData = {...mockBrokerOrderDetails[firstId]};
        
        // 조회된 ID로 orderNumber 값 변경
        defaultData.orderNumber = id;
        
        resolve(defaultData);
      }
    }, delay);
  });
}; 