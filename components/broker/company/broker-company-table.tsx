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
import { useBrokerCompanyStore } from '@/store/broker-company-store';
import { BrokerCompanyContextMenu } from './broker-company-context-menu';
import { cn } from '@/lib/utils';

interface BrokerCompanyTableProps {
  companies: IBrokerCompany[];
  onCompanyClick: (company: IBrokerCompany) => void;
}

export function BrokerCompanyTable({ companies, onCompanyClick }: BrokerCompanyTableProps) {
  const { 
    selectedCompanyIds, 
    toggleCompanySelection, 
    setSelectedCompanyIds, 
    clearSelectedCompanyIds 
  } = useBrokerCompanyStore();
  
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
  
  // 개별 선택 핸들러
  // const handleSelectCompany = (e: React.MouseEvent, companyId: string) => {
  //   e.stopPropagation();
  //   toggleCompanySelection(companyId);
  // };
  
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
            <TableHead>팩스번호</TableHead>
            <TableHead>담당자명</TableHead>
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
              <BrokerCompanyContextMenu key={company.id} company={company}>
                <TableRow 
                  className={cn(
                    "cursor-pointer hover:bg-muted/50",
                    company.status === '비활성' && "bg-gray-50",
                    selectedCompanyIds.includes(company.id) && "bg-primary/5"
                  )}
                  onClick={() => onCompanyClick(company)}
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
                    <BrokerCompanyTypeBadge type={company.type} />
                  </TableCell>
                  <TableCell>
                    <BrokerCompanyStatementBadge type={company.statementType} />
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
                  <TableCell>{company.faxNumber}</TableCell>
                  <TableCell>{company.managerName}</TableCell>
                  <TableCell>{company.managerPhoneNumber}</TableCell>
                  <TableCell>{company.registeredDate}</TableCell>
                  <TableCell>
                    <BrokerCompanyStatusBadge status={company.status} />
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