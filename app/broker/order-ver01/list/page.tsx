"use client";

//react
import React, { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

//ui
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList,
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { ListFilter, Grid3x3, RotateCcw, ThumbsUp, PowerOff, Power, Loader2 } from "lucide-react";
import { toast } from "sonner";

//store
import { useBrokerOrderStore } from "@/store/broker-order-store";

//service
import { getBrokerDispatchList } from "@/services/order-service";
import { acceptOrders } from "@/services/broker-dispatch-service";

//component
import { BrokerOrderSearch as BrokerOrderSearchVer01 } from "@/components/broker/order/broker-order-search-ver01";
import { BrokerOrderTable as BrokerOrderTableVer01 } from "@/components/broker/order/broker-order-table-ver01";
import { BrokerOrderTabs } from "@/components/broker/order/broker-order-tabs";
import { BrokerOrderCard } from "@/components/broker/order/broker-order-card";
import { BrokerOrderDetailSheet as BrokerOrderDetailSheetVer02 } from "@/components/broker/order/broker-order-detail-sheet-ver02";
import { BrokerOrderAcceptModal } from "@/components/broker/order/broker-order-accept-modal";

//utils
import { cn, formatCurrency } from "@/lib/utils";
import { getCurrentUser } from '@/utils/auth';

//types
import { BrokerOrderStatusType } from "@/types/broker-order";

export default function BrokerOrderListPage() {
  // 자동 새로고침 상태
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);

  // Zustand 스토어에서 상태 및 액션 가져오기
  const {
    viewMode,
    setViewMode,
    filter,
    currentPage,
    pageSize,
    setCurrentPage,
    activeTab,
    selectedOrders,
    deselectAllOrders,
    filterOptions,
    lastRefreshed,
    setLastRefreshed
  } = useBrokerOrderStore();
  
  

  // 디버깅을 위한 로그 추가
  useEffect(() => {
    console.log('Filter in BrokerOrderListPage:', filter);
  }, [filter]);

  // 화물 목록 데이터 조회
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["brokerOrders", currentPage, pageSize, filter, lastRefreshed, activeTab],
    queryFn: async () => {
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
        manager: filter.manager,
        activeTab
      });
      
      // API 필터 구성
      const apiFilter = {
        vehicleType: filter.vehicleType,
        vehicleWeight: filter.weight,
        status: filter.status,
        startDate: filter.startDate,
        endDate: filter.endDate,
        keyword: filter.searchTerm,
        // pickupCity와 deliveryCity로 변환
        pickupCity: filter.departureCity,
        deliveryCity: filter.arrivalCity,
        // 브로커 관련 필터
        brokerCompanyId: filter.manager, // 실제 구현 시 적절히 매핑 필요
        // 탭에 따라 hasDispatch 값 설정
        hasDispatch: activeTab === 'dispatched' ? 'true' : 
                    activeTab === 'waiting' ? 'false' : undefined,
      };
      
      // API 호출
      try {
        const result = await getBrokerDispatchList(
          currentPage,
          pageSize,
          apiFilter
        );
        
        // 디버깅: API 응답 확인
        console.log('API 응답 데이터:', result);
        
        // 데이터가 비어있는지 확인
        if (!result.data || result.data.length === 0) {
          console.warn('API에서 반환된 데이터가 없습니다.');
        }
        
        return result;
      } catch (error) {
        console.error('API 호출 중 오류 발생:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60, // 1분
  });

  // 응답 데이터 디버깅
  useEffect(() => {
    if (data) {
      console.log('쿼리 결과 데이터:', data);
    }
  }, [data]);

  // 필터 변경 시 데이터 다시 조회
  useEffect(() => {
    refetch();
  }, [currentPage, pageSize, filter, activeTab, refetch]);
  
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
  const handleStatusChange = async (orderId: string, newStatus: BrokerOrderStatusType) => {
    try {
      // 배차 상태 변경 API 호출 (broker-dispatch-service.ts의 changeOrderStatus 함수 사용)
      const { changeOrderStatus } = await import('@/services/broker-dispatch-service');
      await changeOrderStatus(orderId, newStatus);
      
      toast.success(`화물 ${orderId}의 상태가 '${newStatus}'로 변경되었습니다.`);
      handleManualRefresh(); // 데이터 새로고침
    } catch (error: any) {
      toast.error(`상태 변경 실패: ${error.message || '알 수 없는 오류'}`);
    }
  };
  
  // 운송비 수정 핸들러
  const handleEditTransportFee = async (orderId: string) => {
    try {
      // 배차 상세 정보 조회
      const { getBrokerDispatchDetail } = await import('@/services/order-service');
      const dispatchDetail = await getBrokerDispatchDetail(orderId);
      
      // 여기서는 알림만 표시하지만, 실제로는 모달을 열어 수정 기능 구현
      toast.info(`화물 ${orderId}의 운송비 정보 수정 화면을 준비 중입니다.`);
    } catch (error: any) {
      toast.error(`운송비 정보 조회 실패: ${error.message || '알 수 없는 오류'}`);
    }
  };
  
  // 엑셀 내보내기 핸들러
  const handleExportExcel = (orderId: string) => {
    toast.info(`화물 ${orderId}의 정보를 엑셀로 내보내는 기능을 준비 중입니다.`);
  };
  
  // 지도 보기 핸들러
  const handleViewMap = (orderId: string) => {
    toast.info(`화물 ${orderId}의 위치 추적 기능을 준비 중입니다.`);
  };

  // 단일 운송 수락 핸들러
  const handleAcceptOrder = (orderId: string) => {
    // 선택된 주문 배열에 추가하고 모달 열기
    const { toggleOrderSelection } = useBrokerOrderStore.getState();
    if (!selectedOrders.includes(orderId)) {
      toggleOrderSelection(orderId);
    }
    setIsAcceptModalOpen(true);
  };
  
  // 다중 운송 수락 핸들러 (모달 버튼)
  const handleOpenAcceptModal = () => {
    if (selectedOrders.length === 0) {
      toast.warning("선택된 화물이 없습니다. 화물을 먼저 선택해주세요.");
      return;
    }
    setIsAcceptModalOpen(true);
  };
 
  
  // 다중 운송 수락 제출 핸들러
  const handleAcceptSubmit = async () => {
    try {
      setIsAcceptModalOpen(false);
      
      toast.loading(`${selectedOrders.length}개 화물에 대한 운송 수락 처리 중...`);

      const currentUser = await getCurrentUser();
      if (currentUser) {
        const result = await acceptOrders(selectedOrders, currentUser);

        toast.dismiss();
        toast.success(result.message || `${selectedOrders.length}개 화물에 대한 운송 수락 처리가 완료되었습니다.`);
      } else {
        toast.error('사용자 정보를 불러올 수 없습니다.');
        return;
      }
      
      // 선택 상태 초기화 및 데이터 새로고침
      deselectAllOrders();
      handleManualRefresh();
    } catch (error: any) {
      toast.dismiss();
      toast.error(`운송 수락 처리 실패: ${error.message || '알 수 없는 오류'}`);
    }
  };
  
 
  
  // 데이터 가져오기
  const orders = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;
  
  // 탭에 따른 메시지 정의
  const getTabMessage = () => {
    if (orders.length === 0) {
      switch (activeTab) {
        case 'waiting':
          return "요청 목록이 비어있습니다. 새로운 화물 요청이 없습니다.";
        case 'dispatched':
          return "진행 중인 배차가 없습니다. 배차 상태인 화물이 없습니다.";
        default:
          return "화물이 없습니다. 필터를 조정하거나 새로고침을 시도해보세요.";
      }
    }
    return null;
  };
  
  const tabMessage = getTabMessage();

   // 로딩 중 표시
   const renderLoading = () => (
    <div className="flex justify-center items-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  console.log('orders0', orders);

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
              <BreadcrumbPage>실시간 주선 현황</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
    <main>
      {/* 제목 및 액션 버튼 */}
      
      <Card  className="border-none shadow-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <div> 
            <CardTitle>실시간 주선 현황</CardTitle>
            <CardDescription className="hidden md:block">주선 화물 목록을 확인할 수 있습니다.
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
          {/* isLoading 상태일 때 로딩 표시 */}
          {isLoading ? renderLoading() 
             : isError ? (
            <div className="py-8">
              <div className="text-center">데이터를 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.</div>
            </div>
          ) : (
          <Card>
            <CardContent>
              {/* 탭 네비게이션 */}
              <div className="mb-4">
                <BrokerOrderTabs />
              </div>
              
              {/* 검색 및 필터 */}
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="w-full md:w-auto">
                  <BrokerOrderSearchVer01 />   
                </div>
                <div className="flex flex-row hidden md:flex items-center mb-6 gap-2">                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={cn(autoRefreshEnabled && "bg-primary/10")}
                    onClick={toggleAutoRefresh}
                  >
                    {/* <RotateCcw className={cn("h-4 w-4 mr-1", autoRefreshEnabled && "animate-spin")} /> */}
                    {autoRefreshEnabled ? <Power className="h-4 w-4 mr-1" /> : <PowerOff className="h-4 w-4 mr-1" />}
                    자동 갱신
                  </Button>
                  <Button className="bg-primary/10" variant="outline" size="icon" onClick={handleManualRefresh}>
                    <RotateCcw className={cn("h-4 w-4", autoRefreshEnabled && "animate-spin")} />
                  </Button>
                  <Separator orientation="vertical" className="h-6" />
                  
                </div>
              </div>

              {/* 운송 수락 버튼 (요청 탭일 때만 표시) */}
              {activeTab === 'waiting' && selectedOrders.length > 0 && (
                <div className="mb-4">
                  <Button 
                    variant="default" 
                    className="text-sm" 
                    onClick={handleOpenAcceptModal}
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    선택한 {selectedOrders.length}개 화물 운송 수락
                  </Button>
                </div>
              )}

              {/* 주문 정보 */}
              {tabMessage ? (
                <div className="py-12 text-center text-lg text-muted-foreground">
                  {tabMessage}
                </div>
              ) : (
                <>
                  {viewMode === 'table' ? (
                    <BrokerOrderTableVer01
                      orders={orders}
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      onStatusChange={handleStatusChange}
                      onEditTransportFee={handleEditTransportFee}
                      onExportExcel={handleExportExcel}
                      onViewMap={handleViewMap}
                      onAcceptOrder={handleAcceptOrder}
                    />
                  ) : (
                    <BrokerOrderCard
                      orders={orders}
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      onStatusChange={handleStatusChange}
                      onEditTransportFee={handleEditTransportFee}
                      onExportExcel={handleExportExcel}
                      onViewMap={handleViewMap}
                      onAcceptOrder={handleAcceptOrder}
                    />
                  )}
                </>
              )}
            </CardContent>
          </Card>
          )}
        </CardContent>
      </Card>      
      
      {/* 상세 정보 시트 */}
      <BrokerOrderDetailSheetVer02 />
      
      {/* 운송 수락 모달 */}
      <BrokerOrderAcceptModal
        isOpen={isAcceptModalOpen}
        onClose={() => setIsAcceptModalOpen(false)}
        onAccept={handleAcceptSubmit}
        orderCount={selectedOrders.length}
      />
    </main>
    </>
  );
} 