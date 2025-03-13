import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CompanyStatus, CompanyType, StatementType } from '@/types/broker-company';
import { cn } from '@/lib/utils';

// 업체 상태 배지
export const BrokerCompanyStatusBadge = ({ status }: { status: CompanyStatus }) => {
  return (
    <Badge 
      variant={status === '활성' ? 'default' : 'destructive'} 
      className={cn(
        "rounded-md",
        status === '활성' ? "bg-green-100 text-green-700 hover:bg-green-100" : ""
      )}
    >
      {status}
    </Badge>
  );
};

// 업체 구분 배지
export const BrokerCompanyTypeBadge = ({ type }: { type: CompanyType }) => {
  const getTypeVariant = () => {
    switch (type) {
      case '화주':
        return 'default';
      case '운송사':
        return 'outline';
      case '주선사':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Badge variant={getTypeVariant()} className="rounded-md">
      {type}
    </Badge>
  );
};

// 전표 구분 배지
export const BrokerCompanyStatementBadge = ({ type }: { type: StatementType }) => {
  const variant = type === '매입처' ? 'outline' : 'secondary';
  return (
    <Badge variant={variant} className="rounded-md">
      {type}
    </Badge>
  );
}; 