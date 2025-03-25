import { IInvoice, ICargo } from "@/types/broker/expenditure";

// 세금계산서 목록 생성
export const generateMockInvoices = (count: number = 20): IInvoice[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: `INV-${String(index + 1).padStart(5, '0')}`,
    taxId: `20240${String(index + 1).padStart(4, '0')}`,
    supplierName: `운송사 ${index + 1}`,
    businessNumber: `123-45-${String(67890 + index).padStart(5, '0')}`,
    issueDate: new Date(2024, 0, index + 1).toISOString().split('T')[0],
    supplyAmount: Math.floor(Math.random() * 1000000) * 100,
    taxAmount: Math.floor(Math.random() * 100000) * 10,
    totalAmount: 0, // supplyAmount + taxAmount로 계산
    status: ['WAITING', 'MATCHING', 'COMPLETED'][Math.floor(Math.random() * 3)] as IInvoice['status'],
    invoiceType: ['ELECTRONIC', 'MANUAL', 'POSTAL'][Math.floor(Math.random() * 3)] as IInvoice['invoiceType'],
  })).map(invoice => ({
    ...invoice,
    totalAmount: invoice.supplyAmount + invoice.taxAmount
  }));
};

// 화물 목록 생성
export const generateMockCargos = (count: number = 50): ICargo[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: `CARGO-${String(index + 1).padStart(5, '0')}`,
    carNumber: `${String(index + 1).padStart(2, '0')}가${String(1234 + index).padStart(4, '0')}`,
    dispatchAmount: Math.floor(Math.random() * 500000) * 100,
    transportDate: new Date(2024, 0, index + 1).toISOString().split('T')[0],
    receiptStatus: ['RECEIVED', 'WAITING', 'NOT_REQUIRED'][Math.floor(Math.random() * 3)] as ICargo['receiptStatus'],
    businessNumber: `123-45-${String(67890 + Math.floor(index / 3)).padStart(5, '0')}`,
  }));
};

// 페이징된 세금계산서 데이터 반환
export const getPaginatedInvoices = (
  invoices: IInvoice[],
  page: number = 1,
  pageSize: number = 10,
  filter?: {
    businessNumber?: string;
    supplierName?: string;
    taxId?: string;
    searchTerm?: string;
    status?: 'WAITING' | 'MATCHING' | 'COMPLETED';
    dateRange?: {
      start?: string;
      end?: string;
    };
    amountRange?: {
      min?: number;
      max?: number;
    };
  }
) => {
  let filteredInvoices = [...invoices];

  // 상태 필터 적용 (기본값: WAITING)
  const status = filter?.status || 'WAITING';
  filteredInvoices = filteredInvoices.filter(invoice => invoice.status === status);

  // 필터 적용
  if (filter) {
    // 통합 검색어
    if (filter.searchTerm) {
      const searchTerm = filter.searchTerm.toLowerCase();
      filteredInvoices = filteredInvoices.filter(invoice => 
        invoice.taxId.toLowerCase().includes(searchTerm) ||
        invoice.businessNumber.toLowerCase().includes(searchTerm) ||
        invoice.supplierName.toLowerCase().includes(searchTerm) ||
        invoice.supplyAmount.toString().includes(searchTerm)
      );
    }

    if (filter.businessNumber) {
      filteredInvoices = filteredInvoices.filter(invoice => 
        invoice.businessNumber.includes(filter.businessNumber!)
      );
    }
    if (filter.supplierName) {
      filteredInvoices = filteredInvoices.filter(invoice => 
        invoice.supplierName.toLowerCase().includes(filter.supplierName!.toLowerCase())
      );
    }
    if (filter.taxId) {
      filteredInvoices = filteredInvoices.filter(invoice => 
        invoice.taxId.includes(filter.taxId!)
      );
    }
    if (filter.dateRange?.start) {
      filteredInvoices = filteredInvoices.filter(invoice => 
        invoice.issueDate >= filter.dateRange!.start!
      );
    }
    if (filter.dateRange?.end) {
      filteredInvoices = filteredInvoices.filter(invoice => 
        invoice.issueDate <= filter.dateRange!.end!
      );
    }
    if (filter.amountRange?.min !== undefined) {
      filteredInvoices = filteredInvoices.filter(invoice => 
        invoice.totalAmount >= filter.amountRange!.min!
      );
    }
    if (filter.amountRange?.max !== undefined) {
      filteredInvoices = filteredInvoices.filter(invoice => 
        invoice.totalAmount <= filter.amountRange!.max!
      );
    }
  }

  // 페이징 처리
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedData = filteredInvoices.slice(start, end);

  return {
    data: paginatedData,
    total: filteredInvoices.length,
    totalPages: Math.ceil(filteredInvoices.length / pageSize),
    currentPage: page,
    pageSize,
  };
}; 