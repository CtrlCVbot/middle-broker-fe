export interface IInvoice {
  id: string;
  taxId: string;
  supplierName: string;
  businessNumber: string;
  issueDate: string;
  supplyAmount: number;
  taxAmount: number;
  totalAmount: number;
  status: 'WAITING' | 'MATCHING' | 'COMPLETED';
  invoiceType: 'ELECTRONIC' | 'MANUAL' | 'POSTAL';
}

export interface ICargo {
  id: string;
  carNumber: string;
  dispatchAmount: number;
  transportDate: string;
  receiptStatus: 'RECEIVED' | 'WAITING' | 'NOT_REQUIRED';
  businessNumber: string;
}

export interface IAdditionalCharge {
  id: string;
  cargoId: string;
  type: 'WAITING' | 'TOLL' | 'LABOR' | 'OTHER';
  amount: number;
  memo?: string;
}

export interface IInvoiceFilter {
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