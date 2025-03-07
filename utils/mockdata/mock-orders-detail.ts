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
    weight?: string;
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
      type: "카고",
      weight: "2.5톤",
      licensePlate: "",
      driver: {
        name: "김성철",
        contact: "010-9104-1200"
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
      type: "윙바디",
      weight: "5톤",
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
  "202103150125": {
    orderNumber: "202103150125",
    status: "상차완료",
    amount: "250,000원",
    registeredAt: "2023-03-14 16:45",
    statusProgress: "상차완료",
    departure: {
      address: "인천광역시 서구 청라동",
      detailedAddress: "청라물류센터",
      name: "박민수",
      company: "청라물류(주)",
      contact: "010-9876-5432",
      time: "13:30",
      date: "2023-03-15"
    },
    destination: {
      address: "대구광역시 동구 신천동",
      detailedAddress: "대구센터 3층",
      name: "이대구",
      company: "대구물류(주)",
      contact: "010-1234-5678",
      time: "10:00",
      date: "2023-03-16"
    },
    cargo: {
      type: "의류",
      options: ["습기주의", "충격주의"],
      weight: "3.5톤",
      specialRequirements: "냉방차량 필수"
    },
    vehicle: {
      type: "탑차",
      weight: "3.5톤",
      licensePlate: "67마 8901",
      driver: {
        name: "박민수",
        contact: "010-9876-5432"
      }
    },
    logs: [
      {
        status: "배차대기",
        time: "16:45",
        date: "2023-03-14",
        handler: "시스템",
        remark: "화물 등록 완료"
      },
      {
        status: "배차완료",
        time: "18:00",
        date: "2023-03-14",
        handler: "김물류",
        remark: "운송사 배차 완료"
      },
      {
        status: "상차완료",
        time: "13:45",
        date: "2023-03-15",
        handler: "박민수",
        location: "인천광역시 서구",
        remark: "화물 상차 완료"
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
      type: "냉동",
      weight: "3.5톤",
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
  },
  "202103150127": {
    orderNumber: "202103150127",
    status: "하차완료",
    amount: "180,000원",
    registeredAt: "2023-03-14 12:30",
    statusProgress: "하차완료",
    departure: {
      address: "울산광역시 남구 삼산동",
      detailedAddress: "울산물류센터 C동",
      name: "강지훈",
      company: "울산물류(주)",
      contact: "010-5566-7788",
      time: "10:00",
      date: "2023-03-15"
    },
    destination: {
      address: "경남 창원시 성산구 가음동",
      detailedAddress: "창원센터 1층",
      name: "이창원",
      company: "창원물류(주)",
      contact: "010-8877-6655",
      time: "18:00",
      date: "2023-03-15"
    },
    cargo: {
      type: "자동차부품",
      options: ["충격주의", "고중량"],
      weight: "2.5톤",
      specialRequirements: "하차 시 지게차 필요"
    },
    vehicle: {
      type: "탑차",
      weight: "2.5톤",
      licensePlate: "12거 3456",
      driver: {
        name: "강지훈",
        contact: "010-5566-7788"
      }
    },
    logs: [
      {
        status: "배차대기",
        time: "12:30",
        date: "2023-03-14",
        handler: "시스템",
        remark: "화물 등록 완료"
      },
      {
        status: "배차완료",
        time: "14:00",
        date: "2023-03-14",
        handler: "박관리",
        remark: "운송사 배차 완료"
      },
      {
        status: "상차완료",
        time: "10:15",
        date: "2023-03-15",
        handler: "강지훈",
        location: "울산광역시 남구",
        remark: "화물 상차 완료"
      },
      {
        status: "운송중",
        time: "11:00",
        date: "2023-03-15",
        handler: "강지훈",
        location: "고속도로 이동 중",
        remark: "정상 운행 중"
      },
      {
        status: "하차완료",
        time: "18:20",
        date: "2023-03-15",
        handler: "강지훈",
        location: "경남 창원시",
        remark: "화물 하차 완료"
      }
    ]
  },
  "202103150128": {
    orderNumber: "202103150128",
    status: "정산완료",
    amount: "220,000원",
    registeredAt: "2023-03-13 09:50",
    statusProgress: "정산완료",
    departure: {
      address: "경북 포항시 남구 오천읍",
      detailedAddress: "포항물류센터",
      name: "양세준",
      company: "포항물류(주)",
      contact: "010-3344-5566",
      time: "14:00",
      date: "2023-03-14"
    },
    destination: {
      address: "경북 구미시 원평동",
      detailedAddress: "구미센터 지하 1층",
      name: "임구미",
      company: "구미물류(주)",
      contact: "010-4455-6677",
      time: "01:00",
      date: "2023-03-15"
    },
    cargo: {
      type: "전자부품",
      options: ["고가품", "충격주의"],
      weight: "5톤",
      specialRequirements: "온도 상승 주의"
    },
    vehicle: {
      type: "윙바디",
      weight: "5톤",
      licensePlate: "89너 0123",
      driver: {
        name: "양세준",
        contact: "010-3344-5566"
      }
    },
    logs: [
      {
        status: "배차대기",
        time: "09:50",
        date: "2023-03-13",
        handler: "시스템",
        remark: "화물 등록 완료"
      },
      {
        status: "배차완료",
        time: "11:30",
        date: "2023-03-13",
        handler: "김관리",
        remark: "운송사 배차 완료"
      },
      {
        status: "상차완료",
        time: "14:15",
        date: "2023-03-14",
        handler: "양세준",
        location: "경북 포항시",
        remark: "화물 상차 완료"
      },
      {
        status: "운송중",
        time: "15:00",
        date: "2023-03-14",
        handler: "양세준",
        location: "경부고속도로",
        remark: "정상 운행 중"
      },
      {
        status: "하차완료",
        time: "01:30",
        date: "2023-03-15",
        handler: "양세준",
        location: "경북 구미시",
        remark: "화물 하차 완료"
      },
      {
        status: "정산완료",
        time: "14:00",
        date: "2023-03-15",
        handler: "이경리",
        remark: "운송비 정산 완료"
      }
    ]
  },
  "202103150129": {
    orderNumber: "202103150129",
    status: "배차대기",
    amount: "240,000원",
    registeredAt: "2023-03-15 14:15",
    statusProgress: "배차대기",
    departure: {
      address: "전북 전주시 완산구 효자동",
      detailedAddress: "전주물류센터",
      name: "박전주",
      company: "전주물류(주)",
      contact: "010-7788-9900",
      time: "08:00",
      date: "2023-03-17"
    },
    destination: {
      address: "전남 순천시 연향동",
      detailedAddress: "순천센터 A동",
      name: "최순천",
      company: "순천물류(주)",
      contact: "010-9900-1122",
      time: "16:00",
      date: "2023-03-17"
    },
    cargo: {
      type: "식품",
      options: ["시간엄수", "온도관리"],
      weight: "3.5톤",
      specialRequirements: "냉장 차량 필수"
    },
    vehicle: {
      type: "카고",
      weight: "3.5톤",
      licensePlate: "",
      driver: {
        name: "",
        contact: ""
      }
    },
    logs: [
      {
        status: "배차대기",
        time: "14:15",
        date: "2023-03-15",
        handler: "시스템",
        remark: "화물 등록 완료"
      }
    ]
  },
  "202103150130": {
    orderNumber: "202103150130",
    status: "배차대기",
    amount: "190,000원",
    registeredAt: "2023-03-15 10:25",
    statusProgress: "배차대기",
    departure: {
      address: "충북 청주시 상당구 용암동",
      detailedAddress: "청주물류센터",
      name: "이청주",
      company: "청주물류(주)",
      contact: "010-2233-4455",
      time: "09:30",
      date: "2023-03-17"
    },
    destination: {
      address: "충남 천안시 서북구 두정동",
      detailedAddress: "천안센터 B동",
      name: "김천안",
      company: "천안물류(주)",
      contact: "010-4455-6677",
      time: "15:30",
      date: "2023-03-17"
    },
    cargo: {
      type: "가구",
      options: ["충격주의", "습기주의"],
      weight: "2.5톤",
      specialRequirements: "하차 시 2인 필요"
    },
    vehicle: {
      type: "탑차",
      weight: "2.5톤",
      licensePlate: "",
      driver: {
        name: "",
        contact: ""
      }
    },
    logs: [
      {
        status: "배차대기",
        time: "10:25",
        date: "2023-03-15",
        handler: "시스템",
        remark: "화물 등록 완료"
      }
    ]
  },
  "202103150131": {
    orderNumber: "202103150131",
    status: "배차완료",
    amount: "230,000원",
    registeredAt: "2023-03-15 11:30",
    statusProgress: "배차완료",
    departure: {
      address: "강원 춘천시 후평동",
      detailedAddress: "춘천물류센터",
      name: "이태호",
      company: "춘천물류(주)",
      contact: "010-7788-9900",
      time: "11:00",
      date: "2023-03-16"
    },
    destination: {
      address: "서울특별시 송파구 문정동",
      detailedAddress: "송파센터 지하 2층",
      name: "한서울",
      company: "송파물류(주)",
      contact: "010-1122-3344",
      time: "19:00",
      date: "2023-03-16"
    },
    cargo: {
      type: "건축자재",
      options: ["중량물", "충격주의"],
      weight: "3.5톤",
      specialRequirements: "하차장비 필요"
    },
    vehicle: {
      type: "카고",
      weight: "3.5톤",
      licensePlate: "56바 7890",
      driver: {
        name: "이태호",
        contact: "010-7788-9900"
      }
    },
    logs: [
      {
        status: "배차대기",
        time: "11:30",
        date: "2023-03-15",
        handler: "시스템",
        remark: "화물 등록 완료"
      },
      {
        status: "배차완료",
        time: "14:00",
        date: "2023-03-15",
        handler: "박관리",
        remark: "운송사 배차 완료"
      }
    ]
  },
  "202103150132": {
    orderNumber: "202103150132",
    status: "운송중",
    amount: "150,000원",
    registeredAt: "2023-03-15 13:20",
    statusProgress: "운송중",
    departure: {
      address: "제주 제주시 노형동",
      detailedAddress: "제주물류센터",
      name: "김제주",
      company: "제주물류(주)",
      contact: "010-3344-5566",
      time: "16:00",
      date: "2023-03-15"
    },
    destination: {
      address: "제주 서귀포시 서홍동",
      detailedAddress: "서귀포센터",
      name: "이서귀",
      company: "서귀포물류(주)",
      contact: "010-5566-7788",
      time: "08:00",
      date: "2023-03-16"
    },
    cargo: {
      type: "농산물",
      options: ["신선도유지", "시간엄수"],
      weight: "1톤",
      specialRequirements: "냉장 운송"
    },
    vehicle: {
      type: "냉장",
      weight: "1톤",
      licensePlate: "12하 3456",
      driver: {
        name: "박제주",
        contact: "010-6677-8899"
      }
    },
    logs: [
      {
        status: "배차대기",
        time: "13:20",
        date: "2023-03-15",
        handler: "시스템",
        remark: "화물 등록 완료"
      },
      {
        status: "배차완료",
        time: "14:30",
        date: "2023-03-15",
        handler: "최관리",
        remark: "운송사 배차 완료"
      },
      {
        status: "상차완료",
        time: "16:15",
        date: "2023-03-15",
        handler: "박제주",
        location: "제주 제주시",
        remark: "화물 상차 완료"
      },
      {
        status: "운송중",
        time: "17:00",
        date: "2023-03-15",
        handler: "박제주",
        location: "제주 지방도",
        remark: "정상 운행 중"
      }
    ]
  },
  "202103150133": {
    orderNumber: "202103150133",
    status: "상차완료",
    amount: "170,000원",
    registeredAt: "2023-03-15 09:45",
    statusProgress: "상차완료",
    departure: {
      address: "경남 진주시 칠암동",
      detailedAddress: "진주물류센터",
      name: "박진주",
      company: "진주물류(주)",
      contact: "010-1122-3344",
      time: "10:00",
      date: "2023-03-16"
    },
    destination: {
      address: "부산광역시 금정구 장전동",
      detailedAddress: "부산센터 C동",
      name: "이부산",
      company: "부산물류(주)",
      contact: "010-5566-7788",
      time: "17:00",
      date: "2023-03-16"
    },
    cargo: {
      type: "섬유제품",
      options: ["습기주의", "충격주의"],
      weight: "2톤",
      specialRequirements: "포장 손상 주의"
    },
    vehicle: {
      type: "탑차",
      weight: "2.5톤",
      licensePlate: "89자 0123",
      driver: {
        name: "김진주",
        contact: "010-7788-9900"
      }
    },
    logs: [
      {
        status: "배차대기",
        time: "09:45",
        date: "2023-03-15",
        handler: "시스템",
        remark: "화물 등록 완료"
      },
      {
        status: "배차완료",
        time: "13:30",
        date: "2023-03-15",
        handler: "정관리",
        remark: "운송사 배차 완료"
      },
      {
        status: "상차완료",
        time: "10:20",
        date: "2023-03-16",
        handler: "김진주",
        location: "경남 진주시",
        remark: "화물 상차 완료"
      }
    ]
  },
  "202103150134": {
    orderNumber: "202103150134",
    status: "하차완료",
    amount: "210,000원",
    registeredAt: "2023-03-14 16:50",
    statusProgress: "하차완료",
    departure: {
      address: "경기도 수원시 팔달구 인계동",
      detailedAddress: "수원물류센터",
      name: "정수원",
      company: "수원물류(주)",
      contact: "010-8899-0011",
      time: "09:00",
      date: "2023-03-15"
    },
    destination: {
      address: "강원도 원주시 단구동",
      detailedAddress: "원주센터 1층",
      name: "김원주",
      company: "원주물류(주)",
      contact: "010-2233-4455",
      time: "15:30",
      date: "2023-03-15"
    },
    cargo: {
      type: "의약품",
      options: ["온도관리", "충격주의", "고가품"],
      weight: "1.5톤",
      specialRequirements: "15-25도 유지"
    },
    vehicle: {
      type: "탑차",
      weight: "2.5톤",
      licensePlate: "45다 6789",
      driver: {
        name: "이수원",
        contact: "010-3344-5566"
      }
    },
    logs: [
      {
        status: "배차대기",
        time: "16:50",
        date: "2023-03-14",
        handler: "시스템",
        remark: "화물 등록 완료"
      },
      {
        status: "배차완료",
        time: "18:30",
        date: "2023-03-14",
        handler: "한관리",
        remark: "운송사 배차 완료"
      },
      {
        status: "상차완료",
        time: "09:20",
        date: "2023-03-15",
        handler: "이수원",
        location: "경기도 수원시",
        remark: "화물 상차 완료"
      },
      {
        status: "운송중",
        time: "10:00",
        date: "2023-03-15",
        handler: "이수원",
        location: "영동고속도로",
        remark: "정상 운행 중"
      },
      {
        status: "하차완료",
        time: "15:45",
        date: "2023-03-15",
        handler: "이수원",
        location: "강원도 원주시",
        remark: "화물 하차 완료"
      }
    ]
  },
  "202103150135": {
    orderNumber: "202103150135",
    status: "정산완료",
    amount: "280,000원",
    registeredAt: "2023-03-13 11:20",
    statusProgress: "정산완료",
    departure: {
      address: "서울특별시 영등포구 여의도동",
      detailedAddress: "여의도물류센터",
      name: "박여의",
      company: "여의도물류(주)",
      contact: "010-5566-7788",
      time: "08:30",
      date: "2023-03-14"
    },
    destination: {
      address: "충북 청주시 흥덕구 오송읍",
      detailedAddress: "오송센터 B동",
      name: "김오송",
      company: "오송물류(주)",
      contact: "010-8899-0011",
      time: "14:00",
      date: "2023-03-14"
    },
    cargo: {
      type: "화학제품",
      options: ["위험물", "취급주의"],
      weight: "4톤",
      specialRequirements: "안전장비 필수"
    },
    vehicle: {
      type: "탑차",
      weight: "5톤",
      licensePlate: "67차 8901",
      driver: {
        name: "최여의",
        contact: "010-2233-4455"
      }
    },
    logs: [
      {
        status: "배차대기",
        time: "11:20",
        date: "2023-03-13",
        handler: "시스템",
        remark: "화물 등록 완료"
      },
      {
        status: "배차완료",
        time: "14:00",
        date: "2023-03-13",
        handler: "이관리",
        remark: "운송사 배차 완료"
      },
      {
        status: "상차완료",
        time: "08:45",
        date: "2023-03-14",
        handler: "최여의",
        location: "서울 영등포구",
        remark: "화물 상차 완료"
      },
      {
        status: "운송중",
        time: "09:15",
        date: "2023-03-14",
        handler: "최여의",
        location: "경부고속도로",
        remark: "정상 운행 중"
      },
      {
        status: "하차완료",
        time: "14:20",
        date: "2023-03-14",
        handler: "최여의",
        location: "충북 청주시",
        remark: "화물 하차 완료"
      },
      {
        status: "정산완료",
        time: "10:30",
        date: "2023-03-15",
        handler: "정경리",
        remark: "운송비 정산 완료"
      }
    ]
  },
  "202103150136": {
    orderNumber: "202103150136",
    status: "배차대기",
    amount: "185,000원",
    registeredAt: "2023-03-15 15:40",
    statusProgress: "배차대기",
    departure: {
      address: "경북 경산시 정평동",
      detailedAddress: "경산물류센터",
      name: "이경산",
      company: "경산물류(주)",
      contact: "010-3344-5566",
      time: "09:30",
      date: "2023-03-17"
    },
    destination: {
      address: "대구광역시 수성구 범어동",
      detailedAddress: "대구센터 2층",
      name: "박대구",
      company: "대구물류(주)",
      contact: "010-7788-9900",
      time: "13:00",
      date: "2023-03-17"
    },
    cargo: {
      type: "식료품",
      options: ["신선도유지", "온도관리"],
      weight: "2톤",
      specialRequirements: "냉장 운송"
    },
    vehicle: {
      type: "냉장",
      weight: "2.5톤",
      licensePlate: "",
      driver: {
        name: "",
        contact: ""
      }
    },
    logs: [
      {
        status: "배차대기",
        time: "15:40",
        date: "2023-03-15",
        handler: "시스템",
        remark: "화물 등록 완료"
      }
    ]
  },
  "202103150137": {
    orderNumber: "202103150137",
    status: "배차완료",
    amount: "195,000원",
    registeredAt: "2023-03-15 14:30",
    statusProgress: "배차완료",
    departure: {
      address: "인천광역시 남동구 논현동",
      detailedAddress: "남동물류센터",
      name: "김인천",
      company: "남동물류(주)",
      contact: "010-1122-3344",
      time: "08:00",
      date: "2023-03-16"
    },
    destination: {
      address: "서울특별시 강동구 천호동",
      detailedAddress: "강동센터 A동",
      name: "정강동",
      company: "강동물류(주)",
      contact: "010-5566-7788",
      time: "12:00",
      date: "2023-03-16"
    },
    cargo: {
      type: "사무용품",
      options: ["충격주의"],
      weight: "1.5톤",
      specialRequirements: "포장상태 유지"
    },
    vehicle: {
      type: "카고",
      weight: "2.5톤",
      licensePlate: "78거 9012",
      driver: {
        name: "정인천",
        contact: "010-9900-1122"
      }
    },
    logs: [
      {
        status: "배차대기",
        time: "14:30",
        date: "2023-03-15",
        handler: "시스템",
        remark: "화물 등록 완료"
      },
      {
        status: "배차완료",
        time: "16:45",
        date: "2023-03-15",
        handler: "최관리",
        remark: "운송사 배차 완료"
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