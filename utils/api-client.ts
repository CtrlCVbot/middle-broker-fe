import axios from 'axios';

// 기본 API 클라이언트 설정
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 응답 인터셉터 설정
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // API 에러 처리
    if (error.response) {
      const { data, status } = error.response;
      // 에러 응답이 객체인 경우 에러 메시지 활용
      const errorMessage = data && typeof data === 'object' && data.error 
        ? data.error 
        : '요청 처리 중 오류가 발생했습니다.';
        
      // 사용자 정의 에러 객체 반환
      return Promise.reject({
        status,
        message: errorMessage,
        data: data,
      });
    }
    
    // 네트워크 오류 등 기타 오류 처리
    return Promise.reject({
      status: 0,
      message: error.message || '서버에 연결할 수 없습니다.',
    });
  }
);

export default apiClient; 