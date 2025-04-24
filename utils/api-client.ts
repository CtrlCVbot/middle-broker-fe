import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '@/store/auth-store';
import { refreshAccessToken, getCurrentUser } from '@/utils/auth';
import { encodeBase64String, decodeBase64String } from '@/utils/format';

export interface IApiError {
  status: number;
  message: string;
  details?: Record<string, string[]>;
  path?: string;
  timestamp?: string;
  code?: string;
  errors?: Record<string, string[]>;
}

interface CacheItem {
  data: any;
  timestamp: number;
  expiresAt: number;
}

/**
 * API 클라이언트 유틸리티
 * - 표준화된 API 요청 및 응답 처리
 * - 에러 핸들링
 * - 인터셉터 설정
 * - 요청 캐싱
 * - 중복 요청 방지
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
  
  // 요청 캐싱을 위한 맵
  private cache: Map<string, CacheItem> = new Map();
  
  // 진행 중인 요청 추적
  private pendingRequests: Map<string, Promise<any>> = new Map();
  
  // 캐시 기본 만료 시간 (10분)
  private defaultCacheLifetime: number = 10 * 60 * 1000;

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
        // 인증 토큰 추가
        const token = useAuthStore.getState().token;
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }

        // 현재 로그인된 사용자 정보 가져오기
        const currentUser = getCurrentUser();
        
        // 사용자 정보가 있으면 헤더에 추가 (UTF-8 문자 이슈 해결을 위해 Base64 인코딩 적용)
        if (currentUser) {
          config.headers['x-user-id'] = currentUser.id;
          
          // 한글 등 비 ASCII 문자가 포함될 수 있는 필드는 Base64로 인코딩
          if (currentUser.name) {
            try {
              const encodedName = encodeBase64String(currentUser.name);
              config.headers['x-user-name'] = encodedName;
            } catch (e) {
              console.error('사용자 이름 인코딩 오류:', e);
              config.headers['x-user-name'] = 'System';
            }
          }
          
          config.headers['x-user-email'] = currentUser.email;
          config.headers['x-user-access-level'] = currentUser.systemAccessLevel;
        }

        return config;
      },
      (error) => {
        console.log('요청 및 응답 인터셉터 초기화 error', error);
        return Promise.reject(error);
      }
    );

    // 응답 인터셉터
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        // 응답 데이터 추출
        return response.data;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config;

        // 토큰 만료 오류 (401)일 경우 토큰 갱신 시도
        if (error.response?.status === 401 && originalRequest && !('_retry' in originalRequest)) {
          // 타입 안전을 위해 _retry 속성 추가
          (originalRequest as any)._retry = true;
          
          // 토큰 갱신 시도
          const refreshed = await refreshAccessToken();
          if (refreshed && originalRequest) {
            // 토큰 갱신 성공하면 새 토큰으로 재요청
            const token = useAuthStore.getState().token;
            if (token) {
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
            }
            return this.instance(originalRequest);
          }
        }

        // API 에러 형식으로 변환
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
    );
  }
  
  /**
   * 요청 캐시키 생성
   */
  private _createCacheKey(url: string, method: string, data?: any): string {
    const dataString = data ? JSON.stringify(data) : '';
    return `${method.toUpperCase()}:${url}:${dataString}`;
  }
  
  /**
   * 캐시에서 응답 가져오기
   */
  private _getFromCache<T>(cacheKey: string): T | null {
    const cached = this.cache.get(cacheKey);
    
    if (!cached) return null;
    
    // 캐시 만료 확인
    if (cached.expiresAt < Date.now()) {
      this.cache.delete(cacheKey);
      return null;
    }
    
    return cached.data as T;
  }
  
  /**
   * 캐시에 응답 저장
   */
  private _setCache<T>(cacheKey: string, data: T, lifetime?: number): void {
    const now = Date.now();
    const expiresAt = now + (lifetime || this.defaultCacheLifetime);
    
    this.cache.set(cacheKey, {
      data,
      timestamp: now,
      expiresAt
    });
  }
  
  /**
   * 캐시 항목 삭제
   */
  private _invalidateCache(url: string, method?: string): void {
    // 메서드가 없는 경우 (모든 메서드 대상)
    if (!method) {
      const urlPattern = url ? new RegExp(`^[A-Z]+:${url}`) : /./;

      for (const key of this.cache.keys()) {
        if (urlPattern.test(key)) {
          console.log(`캐시 무효화: ${key}`);
          this.cache.delete(key);
        }
      }
    } 
    // 특정 URL, 메소드 조합의 캐시만 삭제
    else {
      const keyPrefix = `${method.toUpperCase()}:${url}`;
      
      for (const key of this.cache.keys()) {
        if (key.startsWith(keyPrefix)) {
          console.log(`캐시 무효화: ${key}`);
          this.cache.delete(key);
        }
      }
    }
  }
  
  /**
   * 모든 캐시 지우기 또는 특정 URL/메서드 조합의 캐시만 지우기
   * @param method HTTP 메서드 (GET, POST 등). 생략 시 모든 메서드 대상
   * @param url URL 패턴. 생략 시 모든 URL 대상
   */
  public clearCache(method?: string, url?: string): void {
    if (!method && !url) {
      console.log('모든 캐시 무효화');
      this.cache.clear();
      return;
    }
    
    this._invalidateCache(url || '', method);
  }

  /**
   * GET 요청 (캐싱 지원)
   */
  public get<T = any>(url: string, config?: AxiosRequestConfig & { useCache?: boolean, cacheLifetime?: number }): Promise<T> {
    const useCache = config?.useCache !== false;
    const cacheLifetime = config?.cacheLifetime;
    const cacheKey = this._createCacheKey(url, 'GET');
    
    // 캐싱이 활성화되어 있고 캐시에 데이터가 있는 경우
    if (useCache) {
      const cachedData = this._getFromCache<T>(cacheKey);
      if (cachedData) return Promise.resolve(cachedData);
    }
    
    // 중복 요청 방지: 동일한 요청이 진행 중인 경우 해당 Promise 반환
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey)!;
    }
    
    // 새 요청 생성
    const request = this.instance.get<T>(url, config)
      .then(response => {
        if (useCache) {
          this._setCache(cacheKey, response, cacheLifetime);
        }
        this.pendingRequests.delete(cacheKey);
        return response;
      })
      .catch(error => {
        this.pendingRequests.delete(cacheKey);
        throw error;
      }) as Promise<T>;
    
    // 진행 중인 요청 추적
    this.pendingRequests.set(cacheKey, request);
    
    return request;
  }

  /**
   * POST 요청 (write 작업이므로 관련 GET 캐시 무효화)
   */
  public post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    // URL 패턴 기반으로 관련 GET 캐시 무효화
    this._invalidateCache(url.split('?')[0].split('/').slice(0, -1).join('/'));
    
    return this.instance.post(url, data, config);
  }

  /**
   * PUT 요청 (write 작업이므로 관련 GET 캐시 무효화)
   */
  public put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    // URL 패턴 기반으로 관련 GET 캐시 무효화
    this._invalidateCache(url.split('?')[0]);
    this._invalidateCache(url.split('?')[0].split('/').slice(0, -1).join('/'));
    
    return this.instance.put(url, data, config);
  }

  /**
   * PATCH 요청 (write 작업이므로 관련 GET 캐시 무효화)
   */
  public patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const baseUrl = url.split('?')[0];
    const resourcePath = baseUrl.split('/').slice(0, -1).join('/');
    
    console.log(`📝 PATCH 요청 실행: ${url}`);
    console.log(`🧹 무효화 대상:`, {
      specific: baseUrl,
      collection: resourcePath
    });
    
    // 특정 리소스 캐시 무효화
    this._invalidateCache(baseUrl);
    // 리소스 컬렉션 캐시 무효화
    this._invalidateCache(resourcePath);
    // 전체 companies 경로 캐시도 무효화 (ID 관계없이)
    if (baseUrl.includes('/companies/')) {
      this._invalidateCache('companies');
    }
    
    // 패치 요청 전송
    return this.instance.patch<T>(url, data, config)
      .then(response => {
        console.log(`✅ PATCH 요청 성공: ${url}`);
        
        // 추가적인 캐시 무효화 (응답 성공 후)
        setTimeout(() => {
          this._invalidateCache(baseUrl);
          this._invalidateCache(resourcePath);
          if (baseUrl.includes('/companies/')) {
            this._invalidateCache('companies');
          }
          console.log(`🔄 PATCH 이후 캐시 재무효화 완료: ${url}`);
        }, 100);
        
        return response.data;
      });
  }

  /**
   * DELETE 요청 (write 작업이므로 관련 GET 캐시 무효화)
   */
  public delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    // URL 패턴 기반으로 관련 GET 캐시 무효화
    this._invalidateCache(url.split('?')[0]);
    this._invalidateCache(url.split('?')[0].split('/').slice(0, -1).join('/'));
    
    return this.instance.delete(url, config);
  }
}

// 싱글톤 인스턴스 생성하여 내보내기
const apiClient = new ApiClient();
export default apiClient;
// ApiClient 클래스도 내보내기 (테스트나 특수 목적으로 사용할 때 유용함)
export { ApiClient }; 