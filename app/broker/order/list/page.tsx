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
import { ListFilter, Grid3x3, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { useBrokerOrderStore } from "@/store/broker-order-store";
import { getBrokerOrdersByPage } from "@/utils/mockdata/mock-broker-orders";
import { BrokerOrderSearch } from "@/components/broker/order/broker-order-search";
import { BrokerOrderTable } from "@/components/broker/order/broker-order-table";
import { BrokerOrderCard } from "@/components/broker/order/broker-order-card";
import { BrokerOrderDetailSheet } from "@/components/broker/order/broker-order-detail-sheet";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn, formatCurrency } from "@/lib/utils";
import { BrokerOrderStatusType } from "@/types/broker-order";
import { toast } from "sonner";

import { OverviewTopCard } from "@/components/order/overview/overview-top-card";
import { RevenueCard } from "@/components/order/overview/revenue-card";
import { AverageValueCard } from "@/components/order/overview/average-value-card";
import { OrderCard as OrderCardOverview } from "@/components/order/overview/order-card";
import { SpendingCard } from "@/components/order/overview/spending-card";
import { EarningsCard } from "@/components/order/overview/earning-card";

export default function BrokerOrderListPage() {
  // 자동 새로고침 상태
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Zustand 스토어에서 상태 및 액션 가져오기
  const {
    viewMode,
    setViewMode,
    filter,
    currentPage,
    pageSize,
    setCurrentPage,
  } = useBrokerOrderStore();
  
  //const { openSheet } = useBrokerOrderDetailStore();

  // 디버깅을 위한 로그 추가
  useEffect(() => {
    console.log('Filter in BrokerOrderListPage:', filter);
  }, [filter]);

  // 화물 목록 데이터 조회
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["brokerOrders", currentPage, pageSize, filter, lastRefreshed],
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
        endDate: filter.endDate,
        callCenter: filter.callCenter,
        manager: filter.manager
      });
      
      return getBrokerOrdersByPage(
        currentPage,
        pageSize,
        filter.departureCity,
        filter.arrivalCity,
        filter.vehicleType,
        filter.weight,
        filter.searchTerm,
        filter.status,
        filter.startDate,
        filter.endDate,
        filter.callCenter,
        filter.manager
      );
    },
    staleTime: 1000 * 60, // 1분
  });

  // 필터 변경 시 데이터 다시 조회
  useEffect(() => {
    refetch();
  }, [currentPage, pageSize, filter, refetch]);
  
  // 자동 새로고침 기능
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    if (autoRefreshEnabled) {
      intervalId = setInterval(() => {
        setLastRefreshed(new Date());
        console.log("자동 새로고침 실행:", new Date().toLocaleTimeString());
      }, 30000); // 30초마다 갱신
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoRefreshEnabled]);

  // 페이지 변경 핸들러
  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
    },
    [setCurrentPage]
  );
  
  // 수동 새로고침 핸들러
  const handleManualRefresh = () => {
    setLastRefreshed(new Date());
    toast.info("화물 정보가 갱신되었습니다.");
  };
  
  // 자동 새로고침 토글 핸들러
  const toggleAutoRefresh = () => {
    setAutoRefreshEnabled(prev => !prev);
    toast.info(autoRefreshEnabled ? "자동 갱신이 중지되었습니다." : "30초마다 자동 갱신됩니다.");
  };
  
  // 배차 상태 변경 핸들러
  const handleStatusChange = (orderId: string, newStatus: BrokerOrderStatusType) => {
    // 백엔드가 구현되면 실제 API 호출로 대체
    toast.success(`화물 ${orderId}의 상태가 '${newStatus}'로 변경되었습니다.`);
    handleManualRefresh(); // 데이터 새로고침
  };
  
  // 운송비 수정 핸들러
  const handleEditTransportFee = (orderId: string) => {
    // 실제 구현 시 수정 모달 또는 시트 열기
    toast.info(`화물 ${orderId}의 운송비 정보 수정 화면을 준비 중입니다.`);
  };
  
  // 엑셀 내보내기 핸들러
  const handleExportExcel = (orderId: string) => {
    // 실제 구현 시 엑셀 다운로드 로직 추가
    toast.info(`화물 ${orderId}의 정보를 엑셀로 다운로드합니다.`);
  };
  
  // 지도 보기 핸들러
  const handleViewMap = (orderId: string) => {
    // 실제 구현 시 지도 모달 열기
    toast.info(`화물 ${orderId}의 실시간 위치를 확인하는 기능을 준비 중입니다.`);
  };

  // 총 페이지 수 계산
  const totalPages = Math.ceil((data?.pagination.total || 0) / pageSize);

  // 견적금 기준 수익
  const profitFromContract = data?.summary?.totalContractAmount ? data?.summary?.totalContractAmount - data?.summary?.totalSupplyAmount : 0;

  // 청구금 기준 수익
  const profitFromCharge = data?.summary?.totalChargeAmount ? data?.summary?.totalChargeAmount - data?.summary?.totalSupplyAmount : 0;

  // 견적금 기준 수익률
  const profitRateFromContract = data?.summary?.totalContractAmount ? (profitFromContract / data?.summary?.totalContractAmount) * 100 : 0;

  // 청구금 기준 수익률
  const profitRateFromCharge = data?.summary?.totalChargeAmount ? (profitFromCharge / data?.summary?.totalChargeAmount) * 100 : 0;


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
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/broker">                  
                  주선
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>중개 화물 현황</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>


      <main>
        {data?.summary && (
          <Card  className="border-none shadow-none">            
            <CardHeader className="flex flex-row items-center justify-between">
            <div> 
              <CardTitle>중개 화물 현황</CardTitle>
              <CardDescription className="hidden md:block">중개 화물 목록을 확인할 수 있습니다.
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
            {/* 화물 현황 요약 카드 */}   
            <div className="mb-4 bg-muted shadow-md rounded-lg">
              <OverviewTopCard conversionRate={profitRateFromCharge} />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 p-4">
                
                {/* <OrderCardOverview ordersNumber={data.summary.totalOrders} changePercentage={4.09} progress={63} /> */}
                {/* <RevenueCard revenue={12095} changePercentage={-5.08} /> */}
                <AverageValueCard value={data.summary.totalOrders} valueColor="gray-500" label="총 화물 건수" memo="총 화물 건수" />
                <AverageValueCard value={data.summary.totalContractAmount} valueColor="orange-500" label="총 견적금" memo="총 견적금" />
                <AverageValueCard value={data.summary.totalChargeAmount} valueColor="blue-500" label="총 청구금" memo="총 청구금" />
                <AverageValueCard value={data.summary.totalSupplyAmount} valueColor="red-500" label="총 공급가" memo="총 공급가" />
                <AverageValueCard value={data.summary.totalProfit} valueColor="green-500" label="총 수익" memo="총 수익" />
                {/* <SpendingCard expenses={12095} />
                <EarningsCard current={12095} target={45000} />
                <WeekReportCard revenue={14000} /> */}
              </div>
            </div>

            {/* 화물 목록 영역 */}
            <Card>   
              <CardContent>
                {/* 검색 필터 - 양끝에 배치*/}
                <div className="flex flex-col md:flex-row items-center justify-between">
                    <div className="w-full md:w-auto">
                      <BrokerOrderSearch />   
                    </div>
                    <div className="flex flex-row hidden md:flex items-center mb-6 gap-2">                  
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className={cn(autoRefreshEnabled && "bg-primary/10")}
                        onClick={toggleAutoRefresh}
                      >
                        <RotateCcw className={cn("h-4 w-4 mr-1", autoRefreshEnabled && "animate-spin")} />
                        자동 갱신 {autoRefreshEnabled ? "켜짐" : "꺼짐"}
                      </Button>
                      <Button className="bg-primary/10" variant="outline" size="icon" onClick={handleManualRefresh}>
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Separator orientation="vertical" className="h-6" />
                      
                    </div>
                </div>                           

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
                      <BrokerOrderTable
                        orders={data.data}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        onStatusChange={handleStatusChange}
                        onEditTransportFee={handleEditTransportFee}
                        onExportExcel={handleExportExcel}
                        onViewMap={handleViewMap}
                      />
                    ) : (
                      <BrokerOrderCard
                        orders={data.data}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        onStatusChange={handleStatusChange}
                        onEditTransportFee={handleEditTransportFee}
                        onExportExcel={handleExportExcel}
                        onViewMap={handleViewMap}
                      />
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </CardContent>
          </Card>
        )}
        
        {/* 화물 상세 정보 모달 */}
        <BrokerOrderDetailSheet />
      </main>
    </>
  );
} 