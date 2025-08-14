/**
 * 차주 등록 폼 유틸리티 함수들
 */

/**
 * 전화번호 자동 포맷팅
 * @param value 입력된 전화번호
 * @returns 포맷팅된 전화번호
 */
export const formatPhoneNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{4})(\d{4})$/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : cleaned;
};

/**
 * 차량번호 자동 포맷팅
 * @param value 입력된 차량번호
 * @returns 포맷팅된 차량번호
 */
export const formatVehicleNumber = (value: string): string => {
  const cleaned = value.replace(/\s/g, '');
  const match = cleaned.match(/^(\d{2})([가-힣])(\d{4})$/);
  return match ? `${match[1]}${match[2]}-${match[3]}` : cleaned;
};

/**
 * 사업자번호 자동 포맷팅
 * @param value 입력된 사업자번호
 * @returns 포맷팅된 사업자번호
 */
export const formatBusinessNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{2})(\d{5})$/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : cleaned;
};

/**
 * 계좌번호 자동 포맷팅
 * @param value 입력된 계좌번호
 * @returns 포맷팅된 계좌번호
 */
export const formatBankAccountNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 6) return cleaned;
  if (cleaned.length <= 10) return `${cleaned.slice(0, 6)}-${cleaned.slice(6)}`;
  return `${cleaned.slice(0, 6)}-${cleaned.slice(6, 10)}-${cleaned.slice(10)}`;
};

/**
 * 제조년도 옵션 생성
 * @returns 현재 연도부터 30년 전까지의 연도 배열
 */
export const getManufactureYearOptions = (): string[] => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 31 }, (_, i) => (currentYear - i).toString());
};

/**
 * 필수 필드 검증 로직
 * @param data 폼 데이터
 * @returns 필수 필드가 모두 입력되었는지 여부
 */
export const isRequiredFieldsValid = (data: {
  name?: string;
  phone?: string;
  vehicleNumber?: string;
  vehicleType?: string;
  tonnage?: string;
}): boolean => {
  return !!(
    data.name?.trim() &&
    data.phone?.trim() &&
    data.vehicleNumber?.trim() &&
    data.vehicleType?.trim() &&
    data.tonnage?.trim()
  );
};

/**
 * 은행 코드와 은행명 매핑
 */
export const BANK_CODES = [
  { code: '001', name: '한국은행' },
  { code: '002', name: '산업은행' },
  { code: '003', name: '기업은행' },
  { code: '004', name: '국민은행' },
  { code: '007', name: '수협은행' },
  { code: '008', name: '수출입은행' },
  { code: '011', name: '농협은행' },
  { code: '020', name: '우리은행' },
  { code: '023', name: 'SC제일은행' },
  { code: '027', name: '씨티은행' },
  { code: '031', name: '대구은행' },
  { code: '032', name: '부산은행' },
  { code: '034', name: '광주은행' },
  { code: '035', name: '제주은행' },
  { code: '037', name: '전북은행' },
  { code: '039', name: '경남은행' },
  { code: '045', name: '새마을금고중앙회' },
  { code: '048', name: '신협중앙회' },
  { code: '050', name: '상호저축은행' },
  { code: '071', name: '우체국' },
  { code: '081', name: '하나은행' },
  { code: '088', name: '신한은행' },
  { code: '089', name: '케이뱅크' },
  { code: '090', name: '카카오뱅크' },
  { code: '092', name: '토스뱅크' },
];

/**
 * 화물함 종류 옵션
 */
export const CARGO_BOX_TYPE_OPTIONS = [
  "일반", "파렛트", "철판", "스테인리스", "알루미늄", "기타"
];

/**
 * 화물함 길이 단위 옵션
 */
export const CARGO_BOX_LENGTH_UNITS = ["m", "ft"];

/**
 * 입력 필드 자동 포맷팅을 위한 이벤트 핸들러
 */
export const createFormatHandler = (formatFunction: (value: string) => string) => {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const formatted = formatFunction(value);
    e.target.value = formatted;
  };
}; 