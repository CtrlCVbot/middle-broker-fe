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
import { Home, Building, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useBrokerCompanyStore } from "@/store/broker-company-store";
import { getBrokerCompaniesByPage } from "@/utils/mockdata/mock-broker-companies";
import { BrokerCompanySearch } from "@/components/broker/company/broker-company-search";
import { BrokerCompanyTable } from "@/components/broker/company/broker-company-table";
import { BrokerCompanyCard } from "@/components/broker/company/broker-company-card";
import { BrokerCompanyPagination } from "@/components/broker/company/broker-company-pagination";
import { BrokerCompanyActionButtons } from "@/components/broker/company/broker-company-action-buttons";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { IBrokerCompany } from "@/types/broker-company";
import { toast } from "sonner";

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
    toast.info(`${company.name} 상세 정보 (추후 구현 예정)`);
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
    <div className="space-y-4">
      {/* 브레드크럼 및 사이드바 트리거 */}
      <div className="flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">
                <Home className="h-4 w-4 mr-1" />
                홈
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/broker">주선사</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>업체 관리</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <SidebarTrigger />
      </div>

      {/* 페이지 타이틀 및 요약 정보 */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Building className="h-6 w-6" /> 업체 관리
          </h1>
          <p className="text-muted-foreground">
            운송사, 주선사, 화주 등 업체 정보를 관리합니다.
          </p>
        </div>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <span className="text-primary">
                <Building className="h-4 w-4" />
              </span>
              총 업체 수
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companySummary.total}개</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <span className="text-green-500">●</span>
              활성 업체
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{companySummary.active}개</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <span className="text-red-500">●</span>
              비활성 업체
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{companySummary.inactive}개</div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* 검색 및 필터 */}
      <BrokerCompanySearch />

      {/* 액션 버튼 */}
      <BrokerCompanyActionButtons
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        onRefresh={handleManualRefresh}
        selectedIds={selectedCompanyIds}
        onClearSelection={clearSelectedCompanyIds}
      />

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
            <BrokerCompanyCard
              companies={data.data}
              onCompanyClick={handleCompanyClick}
            />
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
  );
} 