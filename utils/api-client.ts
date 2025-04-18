import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export interface IApiError {
  status: number;
  message: string;
  details?: Record<string, string[]>;
  path?: string;
  timestamp?: string;
}

/**
 * API 클라이언트 유틸리티
 * - 표준화된 API 요청 및 응답 처리
 * - 에러 핸들링
 * - 인터셉터 설정
 */
class ApiClient {
  private instance: AxiosInstance;
  private baseConfig: AxiosRequestConfig = {
    baseURL: '/api',
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 30000, // 30초 타임아웃
  };

  constructor(config?: AxiosRequestConfig) {
    this.instance = axios.create({
      ...this.baseConfig,
      ...config,
    });

    this._initializeInterceptors();
  }

  /**
   * 요청 및 응답 인터셉터 초기화
   */
  private _initializeInterceptors() {
    // 요청 인터셉터
    this.instance.interceptors.request.use(
      (config) => {
        // 토큰이 필요한 경우 여기에 추가
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 응답 인터셉터
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        // 응답 데이터 추출
        return response.data;
      },
      (error: AxiosError) => {
        return this._handleApiError(error);
      }
    );
  }

  /**
   * API 에러 처리 메소드
   */
  private _handleApiError(error: AxiosError): Promise<never> {
    const apiError: IApiError = {
      status: error.response?.status || 500,
      message: '알 수 없는 오류가 발생했습니다.',
    };

    // 응답이 있는 경우 에러 정보 추출
    if (error.response) {
      const data = error.response.data as any;
      
      if (data) {
        apiError.message = data.message || data.error || '요청 처리 중 오류가 발생했습니다.';
        
        // 세부 오류 정보가 있는 경우 추가
        if (data.details || data.errors) {
          apiError.details = data.details || data.errors;
        }
        
        // 경로 및 시간 정보 추가
        if (data.path) apiError.path = data.path;
        if (data.timestamp) apiError.timestamp = data.timestamp;
      }
    } else if (error.request) {
      // 요청은 보냈으나 응답을 받지 못한 경우
      apiError.message = '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.';
    } else {
      // 요청 설정 중 오류가 발생한 경우
      apiError.message = error.message || '요청을 보내는 중 오류가 발생했습니다.';
    }

    // 에러 로깅 (개발 환경에서만)
    if (process.env.NODE_ENV === 'development') {
      console.error('[API ERROR]:', apiError);
      console.error(error);
    }

    return Promise.reject(apiError);
  }

  /**
   * GET 요청
   */
  public get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.get(url, config);
  }

  /**
   * POST 요청
   */
  public post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.post(url, data, config);
  }

  /**
   * PUT 요청
   */
  public put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.put(url, data, config);
  }

  /**
   * PATCH 요청
   */
  public patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.patch(url, data, config);
  }

  /**
   * DELETE 요청
   */
  public delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.delete(url, config);
  }
}

// 싱글톤 인스턴스 생성
const apiClient = new ApiClient();

export default apiClient; 