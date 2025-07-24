import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CompanyStatus, CompanyType, StatementType } from '@/types/broker-company';
import { CompanyType as ApiCompanyType, CompanyStatus as ApiCompanyStatus } from '@/types/company';
import { cn } from '@/lib/utils';

// 업체 상태 배지
export const BrokerCompanyStatusBadge = ({ status }: { status: CompanyStatus | ApiCompanyStatus | string }) => {
  // 상태값을 표시용 텍스트로 변환 (API 값이 들어와도 표시는 한글로)
  const displayStatus = status === 'active' ? '활성' : 
                       status === 'inactive' ? '비활성' : 
                       status as string;
  
  // 활성 상태인지 확인 (API 값과 레거시 값 모두 지원)
  const isActive = status === '활성' || status === 'active';
  
  return (
    <Badge 
      variant={isActive ? 'default' : 'destructive'} 
      className={cn(
        "rounded-md",
        isActive ? "bg-green-100 text-green-700 hover:bg-green-100" : ""
      )}
    >
      {displayStatus}
    </Badge>
  );
};

// 업체 구분 배지
export const BrokerCompanyTypeBadge = ({ type }: { type: CompanyType | ApiCompanyType | string }) => {
  // API 코드값을 표시용 텍스트로 변환
  const displayType = type === 'shipper' ? '화주' : 
                     type === 'carrier' ? '운송사' : 
                     type === 'broker' ? '주선사' : 
                     type as string;
  
  const getTypeVariant = () => {
    // API 값과 레거시 값 모두 처리
    const normalizedType = displayType;
    
    switch (normalizedType) {
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
      {displayType}
    </Badge>
  );
};

// 전표 구분 배지
export const BrokerCompanyStatementBadge = ({ type }: { type: StatementType | string }) => {
  const variant = type === '매입처' ? 'outline' : 'secondary';
  return (
    <Badge variant={variant} className="rounded-md">
      {type}
    </Badge>
  );
}; 