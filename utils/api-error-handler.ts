import { toast } from "@/components/ui/use-toast";

/**
 * API 에러 처리 유틸리티
 * @param error 발생한 에러 객체
 * @param fallbackMessage 기본 에러 메시지
 * @returns 항상 null 반환하여 에러 이후 체인 종료
 */
export function handleApiError(error: any, fallbackMessage: string = '요청 처리 중 오류가 발생했습니다.') {
  console.error("API 에러:", error);
  
  let errorMessage = fallbackMessage;
  
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'object' && error !== null) {
    errorMessage = error.message || error.error || fallbackMessage;
  }
  
  // 토스트 알림 표시
  toast({
    variant: "destructive",
    title: "오류 발생",
    description: errorMessage
  });
  
  return null;
}

/**
 * API 응답에서 오류 메시지 추출
 * @param responseData API 응답 데이터
 * @param fallbackMessage 기본 에러 메시지
 * @returns 추출된 에러 메시지
 */
export function extractErrorMessage(responseData: any, fallbackMessage: string = '알 수 없는 오류가 발생했습니다.'): string {
  if (!responseData) return fallbackMessage;
  
  // 다양한 에러 형식 처리
  if (typeof responseData.message === 'string') {
    return responseData.message;
  }
  
  if (typeof responseData.error === 'string') {
    return responseData.error;
  }
  
  if (Array.isArray(responseData.errors) && responseData.errors.length > 0) {
    const firstError = responseData.errors[0];
    if (typeof firstError === 'string') {
      return firstError;
    }
    if (typeof firstError === 'object' && firstError.message) {
      return firstError.message;
    }
  }
  
  if (responseData.details && typeof responseData.details === 'object') {
    const messages = Object.values(responseData.details)
      .filter(value => typeof value === 'string')
      .join(', ');
    
    if (messages) {
      return messages;
    }
  }
  
  return fallbackMessage;
} 