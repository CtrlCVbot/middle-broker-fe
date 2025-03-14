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
import { BrokerOrderSettlementInfoCard } from "./broker-order-settlement-info-card";
import { BrokerOrderStatusLog } from "./broker-order-status-log";
import { BrokerOrderActionButtons } from "./broker-order-action-buttons";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  CalendarClock, 
  AlertTriangle, 
  Truck, 
  CreditCard, 
  Package, 
  History, 
  Edit, 
  Send,
  User,
  Bell,
  Star,
  MapPin,
  Phone,
  Clock
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

// IBrokerOrderDetail 타입에 부족한 필드를 확장하는 타입
interface ExtendedOrderData {
  fee?: string;
  settlement?: {
    id?: string;
    status?: string;
  };
}

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
  
  // 배차 상태 확인 (배차 전/후 상태 구분)
  const isAfterAssignment = orderData?.statusProgress !== '배차대기' && orderData?.vehicle?.driver;
  
  // 수정 버튼 핸들러
  const handleEdit = (section: string) => {
    alert(`${section} 수정 모달 열기`);
  };
  
  // 문자 전송 핸들러
  const handleSendMessage = () => {
    alert("문자 메시지 전송");
  };
  
  // 배차 알림 전송 핸들러
  const handleSendAlert = () => {
    alert("배차 알림 전송");
  };
  
  // 배차 진행 함수
  const handleAssignment = () => {
    alert("배차 진행 페이지로 이동합니다.");
  };
  
  return (
    <Sheet open={isSheetOpen} onOpenChange={(open) => !open && closeSheet()}>
      <SheetContent 
        side="top" 
        className="sm:max-w-full md:max-w-full overflow-auto p-0 h-[90vh]"
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
          <div className="h-full flex flex-col">
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
              <div className="flex flex-col md:flex-row gap-2 md:gap-4 md:items-center mt-1">
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarClock className="h-4 w-4 mr-2" />
                  등록일시: {orderData.registeredAt}
                </div>
                <div className="flex-grow"></div>
                <BrokerOrderActionButtons orderNumber={orderData.orderNumber} />
              </div>
            </SheetHeader>
            
            {/* 배차 진행 상태 */}
            <div className="px-6 py-3 border-b">
              <BrokerOrderProgress currentStatus={orderData.statusProgress} />
            </div>
            
            {/* 메인 컨텐츠 - 그리드 레이아웃 */}
            <div className="flex-grow overflow-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
                {/* 화물 정보 카드 */}
                <Card className="overflow-hidden h-full">
                  <CardHeader className="py-3 px-4 bg-muted/30 flex flex-row items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary" />
                      화물 정보
                    </CardTitle>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleEdit("화물 정보")}
                      className="h-8 w-8"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[calc(90vh-220px)]">
                      <div className="p-4">
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
                    </ScrollArea>
                  </CardContent>
                </Card>
                
                {/* 차량 정보 카드 */}
                <Card className="overflow-hidden h-full">
                  <CardHeader className="py-3 px-4 bg-muted/30 flex flex-row items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Truck className="h-5 w-5 text-primary" />
                      차량 정보
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      {isAfterAssignment && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={handleSendMessage}
                            className="h-8 gap-1 text-xs"
                          >
                            <Send className="h-3.5 w-3.5" />
                            문자
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={handleSendAlert}
                            className="h-8 gap-1 text-xs"
                          >
                            <Bell className="h-3.5 w-3.5" />
                            알림
                          </Button>
                        </>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEdit("차량 정보")}
                        className="h-8 w-8"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[calc(90vh-220px)]">
                      <div className="p-4">
                        {isAfterAssignment && orderData.vehicle.driver ? (
                          // 배차 후 상태 UI
                          <>
                            {/* 차주 정보 */}
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <User className="h-4 w-4 text-primary" />
                                <h4 className="font-medium">차주 정보</h4>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-2 text-sm">
                                <div className="text-muted-foreground">차주명</div>
                                <div className="col-span-2 font-medium">{orderData.vehicle.driver.name}</div>
                                
                                <div className="text-muted-foreground">연락처</div>
                                <div className="col-span-2 font-medium flex items-center gap-2">
                                  {orderData.vehicle.driver.contact}
                                  <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <Phone className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                                
                                <div className="text-muted-foreground">평가</div>
                                <div className="col-span-2 font-medium flex items-center">
                                  <div className="flex text-amber-500">
                                    <Star className="h-3.5 w-3.5 fill-current" />
                                    <Star className="h-3.5 w-3.5 fill-current" />
                                    <Star className="h-3.5 w-3.5 fill-current" />
                                    <Star className="h-3.5 w-3.5 fill-current" />
                                    <Star className="h-3.5 w-3.5" />
                                  </div>
                                  <span className="ml-1 text-xs">(4.0)</span>
                                </div>
                                
                                <div className="text-muted-foreground">현재 위치</div>
                                <div className="col-span-2 font-medium flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5 text-primary" />
                                  <span>경기도 용인시 (10분 전 업데이트)</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* 분리선 */}
                            <Separator className="my-4" />
                            
                            {/* 차량 정보 */}
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <Truck className="h-4 w-4 text-primary" />
                                <h4 className="font-medium">차량 상세</h4>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-2 text-sm">
                                <div className="text-muted-foreground">차량 종류</div>
                                <div className="col-span-2 font-medium">{orderData.vehicle.type}</div>
                                
                                {orderData.vehicle.weight && (
                                  <>
                                    <div className="text-muted-foreground">중량</div>
                                    <div className="col-span-2 font-medium">{orderData.vehicle.weight}</div>
                                  </>
                                )}
                                
                                {orderData.vehicle.licensePlate && (
                                  <>
                                    <div className="text-muted-foreground">차량 번호</div>
                                    <div className="col-span-2 font-medium">{orderData.vehicle.licensePlate}</div>
                                  </>
                                )}
                                
                                <div className="text-muted-foreground">차량 상태</div>
                                <div className="col-span-2 font-medium">
                                  <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                                    운행중
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            
                            {/* 차주 배차 이력 */}
                            <div className="mt-4">
                              <details>
                                <summary className="flex items-center gap-2 cursor-pointer mb-2">
                                  <Clock className="h-4 w-4 text-primary" />
                                  <h4 className="font-medium">차주 배차 이력</h4>
                                </summary>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b">
                                        <th className="text-left py-2 font-medium text-muted-foreground">주문번호</th>
                                        <th className="text-left py-2 font-medium text-muted-foreground">날짜</th>
                                        <th className="text-left py-2 font-medium text-muted-foreground">경로</th>
                                        <th className="text-right py-2 font-medium text-muted-foreground">상태</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr className="border-b">
                                        <td className="py-2">ORD-001</td>
                                        <td className="py-2">2023-03-01</td>
                                        <td className="py-2">서울 → 부산</td>
                                        <td className="py-2 text-right">
                                          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                                            완료
                                          </Badge>
                                        </td>
                                      </tr>
                                      <tr className="border-b">
                                        <td className="py-2">ORD-002</td>
                                        <td className="py-2">2023-02-15</td>
                                        <td className="py-2">인천 → 대구</td>
                                        <td className="py-2 text-right">
                                          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                                            완료
                                          </Badge>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </details>
                            </div>
                          </>
                        ) : (
                          // 배차 전 상태 UI
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 text-amber-500 mb-3">
                              <AlertTriangle className="h-5 w-5" />
                              <h4 className="font-medium">아직 배차가 완료되지 않았습니다.</h4>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <div className="text-muted-foreground">예상 배차 금액</div>
                              <div className="col-span-2 font-medium">{formatCurrency(parseInt(orderData.amount.replace(/,/g, ''), 10) || 0)}원</div>
                              
                              <div className="text-muted-foreground">차량 종류</div>
                              <div className="col-span-2 font-medium">{orderData.vehicle.type}</div>
                            </div>
                            
                            <Button 
                              className="w-full" 
                              onClick={handleAssignment}
                            >
                              배차 진행하기
                            </Button>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
                
                {/* 정산 정보 카드 */}
                <Card className="overflow-hidden h-full">
                  <CardHeader className="py-3 px-4 bg-muted/30 flex flex-row items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      정산 정보
                    </CardTitle>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleEdit("정산 정보")}
                      className="h-8 w-8"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[calc(90vh-220px)]">
                      <div className="p-4">
                        <BrokerOrderSettlementInfoCard 
                          amount={orderData.amount}
                          fee={(orderData as ExtendedOrderData).fee || "0"}
                          requestedAmount="1,200,000" // 목업 데이터에 없어서 임시로 추가
                          settlement={(orderData as ExtendedOrderData).settlement}
                        />
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* 상태 변경 이력 - 확장/축소 가능한 패널로 변경 */}
            <div className="border-t">
              <details className="px-6 py-3">
                <summary className="flex items-center gap-2 cursor-pointer">
                  <History className="h-5 w-5 text-primary" />
                  <h3 className="text-base font-medium">상태 변경 이력</h3>
                </summary>
                <div className="mt-3 pb-3">
                  <BrokerOrderStatusLog logs={orderData.logs} />
                </div>
              </details>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
} 