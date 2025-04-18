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
    // 에러 응답이 있는 경우
    if (error.response) {
      // 서버에서 제공한 에러 메시지가 있다면 사용
      if (error.response.data && error.response.data.error) {
        error.message = error.response.data.error;
      } else {
        // HTTP 상태 코드에 따른 기본 메시지
        switch (error.response.status) {
          case 400:
            error.message = '잘못된 요청입니다.';
            break;
          case 401:
            error.message = '인증이 필요합니다.';
            break;
          case 403:
            error.message = '접근 권한이 없습니다.';
            break;
          case 404:
            error.message = '요청한 리소스를 찾을 수 없습니다.';
            break;
          case 500:
            error.message = '서버 오류가 발생했습니다.';
            break;
          default:
            error.message = `요청 처리 중 오류가 발생했습니다. (${error.response.status})`;
        }
      }
    } else if (error.request) {
      // 요청은 보냈지만 응답을 받지 못한 경우
      error.message = '서버에서 응답이 없습니다. 네트워크 연결을 확인해주세요.';
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 