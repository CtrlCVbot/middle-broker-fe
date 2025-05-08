"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList,
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { ListFilter, Grid3x3, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrderStore } from "@/store/order-store";
// 기존 Mock 데이터 관련 임포트 주석 처리
// import { getOrdersByPage } from "@/utils/mockdata/mock-orders";
// 실제 API 서비스 임포트
import { fetchOrders } from "@/services/order-service";
import { mapApiResponseToOrderList } from "@/utils/data-mapper";
import { handleApiError } from "@/utils/api-error-handler";
import { toast } from "@/components/ui/use-toast";

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
import { OrderFlowStatus, OrderVehicleType, OrderVehicleWeight } from "@/types/order-ver01";
import { IOrderFilter, OrderStatusType } from "@/types/order-ver01";
import { OrderOverview } from "@/components/order/order-overview";
import { OrderCard as OrderCardOverview } from "@/components/order/overview/order-card";
import { OverviewTopCard } from "@/components/order/overview/overview-top-card";
import { RevenueCard } from "@/components/order/overview/revenue-card";
import { SpendingCard } from "@/components/order/overview/spending-card";
import { AverageValueCard } from "@/components/order/overview/average-value-card";
import { WeekReportCard } from "@/components/order/overview/week-report-card";
import { EarningsCard } from "@/components/order/overview/earning-card";

// 프론트 상태와 백엔드 API 파라미터 간 매핑 함수
const mapFilterToApiParams = (filter: IOrderFilter) => {
  // 상태 매핑
  let flowStatus: OrderFlowStatus | undefined;
  if (filter.status) {
    const statusMap: Record<OrderStatusType, OrderFlowStatus> = {
      '배차대기': '배차대기',
      '배차완료': '배차완료',
      '상차완료': '상차완료',
      '운송중': '운송중',
      '하차완료': '하차완료',
      '운송마감': '운송완료'
    };
    flowStatus = statusMap[filter.status] as OrderFlowStatus;
  }

  return {
    keyword: filter.searchTerm,
    flowStatus,
    vehicleType: filter.vehicleType as OrderVehicleType,
    vehicleWeight: filter.weight as OrderVehicleWeight,
    pickupCity: filter.departureCity,
    deliveryCity: filter.arrivalCity,
    startDate: filter.startDate,
    endDate: filter.endDate,
  };
};

export default function OrderListPage() {
  // 에러 상태 관리를 위한 추가 state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
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

  // 화물 목록 데이터 조회 - 실제 API 연동
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["orders", currentPage, pageSize, filter],
    queryFn: async () => {
      try {
        console.log('Query function called with:', {
          currentPage,
          pageSize,
          filter
        });
        
        // API 파라미터 매핑
        const apiParams = {
          page: currentPage,
          pageSize,
          ...mapFilterToApiParams(filter)
        };
        
        // API 호출
        const response = await fetchOrders(apiParams);
        console.log('API 호출 응답:', response);
        
        // 응답이 없거나 형식이 잘못된 경우
        if (!response || !response.data) {
          throw new Error('유효하지 않은 응답 형식입니다.');
        }
        
        // 응답 데이터 매핑
        const mappedData = mapApiResponseToOrderList(response);
        return mappedData;
      } catch (error) {
        console.error('화물 목록 조회 에러:', error);
        const message = error instanceof Error ? error.message : '화물 목록을 불러오는 데 실패했습니다.';
        setErrorMessage(message);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5분 캐시
    retry: 1, // 실패 시 1번 재시도
  });

  // 필터 변경 시 데이터 다시 조회
  useEffect(() => {
    refetch().catch(err => {
      console.error('데이터 갱신 에러:', err);
      toast({
        variant: "destructive",
        title: "데이터 갱신 실패",
        description: "화물 목록을 갱신하는 중에 오류가 발생했습니다."
      });
    });
  }, [currentPage, pageSize, filter, refetch]);

  // 페이지 변경 핸들러
  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
    },
    [setCurrentPage]
  );

  // 총 페이지 수 계산
  const totalPages = data ? Math.ceil(data.pagination.total / pageSize) : 0;

  // 다시 시도 버튼 클릭 핸들러
  const handleRetry = useCallback(() => {
    setErrorMessage(null);
    refetch().catch(err => {
      console.error('재시도 에러:', err);
      setErrorMessage('재시도 중 오류가 발생했습니다.');
    });
  }, [refetch]);

  

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
      
      <main>
        <Card className="border-none shadow-none">
          <CardHeader>            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle>운송 목록</CardTitle>
                <CardDescription>배차 요청한 화물의 운송 현황을 확인할 수 있습니다.</CardDescription>
              </div>
              <ToggleGroup type="single" className="flex gap-1" value={viewMode} onValueChange={(value: string) => value && setViewMode(value as 'table' | 'card')}>
                <ToggleGroupItem value="table" aria-label="테이블 보기">
                  <ListFilter className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="card" aria-label="카드 보기">
                  <Grid3x3 className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </CardHeader>
          <CardContent>
            <div className="gap-4">  
              {/* 요약 영역 */}
              <div className="mb-2 bg-gray-500 shadow-md rounded-lg">
                <OverviewTopCard conversionRate={30.5} />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 p-6">
                  
                  <OrderCardOverview ordersNumber={2095} changePercentage={4.09} progress={63} />
                  <RevenueCard revenue={12095} changePercentage={-5.08} />
                  <AverageValueCard value={80.5} />
                  
                  {/* <SpendingCard expenses={12095} />
                  <EarningsCard current={12095} target={45000} />
                  <WeekReportCard revenue={14000} /> */}
                </div>
              </div>

              {/* 검색 영역 */}
              <Card>
                <CardContent>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <OrderSearch />                    
                  </div>

                  {/* 로딩 상태 - 개선된 UI */}
                  {isLoading ? (
                    <div className="py-12 text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <p className="mt-2 text-muted-foreground">데이터를 불러오는 중...</p>
                    </div>
                  ) : isError || errorMessage ? (
                    // 에러 상태 - 개선된 UI
                    <div className="py-12 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
                        <span className="text-red-500 text-2xl">!</span>
                      </div>
                      <p className="mt-2 text-red-500">
                        {errorMessage || (error instanceof Error ? error.message : "데이터 조회 중 오류가 발생했습니다.")}
                      </p>
                      <Button
                        variant="outline"
                        className="mt-2"
                        onClick={handleRetry}
                      >
                        다시 시도
                      </Button>
                    </div>
                  ) : (
                    <>
                      {/* 데이터 표시 */}                      
                      {!data || data.data.length === 0 ? (
                        <div className="py-16 text-center text-muted-foreground">
                          등록된 운송 요청이 없습니다.
                        </div>
                      ) : (
                        //뷰 모드에 따라 테이블 또는 카드 형태로 표시
                        viewMode === "table" ? (
                          <OrderTable
                            orders={data.data as any}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                          />
                        ) : (
                          <OrderCard
                            orders={data.data as any}
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

          </CardContent>
            
          
        </Card>
        {/* 화물 상세 정보 모달 */}
        <OrderDetailSheet />
      </main>
    </>
  );
} 