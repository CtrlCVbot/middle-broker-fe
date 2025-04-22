"use client";

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  BrokerCompanyStatusBadge, 
  BrokerCompanyTypeBadge, 
  BrokerCompanyStatementBadge 
} from './broker-company-status-badge';
import { IBrokerCompany } from '@/types/broker-company';
// 기존 스토어 import 주석 처리
// import { useBrokerCompanyStore } from '@/store/broker-company-store';
import { useCompanyStore } from '@/store/company-store';
import { BrokerCompanyContextMenu } from './broker-company-context-menu';
import { cn } from '@/lib/utils';
import { ILegacyCompany } from '@/types/company';
import { Button } from "@/components/ui/button";
import { formatDate, formatPhoneNumber } from "@/utils/format";
import { Badge } from "@/components/ui/badge";

interface BrokerCompanyTableProps {
  companies: IBrokerCompany[] | ILegacyCompany[];
  onCompanyClick: (company: IBrokerCompany | ILegacyCompany) => void;
}

export function BrokerCompanyTable({ companies, onCompanyClick }: BrokerCompanyTableProps) {
  const { 
    selectedCompanyIds, 
    toggleCompanySelection, 
    setSelectedCompanyIds, 
    clearSelectedCompanyIds 
  } = useCompanyStore();
  
  // 모든 회사 선택 상태
  const allSelected = companies.length > 0 && selectedCompanyIds.length === companies.length;
  
  // 전체 선택/해제 핸들러
  const handleSelectAll = () => {
    if (allSelected) {
      clearSelectedCompanyIds();
    } else {
      setSelectedCompanyIds(companies.map(company => company.id));
    }
  };
  
  // 회사 클릭 핸들러 - 데이터 로깅 추가
  const handleCompanyClick = (company: IBrokerCompany | ILegacyCompany) => {
    // 데이터 구조 확인을 위한 로깅
    console.log('Selected company data:', company);
    console.log('Company type:', company.type);
    console.log('Company data structure:', Object.keys(company));
    
    // 원래 기능 유지
    onCompanyClick(company);
  };
  
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "활성":
      case "active":
        return "success";
      case "비활성":
      case "inactive":
        return "destructive";
      case "보류":
      case "pending":
        return "warning";
      default:
        return "secondary";
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox 
                checked={allSelected}
                onCheckedChange={handleSelectAll}
                aria-label="전체 선택"
              />
            </TableHead>
            <TableHead className="w-[110px]">업체 코드</TableHead>
            <TableHead className="w-[90px]">업체 구분</TableHead>
            <TableHead className="w-[90px]">전표 구분</TableHead>
            <TableHead className="w-[130px]">사업자번호</TableHead>
            <TableHead>업체명</TableHead>
            <TableHead>대표자</TableHead>
            <TableHead className="w-[150px]">이메일</TableHead>
            <TableHead>전화번호</TableHead>
            {/* <TableHead>팩스번호</TableHead> */}
            {/* <TableHead>담당자명</TableHead> */}
            <TableHead>핸드폰번호</TableHead>
            <TableHead className="w-[110px]">등록일</TableHead>
            <TableHead className="w-[90px]">상태</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.length === 0 ? (
            <TableRow>
              <TableCell colSpan={14} className="h-24 text-center">
                검색 결과가 없습니다.
              </TableCell>
            </TableRow>
          ) : (
            companies.map((company) => (
              <BrokerCompanyContextMenu key={company.id} company={company as IBrokerCompany}>
                <TableRow 
                  className={cn(
                    "cursor-pointer hover:bg-muted/50",
                    company.status === '비활성' && "bg-gray-50",
                    selectedCompanyIds.includes(company.id) && "bg-primary/5"
                  )}
                  onClick={() => handleCompanyClick(company)}
                >
                  <TableCell className="py-2">
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
                  </TableCell>
                  <TableCell className="font-medium">{company.code}</TableCell>
                  <TableCell>
                    <BrokerCompanyTypeBadge type={company.type as any} />
                  </TableCell>
                  <TableCell>
                    <BrokerCompanyStatementBadge type={(company as IBrokerCompany).statementType || '매출처'} />
                  </TableCell>
                  <TableCell>{company.businessNumber}</TableCell>
                  <TableCell className="font-semibold text-gray-800">{company.name}</TableCell>
                  <TableCell>{company.representative}</TableCell>
                  <TableCell className="text-blue-600 underline">
                    <a href={`mailto:${company.email}`} onClick={(e) => e.stopPropagation()}>
                      {company.email}
                    </a>
                  </TableCell>
                  <TableCell>{company.phoneNumber}</TableCell>
                  {/* <TableCell>{company.faxNumber}</TableCell> */}
                  {/* <TableCell>{company.managerName}</TableCell> */}
                  <TableCell>{company.mobileNumber}</TableCell>
                  <TableCell>{company.registeredDate}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(company.status as string) as any}>
                      {company.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              </BrokerCompanyContextMenu>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
} 