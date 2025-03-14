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
import { useBrokerOrderDetailStore } from "@/store/broker-order-detail-store";
import { getBrokerOrderDetailById } from "@/utils/mockdata/mock-broker-orders-detail";
import { BrokerOrderProgress } from "./broker-order-progress";
import { BrokerOrderInfoCard } from "./broker-order-info-card";
import { BrokerOrderDriverInfoCard } from "./broker-order-driver-info-card";
import { BrokerOrderSettlementInfoCard } from "./broker-order-settlement-info-card";
import { BrokerOrderStatusLog } from "./broker-order-status-log";
import { BrokerOrderActionButtons } from "./broker-order-action-buttons";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CalendarClock, AlertTriangle, Truck, CreditCard, Package } from "lucide-react";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";

export function BrokerOrderDetailSheet() {
  const { 
    isSheetOpen, 
    selectedOrderId, 
    closeSheet, 
    setOrderDetail, 
    setLoading, 
    setError 
  } = useBrokerOrderDetailStore();
  
  // TanStack Query를 사용하여 화물 상세 정보 조회
  const { 
    data: orderData, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ["brokerOrderDetail", selectedOrderId],
    queryFn: () => selectedOrderId ? getBrokerOrderDetailById(selectedOrderId) : Promise.reject("화물 ID가 없습니다."),
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
  
  return (
    <Sheet open={isSheetOpen} onOpenChange={(open) => !open && closeSheet()}>
      <SheetContent 
        side="top" 
        className="sm:max-w-full md:max-w-full overflow-auto p-0 h-[80vh]"
      >
        {/* 화면에 노출되지 않지만 접근성을 위한 타이틀 */}
        <SheetTitle className="sr-only">중개 화물 상세 정보</SheetTitle>
        
        {isLoading ? (
          // 로딩 상태
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">중개 화물 정보를 불러오는 중...</p>
            </div>
          </div>
        ) : isError ? (
          // 에러 상태
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-destructive">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
              <p className="text-lg font-semibold">오류가 발생했습니다</p>
              <p className="text-sm text-muted-foreground mt-2">
                {error instanceof Error ? error.message : "중개 화물 정보를 불러오는데 실패했습니다."}
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
              </div>
            </SheetHeader>
            
            <div className="px-6 py-4 space-y-6">
              {/* 배차 상태 Progress */}
              <div>
                <h3 className="text-base font-medium mb-3">배차 진행 상태</h3>
                <BrokerOrderProgress currentStatus={orderData.statusProgress} />
              </div>
              
              <Separator />
              
              {/* 화물 정보 카드 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Package className="h-5 w-5 text-primary" />
                  <h3 className="text-base font-medium">화물 정보</h3>
                </div>
                <BrokerOrderInfoCard 
                  departure={{
                    address: orderData.departure.address,
                    name: orderData.departure.name,
                    company: orderData.departure.company,
                    contact: orderData.departure.contact,
                    time: orderData.departure.time,
                    date: orderData.departure.date
                  }}
                  destination={{
                    address: orderData.destination.address,
                    name: orderData.destination.name,
                    company: orderData.destination.company,
                    contact: orderData.destination.contact,
                    time: orderData.destination.time,
                    date: orderData.destination.date
                  }}
                  cargo={orderData.cargo}
                  shipper={{
                    name: orderData.departure.company,
                    contact: orderData.departure.contact,
                    manager: orderData.departure.name,
                    email: "shipper@example.com" // 목업 데이터에 없어서 임시로 추가
                  }}
                />
              </div>
              
              <Separator />
              
              {/* 차량 정보 카드 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Truck className="h-5 w-5 text-primary" />
                  <h3 className="text-base font-medium">차량 정보</h3>
                </div>
                <BrokerOrderDriverInfoCard 
                  vehicle={orderData.vehicle}
                  status={orderData.statusProgress}
                  amount={orderData.amount}
                />
              </div>
              
              <Separator />
              
              {/* 정산 정보 카드 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <h3 className="text-base font-medium">정산 정보</h3>
                </div>
                <BrokerOrderSettlementInfoCard 
                  amount={orderData.amount}
                  fee={orderData.fee || "0"}
                  requestedAmount="1,200,000" // 목업 데이터에 없어서 임시로 추가
                  settlement={orderData.settlement}
                />
              </div>
              
              <Separator />
              
              {/* 화물 상태 변화 로그 */}
              <div>
                <h3 className="text-base font-medium mb-3">상태 변경 이력</h3>
                <BrokerOrderStatusLog logs={orderData.logs} />
              </div>
              
              {/* 액션 버튼 */}
              <SheetFooter className="px-0 py-4 border-t">
                <BrokerOrderActionButtons orderNumber={orderData.orderNumber} />
              </SheetFooter>
            </div>
          </ScrollArea>
        ) : null}
      </SheetContent>
    </Sheet>
  );
} 