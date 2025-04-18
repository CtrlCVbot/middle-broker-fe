import { IApiError } from './api-client';
import { toast } from '@/components/ui/use-toast';

/**
 * 토스트 유틸리티 - 사용자 피드백을 위한 토스트 메시지 표시
 */
export class ToastUtils {
  /**
   * 성공 토스트 표시
   */
  static success(title: string, description?: string) {
    toast({
      title,
      description,
      variant: 'default',
    });
  }

  /**
   * 에러 토스트 표시
   */
  static error(title: string, description?: string) {
    toast({
      title,
      description,
      variant: 'destructive',
    });
  }

  /**
   * API 에러 표시
   */
  static apiError(error: IApiError | Error | unknown, title?: string) {
    let errorTitle = title || '오류가 발생했습니다';
    let errorDescription = '';

    if (error instanceof Error) {
      errorDescription = error.message;
    } else if ((error as IApiError)?.message) {
      const apiError = error as IApiError;
      errorDescription = apiError.message;

      // 상태 코드에 따른 추가 메시지
      if (apiError.status === 401) {
        errorTitle = '인증 오류';
        errorDescription = '인증이 필요하거나 만료되었습니다. 다시 로그인해주세요.';
      } else if (apiError.status === 403) {
        errorTitle = '권한 오류';
        errorDescription = '해당 기능에 접근 권한이 없습니다.';
      } else if (apiError.status === 404) {
        errorTitle = '리소스 없음';
        errorDescription = '요청하신 데이터를 찾을 수 없습니다.';
      } else if (apiError.status === 500) {
        errorTitle = '서버 오류';
        errorDescription = '서버에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      }
    } else {
      errorDescription = '알 수 없는 오류가 발생했습니다.';
    }

    toast({
      title: errorTitle,
      description: errorDescription,
      variant: 'destructive',
    });
  }

  /**
   * 폼 에러 표시
   */
  static formError(error: IApiError | Error | unknown) {
    // API 에러에서 폼 필드별 오류 추출
    if ((error as IApiError)?.details) {
      const apiError = error as IApiError;
      const fieldErrors = apiError.details;
      
      // 첫 번째 필드 오류를 토스트로 표시
      if (fieldErrors && Object.keys(fieldErrors).length > 0) {
        const firstField = Object.keys(fieldErrors)[0];
        const firstError = fieldErrors[firstField][0];
        
        toast({
          title: '입력 오류',
          description: `${firstField}: ${firstError}`,
          variant: 'destructive',
        });
        
        return fieldErrors;
      }
    }
    
    // 일반 에러는 일반 API 에러로 표시
    this.apiError(error, '입력 오류');
    return null;
  }

  /**
   * 삭제 성공 토스트
   */
  static deleteSuccess(entityName: string, count: number = 1) {
    this.success(
      '삭제 완료',
      count > 1 ? `${count}개의 ${entityName}가 삭제되었습니다.` : `${entityName}가 삭제되었습니다.`
    );
  }

  /**
   * 저장 성공 토스트
   */
  static saveSuccess(entityName: string, isNew: boolean = false) {
    this.success(
      '저장 완료',
      isNew ? `새 ${entityName}가 등록되었습니다.` : `${entityName}가 수정되었습니다.`
    );
  }
} 