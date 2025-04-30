"use client";

import React, { useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList,
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { ListFilter, Grid3x3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { useOrderStore } from "@/store/order-store";
import { getOrdersByPage } from "@/utils/mockdata/mock-orders";
import { OrderSearch } from "@/components/order/order-search";
//import { OrderTable } from "@/components/order/order-table";
import { OrderTable } from "@/components/order/order-table-ver01";
//import { OrderCard } from "@/components/order/order-card";
import { OrderCard } from "@/components/order/order-card-ver01";
import { OrderDetailSheet } from "@/components/order/order-detail-sheet";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { StatusFlow } from "@/components/order/status-badge";


export default function OrderListPage() {
  // Zustand 스토어에서 상태 및 액션 가져오기
  const {
    viewMode,
    setViewMode,
    filter,
    currentPage,
    pageSize,
    setCurrentPage,
  } = useOrderStore();

  // 디버깅을 위한 로그 추가
  useEffect(() => {
    console.log('Filter in OrderListPage:', filter);
  }, [filter]);

  // 화물 목록 데이터 조회
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["orders", currentPage, pageSize, filter],
    queryFn: () => {
      console.log('Query function called with:', {
        currentPage,
        pageSize,
        departureCity: filter.departureCity,
        arrivalCity: filter.arrivalCity,
        vehicleType: filter.vehicleType,
        weight: filter.weight,
        searchTerm: filter.searchTerm,
        status: filter.status,
        startDate: filter.startDate,
        endDate: filter.endDate
      });
      
      return getOrdersByPage(
        currentPage,
        pageSize,
        filter.departureCity,
        filter.arrivalCity,
        filter.vehicleType,
        filter.weight,
        filter.searchTerm,
        filter.status,
        filter.startDate,
        filter.endDate
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
      <header className="flex h-16 shrink-0 items-center gap-2 border-b">
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
                <BreadcrumbPage>운송 목록</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      
      {/* 데스크톱 환경에서는 2단 컬럼 레이아웃으로 표시 */}
      {/* <main className="flex flex-1 flex-col p-4 pt-0"> */}
      <main className="min-h-screen flex flex-col items-center pt-4">
        <div className="container">
          <div className="flex flex-col space-y-4">

            {/* 헤더 영역 */}
            {/* <div className="flex items-center justify-between py-4 grid grid-rows-2 gap-0">
              <h1 className="text-2xl font-semibold">
                운송 목록
              </h1>              
              <div className="text-sm text-muted-foreground mt-0">배차 요청한 화물의 운송 현황을 확인할 수 있습니다.</div>
            </div> */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 gap-2">
              <div>
                <h1 className="text-2xl font-semibold">운송 목록</h1>
                <p className="text-sm text-muted-foreground mt-1">배차 요청한 화물의 운송 현황을 확인할 수 있습니다.</p>
              </div>
              <ToggleGroup type="single" className="flex gap-1" value={viewMode} onValueChange={(value: string) => value && setViewMode(value as 'table' | 'card')}>
                <ToggleGroupItem value="table" aria-label="테이블 보기">
                  <ListFilter className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="card" aria-label="카드 보기">
                  <Grid3x3 className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
              {/* 추후 버튼 추가 자리 확보 */}
            </div>
          

            {/* 본문 영역 */}
            <div className="gap-4">  
              <Card>
                {/* <CardHeader className="flex flex-row items-center justify-between">
                  <div> 
                    <CardTitle>화물 현황</CardTitle>
                    <CardDescription>화물 목록을 확인할 수 있습니다.</CardDescription>
                  </div>                
                </CardHeader> */}

                <CardContent>
                  {/* 검색 필터 */}
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <OrderSearch />                    
                  </div>

                  {/* 로딩 상태 */}
                  {isLoading ? (
                    <div className="py-12 text-center text-lg text-muted-foreground">
                      데이터를 불러오는 중...
                    </div>
                  ) : isError ? (
                    // 에러 상태
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
                  ) : (
                    <>
                      {/* 데이터 표시 */}                      
                      {data?.data.length === 0 ? (
                        <div className="py-16 text-center text-muted-foreground">
                          등록된 운송 요청이 없습니다.
                        </div>
                      ) : (
                        //뷰 모드에 따라 테이블 또는 카드 형태로 표시
                        viewMode === "table" ? (
                          <OrderTable
                            orders={data?.data || []}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                          />
                        ) : (
                          <OrderCard
                            orders={data?.data || []}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                          />
                        )
                      )}
                    </>
                  )}

                 
                </CardContent>

              </Card>
            </div>

          </div>
        </div>
        
        {/* 화물 상세 정보 모달 */}
        <OrderDetailSheet />
      </main>
    </>
  );
} 