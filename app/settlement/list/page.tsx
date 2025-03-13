"use client";

import React, { useCallback, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList,
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { Home, ListFilter, Grid3x3, CreditCard, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardDescription, CardTitle, CardFooter } from "@/components/ui/card";
import { useSettlementStore } from "@/store/settlement-store";
import { getSettlementsByPage } from "@/utils/mockdata/mock-settlements";
import { SettlementSearch } from "@/components/settlement/settlement-search";
import { SettlementTable } from "@/components/settlement/settlement-table";
import { SettlementCard } from "@/components/settlement/settlement-card";
import { SettlementDetailSheet } from "@/components/settlement/settlement-detail-sheet";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn, formatCurrency } from "@/lib/utils";

// 총 정산액 요약 카드 컴포넌트
function SettlementSummaryCard({ data, isLoading }: { data: any, isLoading: boolean }) {
  // 총 정산액 계산
  const totalAmount = useMemo(() => {
    if (!data || !data.data || data.data.length === 0) return 0;
    return data.data.reduce((sum: number, settlement: any) => sum + settlement.finalAmount, 0);
  }, [data]);

  // 총 건수
  const totalCount = data?.pagination?.total || 0;

  return (
    <Card className="mb-6 bg-primary/5">
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground mb-1 flex items-center">
              <CreditCard className="mr-1 h-4 w-4" />
              검색된 정산 총액
            </span>
            <span className="text-2xl font-bold">
              {isLoading ? (
                <div className="h-8 w-32 animate-pulse rounded bg-muted"></div>
              ) : (
                `${formatCurrency(totalAmount)}원`
              )}
            </span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground mb-1">조회된 정산 건수</span>
            <span className="text-2xl font-bold">
              {isLoading ? (
                <div className="h-8 w-16 animate-pulse rounded bg-muted"></div>
              ) : (
                `${totalCount}건`
              )}
            </span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground mb-1">평균 정산액</span>
            <span className="text-2xl font-bold">
              {isLoading ? (
                <div className="h-8 w-24 animate-pulse rounded bg-muted"></div>
              ) : totalCount > 0 ? (
                `${formatCurrency(Math.round(totalAmount / totalCount))}원`
              ) : (
                "0원"
              )}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SettlementListPage() {
  // Zustand 스토어에서 상태 및 액션 가져오기
  const {
    viewMode,
    setViewMode,
    filter,
    currentPage,
    pageSize,
    setCurrentPage,
  } = useSettlementStore();

  // 디버깅을 위한 로그 추가
  useEffect(() => {
    console.log('Filter in SettlementListPage:', filter);
  }, [filter]);

  // 정산 목록 데이터 조회
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["settlements", currentPage, pageSize, filter],
    queryFn: () => {
      console.log('Query function called with:', {
        currentPage,
        pageSize,
        departureCity: filter.departureCity,
        arrivalCity: filter.arrivalCity,
        driverName: filter.driverName,
        searchTerm: filter.searchTerm,
        status: filter.status,
        startDate: filter.startDate,
        endDate: filter.endDate,
        minAmount: filter.minAmount,
        maxAmount: filter.maxAmount,
        orderId: filter.orderId
      });
      
      return getSettlementsByPage(
        currentPage,
        pageSize,
        filter.departureCity,
        filter.arrivalCity,
        filter.driverName,
        filter.searchTerm,
        filter.status,
        filter.startDate,
        filter.endDate,
        filter.minAmount,
        filter.maxAmount,
        filter.orderId
      );
    },
    staleTime: 1000 * 60, // 1분
  });

  // 필터 변경 시 데이터 다시 조회
  useEffect(() => {
    refetch();
  }, [currentPage, pageSize, filter, refetch]);

  // 페이지 변경 핸들러
  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
    },
    [setCurrentPage]
  );

  // 총 페이지 수 계산
  const totalPages = Math.ceil((data?.pagination.total || 0) / pageSize);

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
              <BreadcrumbItem>
                <BreadcrumbPage>정산 현황</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <main className="flex flex-1 flex-col p-4 pt-0">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div> 
              <CardTitle>정산 현황</CardTitle>
              <CardDescription>정산 목록을 확인할 수 있습니다.</CardDescription>
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
            {/* 검색 필터 */}
            <SettlementSearch />

            {/* 정산 요약 카드 */}
            <SettlementSummaryCard data={data} isLoading={isLoading} />

            {/* 로딩 상태 */}
            {isLoading && (
              <div className="py-12 text-center text-lg text-muted-foreground">
                데이터를 불러오는 중...
              </div>
            )}

            {/* 에러 상태 */}
            {isError && (
              <div className="py-12 text-center text-lg text-red-500">
                데이터 조회 중 오류가 발생했습니다.
                <Button
                  variant="outline"
                  className="ml-2"
                  onClick={() => refetch()}
                >
                  다시 시도
                </Button>
              </div>
            )}

            {/* 데이터 표시 */}
            {!isLoading && !isError && data && (
              <>
                {/* 뷰 모드에 따라 테이블 또는 카드 형태로 표시 */}
                {viewMode === "table" ? (
                  <SettlementTable
                    settlements={data.data}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                ) : (
                  <SettlementCard
                    settlements={data.data}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>
        
        {/* 정산 상세 정보 모달 */}
        <SettlementDetailSheet />
      </main>
    </>
  );
} 