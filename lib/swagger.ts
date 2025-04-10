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
      },
      Company: {
        type: 'object',
        required: ['id', 'name', 'businessNumber', 'ceoName', 'type', 'status'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: '업체 고유 ID'
          },
          name: {
            type: 'string',
            description: '업체명'
          },
          businessNumber: {
            type: 'string',
            description: '사업자번호'
          },
          ceoName: {
            type: 'string',
            description: '대표자명'
          },
          type: {
            type: 'string',
            enum: ['broker', 'shipper', 'carrier'],
            description: '업체 유형'
          },
          status: {
            type: 'string',
            enum: ['active', 'inactive'],
            description: '업체 상태'
          },
          addressPostal: {
            type: 'string',
            description: '우편번호'
          },
          addressRoad: {
            type: 'string',
            description: '도로명 주소'
          },
          addressDetail: {
            type: 'string',
            description: '상세 주소'
          },
          contactTel: {
            type: 'string',
            description: '전화번호'
          },
          contactMobile: {
            type: 'string',
            description: '휴대전화'
          },
          contactEmail: {
            type: 'string',
            format: 'email',
            description: '이메일'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: '생성 일시'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: '수정 일시'
          }
        }
      },
      CompanyChangeLog: {
        type: 'object',
        required: ['id', 'companyId', 'changedBy', 'changeType'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: '변경 이력 ID'
          },
          companyId: {
            type: 'string',
            format: 'uuid',
            description: '업체 ID'
          },
          changedBy: {
            type: 'string',
            format: 'uuid',
            description: '변경자 ID'
          },
          changedByName: {
            type: 'string',
            description: '변경자 이름'
          },
          changedByEmail: {
            type: 'string',
            format: 'email',
            description: '변경자 이메일'
          },
          changedByAccessLevel: {
            type: 'string',
            enum: ['platform_admin', 'broker_admin', 'shipper_admin', 'broker_member', 'shipper_member', 'viewer', 'guest'],
            description: '변경자 접근 레벨'
          },
          changeType: {
            type: 'string',
            enum: ['create', 'update', 'delete'],
            description: '변경 유형'
          },
          diff: {
            type: 'object',
            description: '변경 내용'
          },
          reason: {
            type: 'string',
            description: '변경 사유'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: '생성 일시'
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
    },
    '/api/users/{userId}/fields': {
      patch: {
        summary: '사용자 필드 일괄 변경',
        description: '특정 사용자의 여러 필드를 동시에 변경하고 변경 이력을 기록하는 API',
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
            description: '대상 사용자 ID'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['requestUserId', 'fields'],
                properties: {
                  requestUserId: {
                    type: 'string',
                    format: 'uuid',
                    description: '요청 사용자 ID (변경을 요청하는 사용자)'
                  },
                  fields: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['field', 'value'],
                      properties: {
                        field: {
                          type: 'string',
                          enum: ['status', 'system_access_level', 'name', 'phone_number', 'email', 'domains'],
                          description: '변경할 필드명'
                        },
                        value: {
                          oneOf: [
                            {
                              type: 'string',
                              description: '문자열 타입 필드의 값'
                            },
                            {
                              type: 'array',
                              items: {
                                type: 'string',
                                enum: ['logistics', 'settlement', 'sales', 'etc']
                              },
                              description: 'domains 필드의 값'
                            }
                          ],
                          description: '변경할 값'
                        },
                        reason: {
                          type: 'string',
                          description: '변경 사유'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: '사용자 필드가 성공적으로 변경됨',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/User'
                }
              }
            }
          },
          '400': {
            description: '잘못된 요청 (잘못된 ID 형식, 잘못된 필드명 또는 값)'
          },
          '404': {
            description: '요청 사용자 또는 대상 사용자를 찾을 수 없음',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: {
                      type: 'string',
                      enum: ['요청 사용자를 찾을 수 없습니다.', '대상 사용자를 찾을 수 없습니다.']
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
      }
    },
    '/api/companies': {
      get: {
        summary: '업체 목록 조회',
        description: '페이지네이션과 필터링을 지원하는 업체 목록 조회 API',
        tags: ['Companies'],
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
            name: 'keyword',
            in: 'query',
            schema: {
              type: 'string'
            },
            description: '업체명, 사업자번호, 대표자명 검색어'
          },
          {
            name: 'status',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['active', 'inactive']
            },
            description: '업체 상태 필터'
          },
          {
            name: 'type',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['broker', 'shipper', 'carrier']
            },
            description: '업체 유형 필터'
          },
          {
            name: 'region',
            in: 'query',
            schema: {
              type: 'string'
            },
            description: '지역 필터'
          },
          {
            name: 'startDate',
            in: 'query',
            schema: {
              type: 'string',
              format: 'date'
            },
            description: '시작일'
          },
          {
            name: 'endDate',
            in: 'query',
            schema: {
              type: 'string',
              format: 'date'
            },
            description: '종료일'
          }
        ],
        responses: {
          '200': {
            description: '성공적으로 업체 목록을 조회함',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Company'
                      }
                    },
                    pagination: {
                      type: 'object',
                      properties: {
                        total: {
                          type: 'integer',
                          description: '전체 업체 수'
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
              }
            }
          },
          '500': {
            description: '서버 오류'
          }
        }
      },
      post: {
        summary: '새로운 업체 등록',
        description: '새로운 업체를 등록하는 API',
        tags: ['Companies'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'businessNumber', 'ceoName', 'type', 'status'],
                properties: {
                  name: {
                    type: 'string'
                  },
                  businessNumber: {
                    type: 'string'
                  },
                  ceoName: {
                    type: 'string'
                  },
                  type: {
                    type: 'string',
                    enum: ['broker', 'shipper', 'carrier']
                  },
                  status: {
                    type: 'string',
                    enum: ['active', 'inactive']
                  },
                  addressPostal: {
                    type: 'string'
                  },
                  addressRoad: {
                    type: 'string'
                  },
                  addressDetail: {
                    type: 'string'
                  },
                  contactTel: {
                    type: 'string'
                  },
                  contactMobile: {
                    type: 'string'
                  },
                  contactEmail: {
                    type: 'string',
                    format: 'email'
                  }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: '업체가 성공적으로 등록됨',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Company'
                }
              }
            }
          },
          '400': {
            description: '잘못된 요청 (필수 필드 누락 또는 중복된 사업자번호)'
          },
          '500': {
            description: '서버 오류'
          }
        }
      }
    },
    '/api/companies/{companyId}': {
      get: {
        summary: '업체 상세 조회',
        description: '특정 업체의 상세 정보를 조회하는 API',
        tags: ['Companies'],
        parameters: [
          {
            name: 'companyId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid'
            },
            description: '업체 ID'
          }
        ],
        responses: {
          '200': {
            description: '업체 정보 조회 성공',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Company'
                }
              }
            }
          },
          '400': {
            description: '잘못된 요청'
          },
          '404': {
            description: '업체를 찾을 수 없음'
          },
          '500': {
            description: '서버 오류'
          }
        }
      },
      put: {
        summary: '업체 정보 수정',
        description: '특정 업체의 정보를 수정하는 API',
        tags: ['Companies'],
        parameters: [
          {
            name: 'companyId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid'
            },
            description: '업체 ID'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string'
                  },
                  businessNumber: {
                    type: 'string'
                  },
                  ceoName: {
                    type: 'string'
                  },
                  type: {
                    type: 'string',
                    enum: ['broker', 'shipper', 'carrier']
                  },
                  status: {
                    type: 'string',
                    enum: ['active', 'inactive']
                  },
                  addressPostal: {
                    type: 'string'
                  },
                  addressRoad: {
                    type: 'string'
                  },
                  addressDetail: {
                    type: 'string'
                  },
                  contactTel: {
                    type: 'string'
                  },
                  contactMobile: {
                    type: 'string'
                  },
                  contactEmail: {
                    type: 'string',
                    format: 'email'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: '업체 정보가 성공적으로 수정됨',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Company'
                }
              }
            }
          },
          '400': {
            description: '잘못된 요청 (잘못된 ID 형식 또는 중복된 사업자번호)'
          },
          '404': {
            description: '업체를 찾을 수 없음'
          },
          '500': {
            description: '서버 오류'
          }
        }
      },
      delete: {
        summary: '업체 삭제',
        description: '특정 업체를 삭제하는 API',
        tags: ['Companies'],
        parameters: [
          {
            name: 'companyId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid'
            },
            description: '업체 ID'
          }
        ],
        responses: {
          '200': {
            description: '업체가 성공적으로 삭제됨',
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
            description: '잘못된 업체 ID 형식'
          },
          '404': {
            description: '업체를 찾을 수 없음'
          },
          '500': {
            description: '서버 오류'
          }
        }
      }
    },
    '/api/companies/{companyId}/status': {
      patch: {
        summary: '업체 상태 변경',
        description: '특정 업체의 상태를 변경하고 변경 이력을 기록하는 API',
        tags: ['Companies'],
        parameters: [
          {
            name: 'companyId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid'
            },
            description: '업체 ID'
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
                    enum: ['active', 'inactive'],
                    description: '변경할 업체 상태'
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
            description: '업체 상태가 성공적으로 변경됨',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Company'
                }
              }
            }
          },
          '400': {
            description: '잘못된 요청 (잘못된 ID 형식 또는 잘못된 상태값)'
          },
          '404': {
            description: '업체를 찾을 수 없음'
          },
          '500': {
            description: '서버 오류'
          }
        }
      }
    },
    '/api/companies/{companyId}/fields': {
      patch: {
        summary: '업체 필드 일괄 변경',
        description: '특정 업체의 여러 필드를 동시에 변경하고 변경 이력을 기록하는 API',
        tags: ['Companies'],
        parameters: [
          {
            name: 'companyId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid'
            },
            description: '업체 ID'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['fields'],
                properties: {
                  fields: {
                    type: 'object',
                    description: '변경할 필드와 값'
                  },
                  reason: {
                    type: 'string',
                    description: '변경 사유'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: '업체 필드가 성공적으로 변경됨',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Company'
                }
              }
            }
          },
          '400': {
            description: '잘못된 요청 (잘못된 ID 형식 또는 잘못된 필드명)'
          },
          '404': {
            description: '업체를 찾을 수 없음'
          },
          '500': {
            description: '서버 오류'
          }
        }
      }
    },
    '/api/companies/{companyId}/change-logs': {
      get: {
        summary: '업체 변경 이력 조회',
        description: '특정 업체의 변경 이력을 조회하는 API',
        tags: ['Companies'],
        parameters: [
          {
            name: 'companyId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid'
            },
            description: '업체 ID'
          },
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
            name: 'startDate',
            in: 'query',
            schema: {
              type: 'string',
              format: 'date'
            },
            description: '시작일'
          },
          {
            name: 'endDate',
            in: 'query',
            schema: {
              type: 'string',
              format: 'date'
            },
            description: '종료일'
          },
          {
            name: 'changeType',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['create', 'update', 'delete']
            },
            description: '변경 유형'
          }
        ],
        responses: {
          '200': {
            description: '업체 변경 이력 조회 성공',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/CompanyChangeLog'
                      }
                    },
                    pagination: {
                      type: 'object',
                      properties: {
                        total: {
                          type: 'integer',
                          description: '전체 변경 이력 수'
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
              }
            }
          },
          '400': {
            description: '잘못된 요청'
          },
          '404': {
            description: '업체를 찾을 수 없음'
          },
          '500': {
            description: '서버 오류'
          }
        }
      }
    },
    '/api/companies/batch': {
      post: {
        summary: '업체 일괄 처리',
        description: '여러 업체를 일괄적으로 처리하는 API',
        tags: ['Companies'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['companyIds', 'action'],
                properties: {
                  companyIds: {
                    type: 'array',
                    items: {
                      type: 'string',
                      format: 'uuid'
                    },
                    description: '처리할 업체 ID 목록'
                  },
                  action: {
                    type: 'string',
                    enum: ['activate', 'deactivate', 'delete'],
                    description: '수행할 작업'
                  },
                  reason: {
                    type: 'string',
                    description: '처리 사유'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: '업체 일괄 처리가 성공적으로 완료됨',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string'
                    },
                    data: {
                      type: 'object',
                      properties: {
                        processedCount: {
                          type: 'integer',
                          description: '처리된 업체 수'
                        },
                        action: {
                          type: 'string',
                          description: '수행된 작업'
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: '잘못된 요청'
          },
          '404': {
            description: '존재하지 않는 업체가 포함되어 있음'
          },
          '500': {
            description: '서버 오류'
          }
        }
      }
    },
    '/api/companies/validate': {
      post: {
        summary: '업체 데이터 검증',
        description: '업체 데이터의 유효성을 검증하는 API',
        tags: ['Companies'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'businessNumber', 'ceoName', 'type', 'status'],
                properties: {
                  name: {
                    type: 'string'
                  },
                  businessNumber: {
                    type: 'string'
                  },
                  ceoName: {
                    type: 'string'
                  },
                  type: {
                    type: 'string',
                    enum: ['broker', 'shipper', 'carrier']
                  },
                  status: {
                    type: 'string',
                    enum: ['active', 'inactive']
                  },
                  addressPostal: {
                    type: 'string'
                  },
                  addressRoad: {
                    type: 'string'
                  },
                  addressDetail: {
                    type: 'string'
                  },
                  contactTel: {
                    type: 'string'
                  },
                  contactMobile: {
                    type: 'string'
                  },
                  contactEmail: {
                    type: 'string',
                    format: 'email'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: '업체 데이터가 유효함',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string'
                    },
                    data: {
                      $ref: '#/components/schemas/Company'
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: '유효하지 않은 업체 데이터 또는 중복된 사업자번호'
          },
          '500': {
            description: '서버 오류'
          }
        }
      }
    },
    '/api/companies/{companyId}/users': {
      get: {
        summary: '업체별 사용자 조회',
        description: '특정 업체에 속한 사용자 목록을 조회하는 API',
        tags: ['Companies'],
        parameters: [
          {
            name: 'companyId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid'
            },
            description: '업체 ID'
          },
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
            name: 'status',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['active', 'inactive']
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
          }
        ],
        responses: {
          '200': {
            description: '업체별 사용자 목록 조회 성공',
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
                    pagination: {
                      type: 'object',
                      properties: {
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
              }
            }
          },
          '400': {
            description: '잘못된 요청'
          },
          '404': {
            description: '업체를 찾을 수 없음'
          },
          '500': {
            description: '서버 오류'
          }
        }
      }
    }
  }
}; 