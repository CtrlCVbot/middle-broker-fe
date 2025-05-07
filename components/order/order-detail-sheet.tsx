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
// IOrder 타입 임포트 추가
import { IOrder, OrderFlowStatus } from "@/types/order1";
import { IOrderLog } from "@/types/order";

import { OrderProgress } from "./order-progress";
import { OrderStepProgress } from "./order-step-progress";
import { OrderInfoCard } from "./order-info-card";
import { OrderStatusLog } from "./order-status-log";
import { OrderActionButtons } from "./order-action-buttons";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency } from "@/lib/utils";
import { CalendarClock, AlertTriangle, Package, Truck } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { getStatusBadge, getStatusColor } from "./order-table-ver01";
import { OrderInfoCardVer01 } from "./order-info-card-ver01";

// UI 표시를 위한 인터페이스 정의 (백엔드 데이터를 UI에 맞게 변환)
interface OrderDetailForUI {
  orderNumber: string;
  status: OrderFlowStatus;
  statusProgress: OrderFlowStatus;
  registeredAt: string;
  amount: string;
  
  departure: {
    address: string;
    detailedAddress: string;
    name: string;
    company: string;
    contact: string;
    time: string;
    date: string;
  };
  
  destination: {
    address: string;
    detailedAddress: string;
    name: string;
    company: string;
    contact: string;
    time: string;
    date: string;
  };
  
  cargo: {
    name: string;
    type: string;
    weight: string | null;
    options: string[];
    remark: string;
  };
  
  vehicle: {
    type: string;
    weight: string;
    licensePlate: string;
    driver: {
      name: string;
      contact: string;
    };
  };
  
