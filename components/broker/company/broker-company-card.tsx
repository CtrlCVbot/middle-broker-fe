"use client";

import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  BrokerCompanyStatusBadge, 
  BrokerCompanyTypeBadge,
  BrokerCompanyStatementBadge
} from './broker-company-status-badge';
import { IBrokerCompany } from '@/types/broker-company';
import { useBrokerCompanyStore } from '@/store/broker-company-store';
import { BrokerCompanyContextMenu } from './broker-company-context-menu';
import { cn } from '@/lib/utils';
import { Mail, Phone, Smartphone, Calendar } from 'lucide-react';

interface BrokerCompanyCardProps {
  company: IBrokerCompany;
  onClick?: () => void;
}

export function BrokerCompanyCard({ company, onClick }: BrokerCompanyCardProps) {
  const { selectedCompanyIds, toggleCompanySelection } = useBrokerCompanyStore();

  if (!company) {
    return (
      <Card className="cursor-not-allowed bg-gray-100 opacity-70">
        <CardHeader>
          <CardTitle className="text-base">데이터 로드 중...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            업체 정보를 불러오는 중입니다.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <BrokerCompanyContextMenu company={company}>
      <Card 
        className={cn(
          "cursor-pointer hover:shadow-md transition-shadow",
          company.status === '비활성' && "bg-gray-50",
          selectedCompanyIds.includes(company.id) && "border-primary border-2"
        )}
        onClick={onClick}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox 
                checked={selectedCompanyIds.includes(company.id)}
                onCheckedChange={(checked) => {
                  if (checked !== undefined) {
                    toggleCompanySelection(company.id);
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                aria-label={`${company.name} 선택`}
              />
              <CardTitle className="text-base">{company.name}</CardTitle>
            </div>
            <BrokerCompanyStatusBadge status={company.status} />
          </div>
          <CardDescription className="flex gap-2 mt-1">
            <span>{company.code}</span>
            <span>•</span>
            <BrokerCompanyTypeBadge type={company.type} />
            <span>•</span>
            <BrokerCompanyStatementBadge type={company.statementType} />
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-2 pt-0">
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex items-center text-muted-foreground">
              <span className="font-medium min-w-24">사업자번호:</span>
              <span>{company.businessNumber}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <span className="font-medium min-w-24">대표자:</span>
              <span>{company.representative}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <Mail className="h-4 w-4 mr-2" />
              <a 
                href={`mailto:${company.email}`} 
                className="text-blue-600 underline"
                onClick={(e) => e.stopPropagation()}
              >
                {company.email}
              </a>
            </div>
            <div className="flex items-center text-muted-foreground">
              <Phone className="h-4 w-4 mr-2" />
              <span>{company.phoneNumber}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16" 
                height="16" 
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 mr-2"
              >
                <path d="M17 17h.01" />
                <path d="M13 17h.01" />
                <path d="M9 17h.01" />
                <rect width="20" height="14" x="2" y="7" rx="2" />
                <path d="M6 4v3" />
                <path d="M18 4v3" />
                <path d="M2 10h20" />
              </svg>
              <span>{company.faxNumber}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-2 text-xs text-muted-foreground border-t">
          <div className="flex flex-col sm:flex-row justify-between w-full gap-2">
            <div className="flex items-center gap-1">
              <span>담당자:</span>
              <span className="font-medium">{company.managerName}</span>
              <Smartphone className="h-3 w-3 mx-1" />
              <span>{company.managerPhoneNumber}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 mr-1" />
              <span>등록일: {company.registeredDate}</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </BrokerCompanyContextMenu>
  );
} 