import { toast } from "sonner";
import { isObject } from "@/lib/utils";

interface IToastOptions {
  duration?: number;
  position?: "top-right" | "top-center" | "top-left" | "bottom-right" | "bottom-center" | "bottom-left";
  id?: string;
}

/**
 * 토스트 알림 유틸리티
 * - 일관된 사용자 피드백을 위한 토스트 알림 관리
 * - 서버 에러, 폼 에러, 일반 알림 등 다양한 케이스 처리
 */
export class ToastUtils {
  // 토스트 기본 옵션
  private static defaultOptions: IToastOptions = {
    duration: 5000,
    position: "bottom-right",
  };

  /**
   * 성공 알림
   */
  static success(title: string, description?: string, options?: IToastOptions): void {
    toast.success(title, {
      description: description,
      ...this.defaultOptions,
      ...options,
    });
  }

  /**
   * 에러 알림
   */
  static error(message: string, description?: string, options?: IToastOptions): void {
    toast.error(message, {
      description: description,
      ...this.defaultOptions,
      duration: 8000, // 에러는 좀 더 오래 보여줌
      ...options,
    });
  }

  /**
   * 경고 알림
   */
  static warning(message: string, description?: string, options?: IToastOptions): void {
    toast.warning(message, {
      description: description,
      ...this.defaultOptions,
      duration: 7000, // 경고는 좀 더 오래 보여줌
      ...options,
    });
  }

  /**
   * 정보 알림
   */
  static info(message: string, description?: string, options?: IToastOptions): void {
    toast.info(message, {
      description: description,
      ...this.defaultOptions,
      ...options,
    });
  }
  
  /**
   * API 에러 처리
   * @param error API 에러 객체
   * @param defaultMessage 기본 에러 메시지
   */
  static apiError(error: any, defaultMessage: string = "요청 처리 중 오류가 발생했습니다"): void {
    console.error("[ToastUtils] API 에러:", error);
    
    // 에러 객체 구조 확인
    if (!error) {
      this.error(defaultMessage);
      return;
    }
    
    // API 에러 구조 처리
    if (isObject(error) && 'message' in error) {
      // 상세 필드 에러가 있는 경우
      if ('details' in error && isObject(error.details) && Object.keys(error.details).length > 0) {
        this.formError("요청 처리 실패", error.details);
      } else {
        this.error(
          error.message as string || defaultMessage,
          error.path ? `경로: ${error.path}` : undefined
        );
      }
    } else if (typeof error === 'string') {
      this.error(error);
    } else {
      this.error(defaultMessage);
    }
  }
  
  /**
   * 폼 에러 처리
   * @param title 에러 제목
   * @param fieldErrors 필드별 에러 객체
   */
  static formError(title: string, fieldErrors?: Record<string, string[] | string>): void {
    // 필드 에러가 없는 경우
    if (!fieldErrors || Object.keys(fieldErrors).length === 0) {
      this.error(title);
      return;
    }
    
    // 첫 번째 에러 필드 및 메시지 추출
    const firstErrorField = Object.keys(fieldErrors)[0];
    const firstError = fieldErrors[firstErrorField];
    
    // 에러 메시지 포맷팅
    let errorMessage: string;
    if (Array.isArray(firstError)) {
      errorMessage = firstError[0] || `${firstErrorField} 필드에 오류가 있습니다`;
    } else {
      errorMessage = firstError || `${firstErrorField} 필드에 오류가 있습니다`;
    }
    
    // 여러 필드에 에러가 있는 경우 추가 안내
    const fieldCount = Object.keys(fieldErrors).length;
    const description = fieldCount > 1 
      ? `외 ${fieldCount - 1}개 필드에 오류가 있습니다`
      : undefined;
    
    this.error(title, `${errorMessage}${description ? ` (${description})` : ''}`);
  }
  
  /**
   * 로딩 상태 토스트 (프로미스 관련)
   * @param promise 처리할 프로미스
   * @param messages 각 상태별 메시지 객체
   * @param options 토스트 옵션
   */
  static promise<T>(
    promise: Promise<T>, 
    messages: { 
      loading: string; 
      success: string; 
      error: string; 
    },
    options?: IToastOptions
  ): Promise<T> {
    toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: (err) => {
        const errorMessage = err?.message || messages.error;
        return errorMessage;
      },
      ...this.defaultOptions,
      ...options,
    });
    
    return promise;
  }
  
  /**
   * 로딩 토스트 (커스텀 ID로 업데이트 가능)
   * @param message 로딩 메시지
   * @param id 토스트 ID
   */
  static loading(message: string, id?: string): string {
    const toastId = id || `loading-${Date.now()}`;
    toast.loading(message, { id: toastId });
    return toastId;
  }
  
  /**
   * 토스트 업데이트 (ID로 특정)
   * @param id 토스트 ID
   * @param message 새 메시지
   * @param type 토스트 타입
   */
  static update(
    id: string, 
    message: string, 
    type: "success" | "error" | "warning" | "info" | "default" = "default"
  ): void {
    toast.dismiss(id);
    
    switch (type) {
      case "success":
        toast.success(message, { id });
        break;
      case "error":
        toast.error(message, { id });
        break;
      case "warning":
        toast.warning(message, { id });
        break;
      case "info":
        toast.info(message, { id });
        break;
      default:
        toast(message, { id });
    }
  }
  
  /**
   * 토스트 닫기
   * @param id 토스트 ID
   */
  static dismiss(id?: string): void {
    if (id) {
      toast.dismiss(id);
    } else {
      toast.dismiss();
    }
  }
} 