export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Middle Mile API Docs',
    version: '1.0.0',
  },
  components: {
    schemas: {
      User: {
        type: 'object',
        required: ['id', 'email', 'name', 'phone_number', 'system_access_level', 'status'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: '사용자 고유 ID'
          },
          email: {
            type: 'string',
            format: 'email',
            description: '사용자 이메일'
          },
          name: {
            type: 'string',
            description: '사용자 이름'
          },
          phone_number: {
            type: 'string',
            description: '전화번호'
          },
          system_access_level: {
            type: 'string',
            enum: ['platform_admin', 'broker_admin', 'shipper_admin', 'broker_member', 'shipper_member', 'viewer', 'guest'],
            description: '시스템 접근 레벨'
          },
          status: {
            type: 'string',
            enum: ['active', 'inactive', 'locked'],
            description: '사용자 상태'
          },
          domains: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: '접근 가능한 도메인 목록'
          },
          company_id: {
            type: 'string',
            format: 'uuid',
            description: '소속 회사 ID'
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            description: '생성 일시'
          },
          updated_at: {
            type: 'string',
            format: 'date-time',
            description: '수정 일시'
          },
          created_by: {
            type: 'string',
            description: '생성자'
          },
          updated_by: {
            type: 'string',
            description: '수정자'
          }
        }
      }
    }
  },
  paths: {
    '/api/users': {
      get: {
        summary: '사용자 목록 조회',
        description: '페이지네이션과 필터링을 지원하는 사용자 목록 조회 API',
        tags: ['Users'],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: {
              type: 'integer',
              default: 1
            },
            description: '페이지 번호'
          },
          {
            name: 'pageSize',
            in: 'query',
            schema: {
              type: 'integer',
              default: 10
            },
            description: '페이지당 항목 수'
          },
          {
            name: 'searchTerm',
            in: 'query',
            schema: {
              type: 'string'
            },
            description: '이름, 이메일, 전화번호 검색어'
          },
          {
            name: 'status',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['active', 'inactive', 'locked']
            },
            description: '사용자 상태 필터'
          },
          {
            name: 'systemAccessLevel',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['platform_admin', 'broker_admin', 'shipper_admin', 'broker_member', 'shipper_member', 'viewer', 'guest']
            },
            description: '시스템 접근 레벨 필터'
          },
          {
            name: 'domains',
            in: 'query',
            schema: {
              type: 'string'
            },
            description: '도메인 필터 (콤마로 구분)'
          },
          {
            name: 'companyId',
            in: 'query',
            schema: {
              type: 'string',
              format: 'uuid'
            },
            description: '회사 ID 필터'
          }
        ],
        responses: {
          '200': {
            description: '성공적으로 사용자 목록을 조회함',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/User'
                      }
                    },
                    total: {
                      type: 'integer',
                      description: '전체 사용자 수'
                    },
                    page: {
                      type: 'integer',
                      description: '현재 페이지 번호'
                    },
                    pageSize: {
                      type: 'integer',
                      description: '페이지당 항목 수'
                    },
                    totalPages: {
                      type: 'integer',
                      description: '전체 페이지 수'
                    }
                  }
                }
              }
            }
          },
          '500': {
            description: '서버 오류'
          }
        }
      },
      post: {
        summary: '새로운 사용자 생성',
        description: '새로운 사용자를 생성하는 API',
        tags: ['Users'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'name', 'phone_number', 'system_access_level', 'domains'],
                properties: {
                  email: {
                    type: 'string',
                    format: 'email'
                  },
                  password: {
                    type: 'string',
                    format: 'password'
                  },
                  name: {
                    type: 'string'
                  },
                  phone_number: {
                    type: 'string'
                  },
                  system_access_level: {
                    type: 'string',
                    enum: ['platform_admin', 'broker_admin', 'shipper_admin', 'broker_member', 'shipper_member', 'viewer', 'guest']
                  },
                  domains: {
                    type: 'array',
                    items: {
                      type: 'string'
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: '사용자가 성공적으로 생성됨',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/User'
                }
              }
            }
          },
          '400': {
            description: '잘못된 요청 (필수 필드 누락 또는 중복된 이메일)'
          },
          '500': {
            description: '서버 오류'
          }
        }
      }
    },
    '/api/users/{userId}': {
      get: {
        summary: '사용자 상세 조회',
        description: '특정 사용자의 상세 정보를 조회하는 API',
        tags: ['Users'],
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid'
            },
            description: '사용자 ID'
          }
        ],
        responses: {
          '200': {
            description: '사용자 정보 조회 성공',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/User'
                }
              }
            }
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
      },
      put: {
        summary: '사용자 정보 수정',
        description: '특정 사용자의 정보를 수정하는 API',
        tags: ['Users'],
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid'
            },
            description: '사용자 ID'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: {
                    type: 'string',
                    format: 'email'
                  },
                  password: {
                    type: 'string',
                    format: 'password'
                  },
                  name: {
                    type: 'string'
                  },
                  phone_number: {
                    type: 'string'
                  },
                  system_access_level: {
                    type: 'string',
                    enum: ['platform_admin', 'broker_admin', 'shipper_admin', 'broker_member', 'shipper_member', 'viewer', 'guest']
                  },
                  domains: {
                    type: 'array',
                    items: {
                      type: 'string'
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: '사용자 정보가 성공적으로 수정됨',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/User'
                }
              }
            }
          },
          '400': {
            description: '잘못된 요청 (잘못된 ID 형식 또는 중복된 이메일)'
          },
          '404': {
            description: '사용자를 찾을 수 없음'
          },
          '500': {
            description: '서버 오류'
          }
        }
      },
      delete: {
        summary: '사용자 삭제',
        description: '특정 사용자를 삭제하는 API',
        tags: ['Users'],
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid'
            },
            description: '사용자 ID'
          }
        ],
        responses: {
          '200': {
            description: '사용자가 성공적으로 삭제됨',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean'
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: '잘못된 사용자 ID 형식'
          },
          '404': {
            description: '사용자를 찾을 수 없음'
          },
          '500': {
            description: '서버 오류'
          }
        }
      }
    },
    '/api/users/{userId}/status': {
      patch: {
        summary: '사용자 상태 변경',
        description: '특정 사용자의 상태를 변경하고 변경 이력을 기록하는 API',
        tags: ['Users'],
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid'
            },
            description: '사용자 ID'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: {
                    type: 'string',
                    enum: ['active', 'inactive', 'locked'],
                    description: '변경할 사용자 상태'
                  },
                  reason: {
                    type: 'string',
                    description: '상태 변경 사유'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: '사용자 상태가 성공적으로 변경됨',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/User'
                }
              }
            }
          },
          '400': {
            description: '잘못된 요청 (잘못된 ID 형식 또는 잘못된 상태값)'
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