  logs: IOrderLog[];
}

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
    queryFn: async () => {
      try {
        if (!selectedOrderId) {
          throw new Error("화물 ID가 없습니다.");
        }
        
        // API 호출
        const response = await fetchOrderDetail(selectedOrderId);
        console.log('상세 정보 API 응답:', response);
        console.log('상세 정보 API 응답1:', response.createdAt);
        // 백엔드 응답을 UI 표시용 객체로 변환
        const orderDetail: OrderDetailForUI = {
          orderNumber: response.id,
          status: response.flowStatus,
          statusProgress: response.flowStatus,
          registeredAt: format(new Date(response.createdAt), "yyyy-MM-dd HH:mm", { locale: ko }),
          amount: formatCurrency(response.estimatedPriceAmount) + "원",
          
          departure: {
            address: response.pickupAddressSnapshot?.roadAddress || "-",
            detailedAddress: response.pickupAddressSnapshot?.detailAddress || "-",
            name: response.pickupContactName || "-",
            company: response.pickupName || "-",
            contact: response.pickupContactPhone || "-",
            time: response.pickupTime,
            date: format(new Date(response.pickupDate), "yyyy-MM-dd", { locale: ko }),
          },
          
          destination: {
            address: response.deliveryAddressSnapshot?.roadAddress || "-",
            detailedAddress: response.deliveryAddressSnapshot?.detailAddress || "-",
            name: response.deliveryContactName || "-",
            company: response.deliveryName || "-",
            contact: response.deliveryContactPhone || "-",
            time: response.deliveryTime,
            date: format(new Date(response.deliveryDate), "yyyy-MM-dd", { locale: ko }),
          },
          
          cargo: {
            name: response.cargoName || "-",
            type: response.requestedVehicleType || "",
            weight: response.requestedVehicleWeight || null,
            options: response.transportOptions ? Object.entries(response.transportOptions)
              .filter(([_, value]) => value === true)
              .map(([key]) => key) : [],
            remark: response.memo || "",
          },
          
          vehicle: {
            type: response.requestedVehicleType || "-",
            weight: response.requestedVehicleWeight || "-",
            licensePlate: "-", // 백엔드 데이터에 없음
            driver: {
              name: "-",
              contact: "-",
            },
          },
          
          // 로그 정보 - 현재는 생성일자 기준 샘플 데이터
          logs: [
            {
              status: response.flowStatus,
              time: format(new Date(response.createdAt), "HH:mm", { locale: ko }),
              date: format(new Date(response.createdAt), "yyyy-MM-dd", { locale: ko }),
              handler: response.contactUserSnapshot?.name || "-",
              remark: '화물 등록 완료',
            } as IOrderLog
          ],
        };
        
        return orderDetail;
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
      setOrderDetail(orderData as any);
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
            <SheetHeader className="py-4 border-b sticky top-0 bg-background bg-muted/100">
              
              <div className="flex justify-between items-center  ">
                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold text-shadow-xs text-lg text-neutral-600 truncate mr-2">화물 #{orderData.orderNumber.slice(0, 8)}</span>
                  {/* <Badge>{orderData.status}</Badge> */}
                  {isMobile && getStatusBadge(orderData.status) }
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-primary font-bold text-lg text-shadow-xs mr-10">{orderData.amount}</span>                  
                </div>
              </div>
            </SheetHeader>
            
            <div className="px-6 py-4 space-y-6">
              {/* 배차 상태 Progress */}
              {/* <div>                
                <OrderProgress currentStatus={orderData.statusProgress as any} />
              </div> */}
              <div>
                <OrderStepProgress currentStatus={orderData.statusProgress as any} />
              </div>
              
              {/* <Separator /> */}
              
              {/* 출발지 및 도착지 정보 */}
              {/* <div>                
                <OrderInfoCard 
                  departure={orderData.departure} 
                  destination={orderData.destination} 
                />                
              </div> */}
              <div>
                <OrderInfoCardVer01 
                  departure={orderData.departure} 
                  destination={orderData.destination} 
                />
              </div>
              
              <Separator />
              
             

              <div>
                {/* <h3 className="text-base font-medium mb-3">화물 및 차량 정보</h3> */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 화물 정보 */}
                  <Card className="bg-muted/20 text-md hover:ring-2 hover:ring-primary/20 transition-all duration-150">
                    <CardHeader >
                      <CardTitle className="text-sm md:text-base flex items-center">
                        <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                        <div className="font-medium text-shadow-xs text-md text-neutral-500 truncate">화물 정보</div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 pt-0 text-md">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-y-1">
                        <div className="text-muted-foreground">품목</div>
                        <div className="font-medium col-span-2">{orderData.cargo.name}</div>

                        <div className="text-muted-foreground">중량/종류</div>
                        <div className="font-medium col-span-2">{orderData.cargo.weight} / {orderData.cargo.type}</div>

                        {orderData.cargo.options.length > 0 && (
                          <>
                            <div className="text-muted-foreground">옵션</div>
                            <div className="font-medium col-span-2">{orderData.cargo.options.join(', ')}</div>
                          </>
                        )}

                        {orderData.cargo.remark && (
                          <>
                            <div className="text-muted-foreground">비고</div>
                            <div className="font-medium col-span-2 text-xs">{orderData.cargo.remark}</div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* 차량 정보 */}
                  { orderData.vehicle.driver.name.length >= 2 ? (  
                    <>
                    <Card className="text-md hover:ring-2 hover:ring-primary/20 transition-all duration-150">
                      <CardHeader >
                          <CardTitle className="text-sm md:text-base flex items-center">
                            <Truck className="h-4 w-4 mr-2 text-muted-foreground" />
                            <div className="text-md font-medium text-muted-foreground text-shadow-xs">차량 정보</div>
                          </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 pt-0 text-md">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-1">
                          <div className="text-muted-foreground">차주</div>
                          <div className="font-medium col-span-2">{orderData.vehicle.driver.name}/{orderData.vehicle.licensePlate}</div>

                          <div className="text-muted-foreground">중량/종류</div>
                          <div className="font-medium col-span-2">{orderData.vehicle.weight} / {orderData.vehicle.type}</div>

                          <div className="text-muted-foreground">연락처</div>
                          <div className="font-medium col-span-2">{orderData.vehicle.driver.contact}</div>
                        </div>
                      </CardContent>
                    </Card>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 border border-dashed rounded-md bg-muted/30">
                      <Truck className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-4">배차전 상태입니다.</p>                      
                    </div>
                  )}

                  
                </div>
              </div>
              
              <Separator />
              

              <div className="px-6 py-4">
                <h4 className="text-sm font-semibold mb-2">상태 로그</h4>
                <OrderStatusLog logs={orderData.logs.slice(0, 3)} />
                {orderData.logs.length > 3 && <Button variant="link" size="sm">+ 더보기</Button>}
              </div>
              
            </div>
            
            {/* 푸터 - 액션 버튼 */}
            <SheetFooter className="px-6 py-4 border-t mt-4 ">
              <OrderActionButtons orderNumber={orderData.orderNumber} />
            </SheetFooter>
          </ScrollArea>
        ) : null}
      </SheetContent>
    </Sheet>
  );
} 