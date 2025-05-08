"use client";

import React, { useEffect, useState } from "react";
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
import { IOrder, OrderFlowStatus, IOrderLog } from "@/types/order1";
import { OrderProgress } from "./order-progress";
import { OrderStepProgress } from "./order-step-progress";
import { OrderInfoCard } from "./order-info-card";
import { OrderStatusLog } from "./order-status-log";
import { OrderActionButtons } from "./order-action-buttons";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency } from "@/lib/utils";
import { CalendarClock, AlertTriangle, Package, Truck, Link2Off, ChevronUp, ChevronDown, Phone, Logs, ChevronsDown, ChevronsUp, Circle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { getStatusBadge, getStatusColor } from "./order-table-ver01";
import { OrderInfoCardVer01 } from "./order-info-card-ver01";
import { Timeline } from "./order-timeline";

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

  const [showCargeDetail, setShowCargeDetail] = useState(true);
  const [showVehicleDetail, setShowVehicleDetail] = useState(true);
  const [showStatusLog, setShowStatusLog] = useState(true);
  
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
                  <div className="h-full bg-white shadow-md rounded-md hover:ring-2 hover:ring-primary/20 transition-all duration-150">
                    <div className={cn("bg-gray-100" + " text-sm p-2 rounded-t-md flex items-center")}>
                      
                      <Badge variant="default" className="mr-2 bg-gray-700 text-white">
                        <Package className="h-4 w-4 text-white" />
                      </Badge>
                      <div className="font-medium text-md text-gray-700 truncate">{orderData.cargo.name}</div>
                    
                    </div>
                    <CardHeader className="p-3 flex justify-between items-center">          
                      <CardTitle className="text-md font-semibold flex items-center">      
                        {orderData.cargo.weight} / {orderData.cargo.type}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowCargeDetail((prev) => !prev)}
                        >
                          {showCargeDetail ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>                      
                      </CardTitle>
                    </CardHeader>

                    {showCargeDetail && (
                      <CardContent className="p-3 border-t border-gray-200 space-y-2 pt-0 text-md">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-1 mt-3">   
                          {showCargeDetail && (
                            <>
                            {orderData.cargo.options.length > 0 && (
                              orderData.cargo.options.map((option) => (
                                <>                           
                                  <Badge variant="default" className="mr-2 bg-gray-200 text-gray-800">
                                      {option}
                                  </Badge>
                                  {/* <div className="font-medium col-span-2">{orderData.cargo.options.join(', ')}</div> */}
                                </>
                              ))
                            )}                            
    
                            {orderData.cargo.remark && (
                              <>
                                <div className="text-muted-foreground">비고</div>
                                <div className="font-medium col-span-2 text-xs">{orderData.cargo.remark}</div>
                              </>
                            )}
                            </>
                          )}
                        </div>
                      </CardContent>
                    )}
                  </div>
                  
                  {/* 차량 정보 */}
                  { orderData.vehicle.driver.name.length >= 2 ? (  
                    <>
                    <div className="h-full bg-white shadow-md rounded-md hover:ring-2 hover:ring-primary/20 transition-all duration-150">
                      <div className={cn("bg-purple-100" + " text-sm p-2 rounded-t-md flex items-center")}>
                        
                        <Badge variant="default" className="mr-2 bg-purple-700 text-white">
                          <Truck className="h-4 w-4 text-white" />
                        </Badge>
                        <div className="font-medium text-md text-purple-700 truncate">차량번호</div>
                      
                      </div>
                      <CardHeader className="p-3 flex justify-between items-center">            
                        <CardTitle className="text-md font-semibold flex items-center">                                                  
                            차주명
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => setShowVehicleDetail((prev) => !prev)}
                            >
                              {showVehicleDetail ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>                        
                        </CardTitle>
                      </CardHeader>
                      {showVehicleDetail && (
                        <CardContent className="p-3 border-t border-gray-200">
                          <div className="text-md font-medium mt-2">
                            연락처
                          </div>
                          <div className="flex items-center text-sm text-gray-700">
                            <Phone className="h-4 w-4 mr-1 text-gray-500" />              
                            {orderData.vehicle.driver.contact && (
                              <div>{orderData.vehicle.driver.contact}</div>
                            )}
                          </div>

                          {/* 배차 차량 정보 */}
                          <div className="flex items-center space-x-1 mt-2">
                            <Truck className="inline h-4 w-4 text-gray-500" />
                            <span className="text-md font-medium text-muted-foreground">{orderData.vehicle.weight} / {orderData.vehicle.type}</span>
                          </div>

                        </CardContent>
                      )}
                    </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center  border border-dashed rounded-md bg-muted/30">
                      <Link2Off className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">배차전 상태입니다.</p>                      
                    </div>                                 
                  )}

                  
                </div>
              </div>
              
              <Separator />
              
              <div className="h-full bg-white">
                <div className={cn("" + " text-sm px-1 rounded-t-md flex items-center")} onClick={() => setShowStatusLog((prev) => !prev)}>
                  
                  {/* <Badge variant="default" className="mr-2 bg-gray-700 text-white">
                    <Logs className="h-4 w-4 text-white" />
                  </Badge> */}
                  <Logs className="h-5 w-5 text-gray-500 mr-2" />
                  <div className="font-medium text-md text-gray-700 truncate">상태 로그</div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    //onClick={() => setShowStatusLog((prev) => !prev)}
                  >
                    {showStatusLog ? <ChevronsUp className="h-4 w-4 text-gray-700" /> : <ChevronsDown className="h-4 w-4 text-gray-700" />}
                  </Button>  
                
                </div>
                
                {showStatusLog && (
                  <CardContent className="p-3 border-t border-gray-200">
                    {/* <OrderStatusLog logs={orderData.logs.slice(0, 3)} />
                    {orderData.logs.length > 3 && <Button variant="link" size="sm">+ 더보기</Button>} */}
                    <Timeline
                      items={orderData.logs.map((log) => ({
                        icon: <Circle className={cn("text-" + getStatusColor(log.status) + "-500")} size={12} />,
                        title: log.status,
                        description: log.remark || "",
                        time: log.time,
                        
                      }))}
                      // items={[
                      //   {
                      //     icon: <Circle className="text-purple-500" size={12} />,
                      //     title: "12 Invoices have been paid",
                      //     description: "Invoices have been paid to the company",
                      //     time: "12 min ago",
                      //     fileLink: "#",
                      //   },
                      //   {
                      //     icon: <Circle className="text-green-500" size={12} />,
                      //     title: "Client Meeting",
                      //     description: "Project meeting with John @10:15am",
                      //     time: "45 min ago",
                      //     additionalInfo: "Lester McCarthy (Client) - CEO of Pixinvent",
                      //     userImages: [
                      //       "/images/user1.jpg",
                      //       "/images/user2.jpg",
                      //     ],
                      //   },
                      //   {
                      //     icon: <Circle className="text-blue-500" size={12} />,
                      //     title: "Create a new project for client",
                      //     description: "6 team members in a project",
                      //     time: "2 Day Ago",
                      //     userImages: [
                      //       "/images/user1.jpg",
                      //       "/images/user2.jpg",
                      //       "/images/user3.jpg",
                      //       "/images/user4.jpg",
                      //     ],
                      //   },
                      // ]}
                    />

                  </CardContent>
                )}
              </div>                            
            </div>
            
            {/* 푸터 - 액션 버튼 */}
            <SheetFooter className="px-6 py-4 border-t  ">
              <OrderActionButtons orderNumber={orderData.orderNumber} />
            </SheetFooter>
          </ScrollArea>
        ) : null}
      </SheetContent>
    </Sheet>
  );
} 