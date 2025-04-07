"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { BrokerCompanyTable } from '@/components/broker/company/broker-company-table';
import { BrokerCompanyCard } from '@/components/broker/company/broker-company-card';
import { BrokerCompanySearch } from '@/components/broker/company/broker-company-search';
import { BrokerCompanyPagination } from '@/components/broker/company/broker-company-pagination';
import { BrokerCompanyActionButtons } from '@/components/broker/company/broker-company-action-buttons';
import { BrokerCompanyRegisterSheet } from '@/components/broker/company/broker-company-register-sheet';
import { useBrokerCompanyStore } from '@/store/broker-company-store';
import { getBrokerCompaniesByPage } from '@/utils/mockdata/mock-broker-companies';
import { IBrokerCompany } from '@/types/broker-company';
import { Home, Building2 } from 'lucide-react';

// 쿼리 결과 타입 정의
interface CompanyQueryResult {
  data: IBrokerCompany[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function BrokerCompanyPage() {
  const { 
    viewMode, 
    filter, 
    currentPage, 
    pageSize,
    setViewMode,
    setCurrentPage,
    setPageSize
  } = useBrokerCompanyStore();
  
  // 선택된 업체 상태 관리
  const [selectedCompany, setSelectedCompany] = useState<IBrokerCompany | null>(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  
  // 업체 데이터 조회
  const { data, isLoading, isError, refetch } = useQuery<CompanyQueryResult>({
    queryKey: ['brokerCompanies', filter, currentPage, pageSize],
    queryFn: () => getBrokerCompaniesByPage(currentPage, pageSize, filter),
  });
  
  // 업체 클릭 핸들러
  const handleCompanyClick = (company: IBrokerCompany) => {
    setSelectedCompany(company);
    setIsEditSheetOpen(true);
  };
  
  // 업체 수정 완료 핸들러
  const handleUpdateSuccess = () => {
    refetch();
  };
  
  // 업체 등록 완료 핸들러
  const handleRegisterSuccess = () => {
    refetch();
  };
  
  // 액션 성공 핸들러
  const handleActionSuccess = () => {
    refetch();
  };
  
  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // 페이지 크기 변경 핸들러
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* 브레드크럼 */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">
              <Home className="h-4 w-4 mr-1" />
              <span>홈</span>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/broker">중개사 관리</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/broker/company" className="flex items-center">
              <Building2 className="h-4 w-4 mr-1" />
              <span>업체 관리</span>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      {/* 헤더 영역 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">업체 관리</h1>
        
        <div className="flex items-center gap-2">
          {/* 뷰 모드 전환 */}
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'table' | 'card')} className="mr-2">
            <TabsList className="grid w-[180px] grid-cols-2">
              <TabsTrigger value="table">테이블 보기</TabsTrigger>
              <TabsTrigger value="card">카드 보기</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* 액션 버튼 */}
          <BrokerCompanyActionButtons onActionSuccess={handleActionSuccess} />
          
          {/* 업체 등록 시트 */}
          <BrokerCompanyRegisterSheet onRegisterSuccess={handleRegisterSuccess} />
        </div>
      </div>
      
      {/* 검색 필터 */}
      <BrokerCompanySearch />
      
      {/* 데이터 로딩 상태 */}
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">데이터를 불러오는 중입니다...</p>
        </div>
      )}
      
      {/* 에러 상태 */}
      {isError && (
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">데이터를 불러오는 중 오류가 발생했습니다.</p>
          <Button variant="outline" onClick={() => refetch()} className="ml-2">
            다시 시도
          </Button>
        </div>
      )}
      
      {/* 데이터 없음 상태 */}
      {!isLoading && !isError && data?.data.length === 0 && (
        <div className="flex flex-col justify-center items-center h-64">
          <p className="text-gray-500 mb-4">등록된 업체가 없습니다.</p>
          <BrokerCompanyRegisterSheet 
            trigger={
              <Button>
                업체 등록하기
              </Button>
            }
            onRegisterSuccess={handleRegisterSuccess}
          />
        </div>
      )}
      
      {/* 데이터 표시 */}
      {!isLoading && !isError && data?.data.length > 0 && (
        <>
          {/* 테이블 뷰 */}
          {viewMode === 'table' && (
            <BrokerCompanyTable 
              companies={data.data} 
              onCompanyClick={handleCompanyClick}
            />
          )}
          
          {/* 카드 뷰 */}
          {viewMode === 'card' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.data.map((company) => (
                <BrokerCompanyCard 
                  key={company.id} 
                  company={company} 
                  onClick={() => handleCompanyClick(company)}
                />
              ))}
            </div>
          )}
          
          {/* 페이지네이션 */}
          <BrokerCompanyPagination 
            currentPage={data.page} 
            totalPages={data.totalPages} 
            totalItems={data.total}
            pageSize={data.pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}
      
      {/* 업체 수정 시트 */}
      {selectedCompany && (
        <BrokerCompanyRegisterSheet
          company={selectedCompany}
          mode="edit"
          onUpdateSuccess={handleUpdateSuccess}
          trigger={<div className="hidden" />} // 숨겨진 트리거
          open={isEditSheetOpen}
          onOpenChange={setIsEditSheetOpen}
        />
      )}
    </div>
  );
} 