import { toast } from "@/components/ui/use-toast";
import { IApiError } from "@/utils/api-client";
import { ICreateOrderResponse } from "@/services/order-service";

/**
 * API 에러 핸들링 함수
 * @param error API 호출 중 발생한
 * @param defaultMessage 기본 에러 메시지
 */
export const handleApiError = (error: IApiError | any, defaultMessage: string = "요청 처리 중 오류가 발생했습니다.") => {
  // API 에러 메시지가 있으면 그대로 표시
  if ((error as IApiError)?.message) {
    toast({
      title: "오류",
      description: (error as IApiError).message,
      variant: "destructive",
    });
    return;
  }

  // 그 외 일반 에러
  toast({
    title: "오류",
    description: defaultMessage,
    variant: "destructive",
  });
};

/**
 * 화물 등록 성공 처리 함수
 * @param response API 응답 데이터
 */
export const handleOrderRegisterSuccess = (response: ICreateOrderResponse) => {
  toast({
    title: "화물 등록 완료",
    description: `화물이 성공적으로 등록되었습니다.`,
    variant: "default",
  });
  
  return response;
};

/**
 * 폼 유효성 검증 에러 표시 함수
 * @param message 에러 메시지
 */
export const showValidationError = (message: string) => {
  toast({
    title: "유효성 검증 오류",
    description: message,
    variant: "destructive",
  });
};

/**
 * 폼 데이터 유효성 검증 함수
 * @param formData 폼 데이터
 * @returns 유효성 검증 통과 여부
 */
export const validateOrderFormData = (formData: any): boolean => {
  // 화물 품목 검증
  if (!formData.cargoType || formData.cargoType.trim().length < 2) {
    showValidationError("화물 품목은 최소 2자 이상 입력해야 합니다.");
    return false;
  }

  // 상차지 정보 검증
  const departure = formData.departure;
  if (!departure.address) {
    showValidationError("상차지 주소를 입력해주세요.");
    return false;
  }
  if (!departure.company) {
    showValidationError("상차지 회사명을 입력해주세요.");
    return false;
  }
  if (!departure.name) {
    showValidationError("상차지 담당자명을 입력해주세요.");
    return false;
  }
  if (!departure.contact) {
    showValidationError("상차지 연락처를 입력해주세요.");
    return false;
  }
  if (!departure.date) {
    showValidationError("상차 날짜를 선택해주세요.");
    return false;
  }
  if (!departure.time) {
    showValidationError("상차 시간을 선택해주세요.");
    return false;
  }

  // 하차지 정보 검증
  const destination = formData.destination;
  if (!destination.address) {
    showValidationError("하차지 주소를 입력해주세요.");
    return false;
  }
  if (!destination.company) {
    showValidationError("하차지 회사명을 입력해주세요.");
    return false;
  }
  if (!destination.name) {
    showValidationError("하차지 담당자명을 입력해주세요.");
    return false;
  }
  if (!destination.contact) {
    showValidationError("하차지 연락처를 입력해주세요.");
    return false;
  }
  if (!destination.date) {
    showValidationError("하차 날짜를 선택해주세요.");
    return false;
  }
  if (!destination.time) {
    showValidationError("하차 시간을 선택해주세요.");
    return false;
  }

  // 날짜 유효성 검증 (상차일이 하차일보다 이후인 경우)
  const pickupDate = new Date(`${departure.date}T${departure.time || '00:00'}`);
  const deliveryDate = new Date(`${destination.date}T${destination.time || '00:00'}`);
  
  if (pickupDate > deliveryDate) {
    showValidationError("상차일은 하차일보다 이전이어야 합니다.");
    return false;
  }

  return true;
}; 