"use client";

import React, { useEffect } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription, 
  SheetFooter 
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { useOrderDetailStore } from "@/store/order-detail-store";
import { getOrderDetailById } from "@/utils/mockdata/mock-orders-detail";
import { OrderProgress } from "./order-progress";
import { OrderInfoCard } from "./order-info-card";
import { OrderStatusLog } from "./order-status-log";
import { OrderActionButtons } from "./order-action-buttons";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CalendarClock, AlertTriangle } from "lucide-react";
import { Label } from "@/components/ui/label";

export function OrderDetailSheet() {
  const { 
    isSheetOpen, 
    selectedOrderId, 
    closeSheet, 
    setOrderDetail, 
    setLoading, 
    setError 
  } = useOrderDetailStore();
  
  // TanStack Query를 사용하여 화물 상세 정보 조회
  const { 
    data: orderData, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ["orderDetail", selectedOrderId],
    queryFn: () => selectedOrderId ? getOrderDetailById(selectedOrderId) : Promise.reject("화물 ID가 없습니다."),
    enabled: !!selectedOrderId && isSheetOpen,
    staleTime: 1000 * 60 * 5, // 5분
  });
  
  // 상태 업데이트
  useEffect(() => {
    setLoading(isLoading);
    
    if (isError && error instanceof Error) {
      setError(error.message);
    } else {
      setError(null);
    }
    
    if (orderData) {
      setOrderDetail(orderData);
    }
  }, [orderData, isLoading, isError, error, setLoading, setError, setOrderDetail]);
  
  // 화폐 단위 포맷팅
  const formatCurrency = (amount: string) => {
    return amount;
  };
  
  // 모바일 화면 감지
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  
  return (
    <Sheet open={isSheetOpen} onOpenChange={(open) => !open && closeSheet()}>
      <SheetContent 
        side={isMobile ? "bottom" : "right"} 
        className={cn(
          "sm:max-w-xl md:max-w-2xl overflow-auto p-0",
          isMobile ? "h-[80vh]" : "w-full"
        )}
      >
        {/* 화면에 노출되지 않지만 접근성을 위한 타이틀 */}
        <SheetTitle className="sr-only">화물 상세 정보</SheetTitle>
        
        {isLoading ? (
          // 로딩 상태
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">화물 정보를 불러오는 중...</p>
            </div>
          </div>
        ) : isError ? (
          // 에러 상태
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-destructive">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
              <p className="text-lg font-semibold">오류가 발생했습니다</p>
              <p className="text-sm text-muted-foreground mt-2">
                {error instanceof Error ? error.message : "화물 정보를 불러오는데 실패했습니다."}
              </p>
            </div>
          </div>
        ) : orderData ? (
          // 데이터 로드 완료
          <ScrollArea className="h-full max-h-screen">
            {/* 헤더 - 기본 정보 */}
            <SheetHeader className="px-6 py-4 sticky top-0 bg-background z-10 border-b">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-xl font-bold">
                  화물 번호: {orderData.orderNumber}
                </SheetTitle>
                <Badge 
                  variant={orderData.status === "운송마감" ? "default" : "secondary"}
                  className="text-sm px-3 py-1"
                >
                  {orderData.status}
                </Badge>
              </div>
              <div className="flex flex-col gap-1 mt-1">
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarClock className="h-4 w-4 mr-2" />
                  등록일시: {orderData.registeredAt}
                </div>
                <p className="text-lg font-semibold mt-1">
                  운송비: {formatCurrency(orderData.amount)}
                </p>
              </div>
            </SheetHeader>
            
            <div className="px-6 py-4 space-y-6">
              {/* 배차 상태 Progress */}
              <div>
                <h3 className="text-base font-medium mb-3">배차 진행 상태</h3>
                <OrderProgress currentStatus={orderData.statusProgress} />
              </div>
              
              <Separator />
              
              {/* 출발지 및 도착지 정보 */}
              <div>
                <h3 className="text-base font-medium mb-3">운송 정보</h3>
                <OrderInfoCard 
                  departure={orderData.departure} 
                  destination={orderData.destination} 
                />
              </div>
              
              <Separator />
              
              {/* 화물 정보 및 차량 정보 */}
              <div>
                <h3 className="text-base font-medium mb-3">화물 및 차량 정보</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 화물 정보 */}
                  <div className="space-y-2 bg-secondary/30 rounded-md p-3">
                    <h4 className="font-medium">화물 정보</h4>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="text-muted-foreground">화물 종류</div>
                      <div className="col-span-2 font-medium">{orderData.cargo.type}</div>
                      
                      {orderData.cargo.weight && (
                        <>
                          <div className="text-muted-foreground">중량</div>
                          <div className="col-span-2 font-medium">{orderData.cargo.weight}</div>
                        </>
                      )}
                      
                      {orderData.cargo.options && (
                        <>
                          <div className="text-muted-foreground">옵션</div>
                          <div className="col-span-2 font-medium">
                            {orderData.cargo.options.join(", ")}
                          </div>
                        </>
                      )}
                      
                      {orderData.cargo.remark && (
                        <>
                          <div className="text-muted-foreground">비고</div>
                          <div className="col-span-2 font-medium text-xs">
                            {orderData.cargo.remark}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* 차량 정보 */}
                  <div className="space-y-2 bg-secondary/30 rounded-md p-3">
                    <h4 className="font-medium">차량 정보</h4>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="text-muted-foreground">차량 종류</div>
                      <div className="col-span-2 font-medium">{orderData.vehicle.type}</div>
                      
                      {orderData.vehicle.licensePlate && (
                        <>
                          <div className="text-muted-foreground">차량 번호</div>
                          <div className="col-span-2 font-medium">{orderData.vehicle.licensePlate}</div>
                        </>
                      )}
                      
                      {orderData.vehicle.driver && (
                        <>
                          <div className="text-muted-foreground">운전자</div>
                          <div className="col-span-2 font-medium">
                            {orderData.vehicle.driver.name} ({orderData.vehicle.driver.contact})
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* 화물 상태 변화 로그 */}
              <OrderStatusLog logs={orderData.logs} />
            </div>
            
            {/* 푸터 - 액션 버튼 */}
            <SheetFooter className="px-6 py-4 border-t mt-4">
              <OrderActionButtons orderNumber={orderData.orderNumber} />
            </SheetFooter>
          </ScrollArea>
        ) : null}
      </SheetContent>
    </Sheet>
  );
} 