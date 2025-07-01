import { z } from 'zod';
import { ORDER_VEHICLE_TYPES, ORDER_VEHICLE_WEIGHTS } from '@/types/order';

// 주소 스냅샷 스키마
const addressSnapshotSchema = z.object({
  name: z.string().min(1, "상호명을 입력해주세요."),
  roadAddress: z.string().min(1, "도로명 주소를 입력해주세요."),
  jibunAddress: z.string().optional(),
  detailAddress: z.string().nullable().optional(),
  postalCode: z.string().nullable().optional(),
  metadata: z.object({
    lat: z.number().optional(),
    lng: z.number().optional(),
    originalInput: z.string().optional(),
    source: z.string().optional(),
    buildingName: z.string().optional(),
    floor: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }).optional(),
  contactName: z.string().nullable().optional(),
  contactPhone: z.string().nullable().optional(),
});

// 운송 옵션 스키마
const transportOptionsSchema = z.object({
  earlyDelivery: z.boolean().optional(),
  forkLiftLoad: z.boolean().optional(),
  forkliftUnload: z.boolean().optional(),
  exclusiveLoad: z.boolean().optional(),
  mixedLoad: z.boolean().optional(),
  payOnDelivery: z.boolean().optional(),
  duplicateLoad: z.boolean().optional(),
  specialLoad: z.boolean().optional(),
}).optional();

// 화물 등록 요청 스키마
export const createOrderSchema = z.object({
  // 화물 정보
  cargoName: z.string().min(2, "화물명은 최소 2자 이상이어야 합니다."),
  requestedVehicleType: z.enum(ORDER_VEHICLE_TYPES),
  requestedVehicleWeight: z.enum(ORDER_VEHICLE_WEIGHTS),
  memo: z.string().optional(),
  
  // 상차지 정보
  pickupAddressId: z.string().uuid().optional(),
  pickupAddressSnapshot: addressSnapshotSchema,
  pickupAddressDetail: z.string().optional(),
  pickupName: z.string().min(1, "상차지 이름을 입력해주세요."),
  pickupContactName: z.string().min(1, "담당자명을 입력해주세요."),
  pickupContactPhone: z.string().min(1, "담당자 전화번호를 입력해주세요."),
  pickupDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)"),
  pickupTime: z.string().regex(/^\d{2}:\d{2}$/, "시간 형식이 올바르지 않습니다. (HH:MM)"),
  
  // 하차지 정보
  deliveryAddressId: z.string().uuid().optional(),
  deliveryAddressSnapshot: addressSnapshotSchema,
  deliveryAddressDetail: z.string().optional(),
  deliveryName: z.string().min(1, "하차지 이름을 입력해주세요."),
  deliveryContactName: z.string().min(1, "담당자명을 입력해주세요."),
  deliveryContactPhone: z.string().min(1, "담당자 전화번호를 입력해주세요."),
  deliveryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)"),
  deliveryTime: z.string().regex(/^\d{2}:\d{2}$/, "시간 형식이 올바르지 않습니다. (HH:MM)"),
  
  // 운송 옵션
  transportOptions: transportOptionsSchema,
  
  // 가격 정보
  estimatedDistance: z.number().nonnegative().optional(),
  estimatedPriceAmount: z.number().nonnegative().optional(),
  priceType: z.enum(["기본", "계약"]),
  taxType: z.enum(["비과세", "과세"]),
  
  // 화주 회사 정보
  companyId: z.string().uuid(),
});

/**
 * 화물 등록 데이터의 유효성을 검증합니다.
 * @param data 검증할 데이터
 * @returns 검증 결과 (성공 또는 에러)
 */
export const validateOrderData = (data: any) => {
  return createOrderSchema.safeParse(data);
};

/**
 * 화물 등록 데이터의 유효성을 검증하고 에러 메시지를 반환합니다.
 * @param data 검증할 데이터
 * @returns 에러 메시지 객체 또는 null
 */
export const validateOrderDataWithErrors = (data: any) => {
  const result = validateOrderData(data);
  if (result.success) {
    return null;
  }
  
  // 에러 메시지 추출
  const errors: Record<string, string[]> = {};
  result.error.errors.forEach((err) => {
    const path = err.path.join('.');
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(err.message);
  });
  
  return errors;
}; 