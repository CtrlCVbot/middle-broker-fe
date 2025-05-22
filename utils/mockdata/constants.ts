// 중개 화물 관리 시스템 상수 정의

// 차량 종류
export const BROKER_VEHICLE_TYPES = ['카고', '라보', '윙바디', '탑차', '냉동', '냉장'] as const;

// 차량 중량
export const BROKER_WEIGHT_TYPES = ['1톤', '1.4톤', '2.5톤', '3.5톤', '5톤', '11톤', '25톤'] as const;

// 결제 방법
export const PAYMENT_METHODS = ['인수증', '선불', '착불', '선착불'] as const;

// 상차/하차 방법
export const LOADING_METHODS = ['지게차', '수작업', '호이스트', '크레인', '컨베이어'] as const;

// 운송 옵션
export const TRANSPORT_OPTIONS = [
  { id: 'direct', label: '직접운송' },
  { id: 'cod', label: '착불' },
  { id: 'prepaid', label: '선불' },
  { id: 'forklift', label: '지게차하차' },
  { id: 'special', label: '특수화물' },
  { id: 'manual', label: '수작업' },
  { id: 'hoist', label: '호이스트' },
  { id: 'crane', label: '크레인' },
  { id: 'conveyor', label: '컨베이어' }
];

// 추가금 타입
export const ADDITIONAL_FEE_TYPES = [
  '대기',
  '경유',
  '수작업',
  '왕복',
  '톨비',
  '수수료',
  '현장착불'
] as const;

// 중개 화물 상태
export const BROKER_ORDER_STATUS = [
  '배차대기', 
  '배차완료', 
  '상차완료', 
  '운송중', 
  '하차완료', 
  '운송완료'
] as const;

// 콜센터 목록
export const CALL_CENTER_OPTIONS = [
  "24시",
  "화물맨",
  "오늘의화물",
  "화물25",
  "화물119",
  "직접입력"
] as const; 