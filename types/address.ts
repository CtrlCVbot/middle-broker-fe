export interface IAddress {
    id: number;
    name: string; // 상/하차지명
    address: string; // 주소
    detailedAddress: string; // 상세주소
    contact: string; // 연락처
    manager: string; // 담당자
    type: string; // 유형 (상차지/하차지)
  }
  
  export interface IAddressResponse {
    data: IAddress[];
    pagination: IPagination;
  }
  
  export interface IPagination {
    total: number;
    page: number;
    limit: number;
  }
  
  export interface IAddressSearchParams {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
  }