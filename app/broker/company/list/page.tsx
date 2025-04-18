"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList,
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { Building, Grid3x3, ListFilter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanyStore, useCompaniesLegacyFormat } from "@/store/company-store";
import { BrokerCompanySearch } from "@/components/broker/company/broker-company-search";
import { BrokerCompanyTable } from "@/components/broker/company/broker-company-table";
import { BrokerCompanyCard } from "@/components/broker/company/broker-company-card";
import { BrokerCompanyPagination } from "@/components/broker/company/broker-company-pagination";
import { BrokerCompanyActionButtons } from "@/components/broker/company/broker-company-action-buttons";
import { BrokerCompanyRegisterSheet } from "@/components/broker/company/broker-company-register-sheet";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { IBrokerCompany } from "@/types/broker-company";
import { ILegacyCompany } from "@/types/company";
import { toast } from "sonner";
import { ToggleGroup } from "@/components/ui/toggle-group";
import { ToggleGroupItem } from "@/components/ui/toggle-group";

export default function BrokerCompanyPage() {
  // 마지막 새로고침 시간
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // 새 스토어에서 상태 및 액션 가져오기
  const {
    viewMode,
    setViewMode,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
  } = useCompanyStore();

  // 선택된 업체 상태 관리 (타입 확장)
  const [selectedCompany, setSelectedCompany] = useState<IBrokerCompany | ILegacyCompany | null>(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

  // 실제 API로 데이터 조회
  const {
    legacyData,
    isLoading,
    isError,
    error,
    refetch
  } = useCompaniesLegacyFormat();
  
  // legacyData 구조 분해
  const data = legacyData?.data || [];
  const total = legacyData?.total || 0;
  const page = legacyData?.page || 1;
  const totalPages = legacyData?.totalPages || 1;

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 페이지 크기 변경 핸들러
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
  };

  // 수동 새로고침 핸들러
  const handleManualRefresh = () => {
    setLastRefreshed(new Date());
    refetch();
    toast.success('업체 목록이 새로고침되었습니다.');
  };

  // 업체 클릭 핸들러 (타입 확장)
  const handleCompanyClick = (company: IBrokerCompany | ILegacyCompany) => {
    setSelectedCompany(company);
    setIsEditSheetOpen(true);
  };

  // 업체 수정 완료 핸들러
  const handleUpdateSuccess = () => {
    setLastRefreshed(new Date());
    refetch();
    toast.success(`업체 정보가 수정되었습니다.`);
  };

  // 업체 등록 완료 핸들러
  const handleRegisterSuccess = () => {
    setLastRefreshed(new Date());
    refetch();
    toast.success(`업체가 등록되었습니다.`);
  };

  // 활성 및 비활성 업체 수 계산
  const getCompanySummary = () => {
    if (!data || !data.length) return { total: 0, active: 0, inactive: 0 };
    
    const activeCount = data.filter(company => company.status === '활성').length;
    
    // 현재 페이지의 활성/비활성 비율을 전체에 적용
    const estimatedActive = Math.round((activeCount / data.length) * total);
    const estimatedInactive = total - estimatedActive;
    
    return {
      total,
      active: estimatedActive,
      inactive: estimatedInactive,
    };
  };

  const companySummary = getCompanySummary();

  return (
    <>
    <header className="flex h-16 shrink-0 items-center gap-2">
    <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">                  
                  홈
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/broker">                  
                  주선
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />              
              <BreadcrumbItem>
                <BreadcrumbPage>업체 관리</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
    </header>
    <main className="flex flex-1 flex-col p-4 pt-0">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div> 
          <CardTitle>업체 관리</CardTitle>
          <CardDescription className="hidden md:block">운송사, 주선사, 화주 등 업체 정보를 관리합니다.
                <span className="text-xs text-muted-foreground px-4">
                  마지막 업데이트: {lastRefreshed.toLocaleTimeString()}
                </span>
          </CardDescription>
          </div>
          <div className="flex items-center gap-2">
              
          </div>
          <ToggleGroup type="single" value={viewMode} onValueChange={(value: string) => value && setViewMode(value as 'table' | 'card')}>
            <ToggleGroupItem value="table" aria-label="테이블 보기">
              <ListFilter className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="card" aria-label="카드 보기">
              <Grid3x3 className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        
        </CardHeader>
      
        <CardContent>
        <div>
          {/* 요약 카드 */}
          <Card className="mb-6 bg-primary/5 hidden md:block">
              <CardContent  className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex flex-col">
                    <span className="flex flex-row items-center gap-2 text-sm text-muted-foreground">
                      <Building className="h-4 w-4" />
                      총 업체 수
                    </span>
                    <span className="text-xl font-bold">{companySummary.total}개</span>
                  </div>   
                  <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground ">
                      <span className="text-green-500">●</span>
                      활성 업체
                    </span>
                    <span className="text-xl font-bold text-green-600">{companySummary.active}개</span>
                  </div>
                  <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">
                      <span className="text-red-500">●</span>
                      비활성 업체
                    </span>
                    <span className="text-xl font-bold text-red-600">{companySummary.inactive}개</span>
                  </div>               
              </div>
                
              </CardContent>
          </Card> 

          {/* 검색 및 필터, 액션 버튼 */}
          <div className="flex flex-col md:flex-row items-center justify-between">

            {/* 검색 및 필터 */}
            <div className="w-full md:w-auto">
              <BrokerCompanySearch />
            </div>

            {/* 액션 버튼 */}
            <div className="flex flex-col hidden md:block items-center">
              <BrokerCompanyActionButtons
                onActionSuccess={handleManualRefresh}
              />
            </div>
          </div>

          {/* 로딩 상태 */}
          {isLoading && (
            <div className="space-y-4">
              {viewMode === 'table' ? (
                Array(5).fill(0).map((_, index) => (
                  <Skeleton key={index} className="h-14 w-full rounded-md" />
                ))
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array(6).fill(0).map((_, index) => (
                    <Skeleton key={index} className="h-48 w-full rounded-md" />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 에러 상태 */}
          {isError && (
            <div className="flex flex-col justify-center items-center h-64 border rounded-md p-6 bg-red-50">
              <p className="text-red-500 mb-2">데이터를 불러오는 중 오류가 발생했습니다.</p>
              <p className="text-sm text-red-400 mb-4">{error instanceof Error ? error.message : '알 수 없는 오류'}</p>
              <button
                onClick={() => refetch()}
                className="mt-2 text-sm text-primary hover:underline"
              >
                다시 시도
              </button>
            </div>
          )}

          {/* 데이터 없음 상태 */}
          {!isLoading && !isError && data.length === 0 && (
            <div className="flex flex-col justify-center items-center h-64 border rounded-md p-6">
              <p className="text-gray-500 mb-4">등록된 업체가 없거나 검색 조건에 맞는 업체가 없습니다.</p>
              <BrokerCompanyRegisterSheet 
                trigger={
                  <button className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md">
                    업체 등록하기
                  </button>
                }
                onRegisterSuccess={handleRegisterSuccess}
              />
            </div>
          )}

          {/* 업체 목록 테이블 또는 카드 */}
          {!isLoading && !isError && data.length > 0 && (
            <>
              <div className={cn(viewMode === 'table' ? 'block' : 'hidden')}>
                <BrokerCompanyTable
                  companies={data}
                  onCompanyClick={handleCompanyClick}
                />
              </div>
              <div className={cn(viewMode === 'card' ? 'block' : 'hidden')}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.map((company) => (
                    <BrokerCompanyCard
                      key={company.id}
                      company={company}
                      onClick={() => handleCompanyClick(company)}
                    />
                  ))}
                </div>
              </div>

              {/* 페이지네이션 */}
              {totalPages > 0 && (
                <BrokerCompanyPagination
                  currentPage={page}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  totalItems={total}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              )}
            </>
          )}
        </div>
        </CardContent>
      </Card>

      {/* 업체 수정 시트 */}
      {selectedCompany && (
        <BrokerCompanyRegisterSheet
          company={selectedCompany as IBrokerCompany}
          mode="edit"
          onUpdateSuccess={handleUpdateSuccess}
          trigger={<div className="hidden" />} // 숨겨진 트리거
          open={isEditSheetOpen}
          onOpenChange={setIsEditSheetOpen}
        />
      )}
    </main>
    
    </>
  );
} 