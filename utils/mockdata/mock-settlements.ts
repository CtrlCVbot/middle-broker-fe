import { ISettlement, ISettlementChartData, SettlementStatus } from "@/types/settlement";

// 정산 목업 데이터
export const mockSettlements: ISettlement[] = [
  {
    id: "S001",
    companyName: "현대물류",
    startDate: "2023-01-01",
    endDate: "2023-01-31",
    status: "COMPLETED",
    totalAmount: 12500000,
    requestDate: "2023-02-01",
    completedDate: "2023-02-05",
    items: [
      {
        id: "SI001",
        orderId: "ORD001",
        orderDate: "2023-01-05",
        transportFee: 2300000,
        additionalFee: 200000,
        discount: 100000,
        tax: 230000,
        totalAmount: 2630000,
        driverName: "김운송",
        vehicleNumber: "서울 12가 3456"
      },
      {
        id: "SI002",
        orderId: "ORD002",
        orderDate: "2023-01-12",
        transportFee: 3500000,
        additionalFee: 350000,
        discount: 0,
        tax: 350000,
        totalAmount: 4200000,
        driverName: "이화물",
        vehicleNumber: "경기 34나 5678"
      },
      {
        id: "SI003",
        orderId: "ORD005",
        orderDate: "2023-01-20",
        transportFee: 4800000,
        additionalFee: 400000,
        discount: 200000,
        tax: 480000,
        totalAmount: 5480000,
        driverName: "박배송",
        vehicleNumber: "인천 56다 7890"
      }
    ]
  },
  {
    id: "S002",
    companyName: "삼성물류",
    startDate: "2023-02-01",
    endDate: "2023-02-28",
    status: "COMPLETED",
    totalAmount: 18750000,
    requestDate: "2023-03-01",
    completedDate: "2023-03-07",
    items: [
      {
        id: "SI004",
        orderId: "ORD008",
        orderDate: "2023-02-03",
        transportFee: 5200000,
        additionalFee: 500000,
        discount: 300000,
        tax: 520000,
        totalAmount: 5920000,
        driverName: "최속도",
        vehicleNumber: "서울 78라 1234"
      },
      {
        id: "SI005",
        orderId: "ORD010",
        orderDate: "2023-02-11",
        transportFee: 6500000,
        additionalFee: 600000,
        discount: 0,
        tax: 650000,
        totalAmount: 7750000,
        driverName: "정빠름",
        vehicleNumber: "경기 90마 2345"
      },
      {
        id: "SI006",
        orderId: "ORD015",
        orderDate: "2023-02-22",
        transportFee: 4300000,
        additionalFee: 350000,
        discount: 200000,
        tax: 430000,
        totalAmount: 4880000,
        driverName: "김운송",
        vehicleNumber: "서울 12가 3456"
      }
    ]
  },
  {
    id: "S003",
    companyName: "LG 로지스틱스",
    startDate: "2023-03-01",
    endDate: "2023-03-31",
    status: "COMPLETED",
    totalAmount: 16350000,
    requestDate: "2023-04-01",
    completedDate: "2023-04-05",
    items: [
      {
        id: "SI007",
        orderId: "ORD018",
        orderDate: "2023-03-08",
        transportFee: 3800000,
        additionalFee: 300000,
        discount: 100000,
        tax: 380000,
        totalAmount: 4380000,
        driverName: "이화물",
        vehicleNumber: "경기 34나 5678"
      },
      {
        id: "SI008",
        orderId: "ORD020",
        orderDate: "2023-03-17",
        transportFee: 5100000,
        additionalFee: 450000,
        discount: 0,
        tax: 510000,
        totalAmount: 6060000,
        driverName: "박배송",
        vehicleNumber: "인천 56다 7890"
      },
      {
        id: "SI009",
        orderId: "ORD023",
        orderDate: "2023-03-25",
        transportFee: 5100000,
        additionalFee: 300000,
        discount: 150000,
        tax: 510000,
        totalAmount: 5760000,
        driverName: "최속도",
        vehicleNumber: "서울 78라 1234"
      }
    ]
  },
  {
    id: "S004",
    companyName: "포스코 물류",
    startDate: "2023-04-01",
    endDate: "2023-04-30",
    status: "COMPLETED",
    totalAmount: 21500000,
    requestDate: "2023-05-02",
    completedDate: "2023-05-10",
    items: [
      {
        id: "SI010",
        orderId: "ORD028",
        orderDate: "2023-04-05",
        transportFee: 7200000,
        additionalFee: 700000,
        discount: 200000,
        tax: 720000,
        totalAmount: 8420000,
        driverName: "정빠름",
        vehicleNumber: "경기 90마 2345"
      },
      {
        id: "SI011",
        orderId: "ORD030",
        orderDate: "2023-04-15",
        transportFee: 6500000,
        additionalFee: 500000,
        discount: 0,
        tax: 650000,
        totalAmount: 7650000,
        driverName: "김운송",
        vehicleNumber: "서울 12가 3456"
      },
      {
        id: "SI012",
        orderId: "ORD032",
        orderDate: "2023-04-25",
        transportFee: 4800000,
        additionalFee: 300000,
        discount: 250000,
        tax: 480000,
        totalAmount: 5330000,
        driverName: "이화물",
        vehicleNumber: "경기 34나 5678"
      }
    ]
  },
  {
    id: "S005",
    companyName: "CJ 대한통운",
    startDate: "2023-05-01",
    endDate: "2023-05-31",
    status: "PENDING",
    totalAmount: 19800000,
    requestDate: "2023-06-01",
    items: [
      {
        id: "SI013",
        orderId: "ORD035",
        orderDate: "2023-05-03",
        transportFee: 5500000,
        additionalFee: 400000,
        discount: 300000,
        tax: 550000,
        totalAmount: 6150000,
        driverName: "박배송",
        vehicleNumber: "인천 56다 7890"
      },
      {
        id: "SI014",
        orderId: "ORD038",
        orderDate: "2023-05-12",
        transportFee: 7300000,
        additionalFee: 650000,
        discount: 0,
        tax: 730000,
        totalAmount: 8680000,
        driverName: "최속도",
        vehicleNumber: "서울 78라 1234"
      },
      {
        id: "SI015",
        orderId: "ORD042",
        orderDate: "2023-05-22",
        transportFee: 4200000,
        additionalFee: 300000,
        discount: 150000,
        tax: 420000,
        totalAmount: 4770000,
        driverName: "정빠름",
        vehicleNumber: "경기 90마 2345"
      }
    ]
  },
  {
    id: "S006",
    companyName: "한진",
    startDate: "2023-06-01",
    endDate: "2023-06-30",
    status: "PENDING",
    totalAmount: 23500000,
    requestDate: "2023-07-02",
    items: [
      {
        id: "SI016",
        orderId: "ORD045",
        orderDate: "2023-06-08",
        transportFee: 8200000,
        additionalFee: 750000,
        discount: 400000,
        tax: 820000,
        totalAmount: 9370000,
        driverName: "김운송",
        vehicleNumber: "서울 12가 3456"
      },
      {
        id: "SI017",
        orderId: "ORD048",
        orderDate: "2023-06-18",
        transportFee: 7200000,
        additionalFee: 600000,
        discount: 0,
        tax: 720000,
        totalAmount: 8520000,
        driverName: "이화물",
        vehicleNumber: "경기 34나 5678"
      },
      {
        id: "SI018",
        orderId: "ORD052",
        orderDate: "2023-06-28",
        transportFee: 4800000,
        additionalFee: 350000,
        discount: 200000,
        tax: 480000,
        totalAmount: 5430000,
        driverName: "박배송",
        vehicleNumber: "인천 56다 7890"
      }
    ]
  }
];

