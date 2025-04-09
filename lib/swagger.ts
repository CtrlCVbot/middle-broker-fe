export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Middle Mile API Docs',
    version: '1.0.0',
  },
  paths: {
    '/api/users/{userId}': {
      get: {
        summary: '사용자 상세 조회',
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid'
            }
          }
        ],
        responses: {
          '200': {
            description: '사용자 정보 조회 성공'
          },
          '400': {
            description: '잘못된 요청'
          },
          '404': {
            description: '사용자를 찾을 수 없음'
          },
          '500': {
            description: '서버 오류'
          }
        }
      }
    }
  }
}; 