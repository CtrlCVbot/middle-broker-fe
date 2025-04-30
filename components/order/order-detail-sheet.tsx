"use client";

import React, { useEffect } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetFooter 
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { useOrderDetailStore } from "@/store/order-detail-store";
// 기존 모크 데이터 임포트 주석 처리
// import { getOrderDetailById } from "@/utils/mockdata/mock-orders-detail";
// 실제 API 서비스 임포트
import { fetchOrderDetail } from "@/services/order-service";
import { mapBackendOrderToFrontendOrder } from "@/utils/data-mapper";
import { handleApiError } from "@/utils/api-error-handler";

import { OrderProgress } from "./order-progress";
import { OrderInfoCard } from "./order-info-card";
import { OrderStatusLog } from "./order-status-log";
import { OrderActionButtons } from "./order-action-buttons";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency } from "@/lib/utils";
import { CalendarClock, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

// TODO: 화물 상세 정보 타입 정의를 별도 파일로 분리하고 필요에 따라 백엔드 응답 구조와 매핑하는 로직 추가

export function OrderDetailSheet() {
  const { 
    isSheetOpen, 
    selectedOrderId, 
    closeSheet, 
    setOrderDetail, 
    setLoading, 
    setError 
  } = useOrderDetailStore();
  
  // TanStack Query를 사용하여 화물 상세 정보 조회 - 실제 API 연동
  const { 
    data: orderData, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ["orderDetail", selectedOrderId],
    // 기존 모크 데이터 임포트 주석 처리
    // queryFn: () => selectedOrderId ? getOrderDetailById(selectedOrderId) : Promise.reject("화물 ID가 없습니다."),    
    queryFn: async () => {
      try {
        if (!selectedOrderId) {
          throw new Error("화물 ID가 없습니다.");
        }
        
        // API 호출
        const response = await fetchOrderDetail(selectedOrderId);
        
        // 응답 데이터 매핑 - 기존의 세부 데이터 구조와 호환되도록 추가 매핑 필요
        // 현재는 기본 정보만 매핑하고 있어 화면 표시에 제한이 있을 수 있음
        const mappedOrder = mapBackendOrderToFrontendOrder(response);
        
        // TODO: 상세 정보를 위한 추가 매핑 로직 구현
        // 예: 예상 배송 일정, 운전자 정보 등
        
        return {
          orderNumber: mappedOrder.id,
          status: mappedOrder.status,
          statusProgress: mappedOrder.status,
          registeredAt: format(new Date(mappedOrder.createdAt), "yyyy-MM-dd HH:mm", { locale: ko }),
          amount: formatCurrency(mappedOrder.amount) + "원",
          
          departure: {
            name: response.pickupName || "-",
            address: mappedOrder.departureLocation,
            date: format(new Date(mappedOrder.departureDateTime), "yyyy-MM-dd", { locale: ko }),
            time: format(new Date(mappedOrder.departureDateTime), "HH:mm", { locale: ko }),
            contact: response.pickupContactPhone || "-",
            contactPerson: response.pickupContactName || "-",
          },
          
          destination: {
            name: response.deliveryName || "-",
            address: mappedOrder.arrivalLocation,
            date: format(new Date(mappedOrder.arrivalDateTime), "yyyy-MM-dd", { locale: ko }),
            time: format(new Date(mappedOrder.arrivalDateTime), "HH:mm", { locale: ko }),
            contact: response.deliveryContactPhone || "-",
            contactPerson: response.deliveryContactName || "-",
          },
          
          cargo: {
            type: response.cargoName || "-",
            weight: mappedOrder.vehicle.weight,
            options: response.transportOptions ? Object.entries(response.transportOptions)
              .filter(([_, value]) => value === true)
              .map(([key]) => key) : [],
            remark: response.memo || "-",
          },
          
          vehicle: {
            type: mappedOrder.vehicle.type,
            licensePlate: "-", // 백엔드 데이터에 없음
            driver: {
              name: mappedOrder.driver.name || "-",
              contact: mappedOrder.driver.contact || "-",
            },
          },
          
          // 로그 정보 - 현재는 샘플 데이터
          logs: [
            {
              status: '배차대기',
              timestamp: response.createdAt,
              operator: response.contactUserSnapshot?.name || "-",
              note: '화물 등록 완료',
            }
          ],
        };
      } catch (error) {
        handleApiError(error, '화물 상세 정보를 불러오는 데 실패했습니다.');
        throw error;
      }
    },
    enabled: !!selectedOrderId && isSheetOpen,
    staleTime: 1000 * 60 * 5, // 5분
    retry: 1, // 실패 시 1번 재시도
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
          // 로딩 상태 - 개선된 UI
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">화물 정보를 불러오는 중...</p>
            </div>
          </div>
        ) : isError ? (
          // 에러 상태 - 개선된 UI
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
                  운송비: {orderData.amount}
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
                      
                      {orderData.cargo.options && orderData.cargo.options.length > 0 && (
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