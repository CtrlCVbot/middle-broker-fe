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
import { Home, Building, Info, Grid3x3, ListFilter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useBrokerCompanyStore } from "@/store/broker-company-store";
import { getBrokerCompaniesByPage } from "@/utils/mockdata/mock-broker-companies";
import { BrokerCompanySearch } from "@/components/broker/company/broker-company-search";
import { BrokerCompanyTable } from "@/components/broker/company/broker-company-table";
import { BrokerCompanyCard } from "@/components/broker/company/broker-company-card";
import { BrokerCompanyPagination } from "@/components/broker/company/broker-company-pagination";
import { BrokerCompanyActionButtons } from "@/components/broker/company/broker-company-action-buttons";
import { BrokerCompanyRegisterSheet } from "@/components/broker/company/broker-company-register-sheet";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn, formatCurrency } from "@/lib/utils";
import { IBrokerCompany } from "@/types/broker-company";
import { toast } from "sonner";
import { ToggleGroup } from "@/components/ui/toggle-group";
import { ToggleGroupItem } from "@/components/ui/toggle-group";

// 결과 타입 정의
interface CompanyQueryResult {
  data: IBrokerCompany[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function BrokerCompanyPage() {
  // 마지막 새로고침 시간
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Zustand 스토어에서 상태 및 액션 가져오기
  const {
    viewMode,
    setViewMode,
    filter,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    selectedCompanyIds,
    clearSelectedCompanyIds,
  } = useBrokerCompanyStore();

  // 선택된 업체 상태 관리
  const [selectedCompany, setSelectedCompany] = useState<IBrokerCompany | null>(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

  // 업체 목록 데이터 조회
  const { data, isLoading, isError, refetch } = useQuery<CompanyQueryResult>({
    queryKey: ["brokerCompanies", filter, currentPage, pageSize, lastRefreshed],
    queryFn: () => getBrokerCompaniesByPage(currentPage, pageSize, filter),
    staleTime: 1000 * 60 * 5, // 5분
  });

  // 디버깅을 위한 로그 추가
  useEffect(() => {
    console.log('Filter in BrokerCompanyPage:', filter);
  }, [filter]);

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

  // 업체 클릭 핸들러
  const handleCompanyClick = (company: IBrokerCompany) => {
    setSelectedCompany(company);
    setIsEditSheetOpen(true);
  };

  // 업체 수정 완료 핸들러
  const handleUpdateSuccess = () => {
    setLastRefreshed(new Date());
    refetch();
    toast.success(`업체 정보가 수정되었습니다.`);
  };

  // 활성 및 비활성 업체 수 계산
  const getCompanySummary = () => {
    if (!data || !data.total) return { total: 0, active: 0, inactive: 0 };
    
    const activeCount = data.data.filter(company => company.status === '활성').length;
    const inactiveCount = data.data.filter(company => company.status === '비활성').length;
    
    // 현재 페이지의 활성/비활성 비율을 전체에 적용
    const estimatedActive = Math.round((activeCount / data.data.length) * data.total);
    const estimatedInactive = data.total - estimatedActive;
    
    return {
      total: data.total,
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
                {/* <span className="text-xs text-muted-foreground px-4">
                  마지막 업데이트: {lastRefreshed.toLocaleTimeString()}
                </span> */}
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
            <div className="flex justify-center items-center h-40">
              <div className="text-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-2 text-muted-foreground">업체 목록을 불러오는 중입니다...</p>
              </div>
            </div>
          )}

          {/* 에러 상태 */}
          {isError && (
            <div className="flex justify-center items-center h-40">
              <div className="text-center text-destructive">
                <div className="mx-auto">❌</div>
                <p className="mt-2">업체 목록을 불러오는 도중 오류가 발생했습니다.</p>
                <button
                  onClick={() => refetch()}
                  className="mt-2 text-sm text-primary hover:underline"
                >
                  다시 시도
                </button>
              </div>
            </div>
          )}

          {/* 업체 목록 테이블 또는 카드 */}
          {!isLoading && !isError && data && (
            <>
              <div className={cn(viewMode === 'table' ? 'block' : 'hidden')}>
                <BrokerCompanyTable
                  companies={data.data}
                  onCompanyClick={handleCompanyClick}
                />
              </div>
              <div className={cn(viewMode === 'card' ? 'block' : 'hidden')}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data?.data?.map((company) => (
                    <BrokerCompanyCard
                      key={company.id}
                      company={company}
                      onClick={() => handleCompanyClick(company)}
                    />
                  ))}
                </div>
              </div>

              {/* 페이지네이션 */}
              {data.totalPages > 0 && (
                <BrokerCompanyPagination
                  currentPage={data.page}
                  totalPages={data.totalPages}
                  pageSize={data.pageSize}
                  totalItems={data.total}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              )}
            </>
          )}
        </div>
        </CardContent>
      </Card>

      {/* 마지막 부분에 업체 수정 시트 추가 */}
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
    </main>
    
    </>
  );
} 