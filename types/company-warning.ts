// 주의사항 인터페이스 (클라이언트용)
export interface ICompanyWarning {
  id: string;
  text: string;
  category?: string;
  sortOrder?: number;
  createdAt?: string;
}

// 주의사항 생성 요청 타입
export interface ICompanyWarningCreate {
  text: string;
  category?: string;
  sortOrder?: number;
  reason?: string;
}

// 주의사항 수정 요청 타입
export interface ICompanyWarningUpdate {
  text?: string;
  category?: string;
  sortOrder?: number;
  reason?: string;
}

// 주의사항 정렬 요청 타입
export interface ICompanyWarningSortOrder {
  id: string;
  sortOrder: number;
}

export interface ICompanyWarningSortRequest {
  orders: ICompanyWarningSortOrder[];
}

// API 응답 타입
export interface ICompanyWarningResponse {
  message: string;
  id?: string;
  success?: boolean;
} 