// 정산 차트 목업 데이터
export const mockSettlementChartData: ISettlementChartData = {
  monthlyTrend: [
    { month: "1월", completed: 12500000, pending: 0 },
    { month: "2월", completed: 18750000, pending: 0 },
    { month: "3월", completed: 16350000, pending: 0 },
    { month: "4월", completed: 21500000, pending: 0 },
    { month: "5월", completed: 0, pending: 19800000 },
    { month: "6월", completed: 0, pending: 23500000 }
  ],
  companyDistribution: [
    { companyName: "현대물류", amount: 12500000 },
    { companyName: "삼성물류", amount: 18750000 },
    { companyName: "LG 로지스틱스", amount: 16350000 },
    { companyName: "포스코 물류", amount: 21500000 },
    { companyName: "CJ 대한통운", amount: 19800000 },
    { companyName: "한진", amount: 23500000 }
  ],
  driverContribution: [
    { driverName: "김운송", amount: 24350000 },
    { driverName: "이화물", amount: 22290000 },
    { driverName: "박배송", amount: 16590000 },
    { driverName: "최속도", amount: 18760000 },
    { driverName: "정빠름", amount: 22400000 }
  ],
  statusDistribution: [
    { status: "완료", count: 4 },
    { status: "미완료", count: 2 }
  ]
};

// 목업 데이터 조회 함수
export const fetchMockSettlements = async (): Promise<ISettlement[]> => {
  // 실제 API 요청을 시뮬레이션하기 위한 지연
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockSettlements;
};

// 특정 정산 데이터 조회 함수
export const fetchMockSettlementById = async (id: string): Promise<ISettlement | null> => {
  // 실제 API 요청을 시뮬레이션하기 위한 지연
  await new Promise(resolve => setTimeout(resolve, 500));
  const settlement = mockSettlements.find(s => s.id === id);
  return settlement || null;
};

// 목업 차트 데이터 조회 함수
export const fetchMockSettlementChartData = async (): Promise<ISettlementChartData> => {
  // 실제 API 요청을 시뮬레이션하기 위한 지연
  await new Promise(resolve => setTimeout(resolve, 1000));
  return mockSettlementChartData;
};

// 정산 상태 업데이트 함수
export const updateMockSettlementStatus = async (id: string, status: SettlementStatus): Promise<ISettlement | null> => {
  // 실제 API 요청을 시뮬레이션하기 위한 지연
  await new Promise(resolve => setTimeout(resolve, 700));
  
  const settlementIndex = mockSettlements.findIndex(s => s.id === id);
  if (settlementIndex === -1) return null;
  
  // 상태 업데이트
  const updatedSettlement = {
    ...mockSettlements[settlementIndex],
    status,
    completedDate: status === "COMPLETED" ? new Date().toISOString().split('T')[0] : undefined
  };
  
  // 목업 데이터 업데이트 (실제로는 수정되지 않음, 실제 API에서는 DB 업데이트 필요)
  // mockSettlements[settlementIndex] = updatedSettlement;
  
  return updatedSettlement;
}; 