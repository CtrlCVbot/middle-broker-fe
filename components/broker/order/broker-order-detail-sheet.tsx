"use client";

import React, { useEffect, useState } from "react";
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
  Clock,
  X,
  Pencil,
  AlertCircle
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { BrokerOrderInfoEditForm } from "./broker-order-info-edit-form";
import { BrokerOrderDriverInfoCard } from "./broker-order-driver-info-card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "@/components/ui/use-toast";

export function BrokerOrderDetailSheet() {
  const { 
    isSheetOpen, 
    selectedOrderId, 
    closeSheet, 
    setOrderDetail, 
    setLoading, 
    setError 
  } = useBrokerOrderDetailStore();
  
  const [isStatusHistoryOpen, setIsStatusHistoryOpen] = useState(false);
  const [isEditingCargoInfo, setIsEditingCargoInfo] = useState(false);
  
  // TanStack Query를 사용하여 화물 상세 정보 조회
  const { 
    data: orderData, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ["brokerOrderDetail", selectedOrderId],
    queryFn: async () => {
      if (!selectedOrderId) {
        throw new Error("화물 ID가 없습니다.");
      }
      
      try {
        // ID가 실제 존재하는지 확인
        const data = await getBrokerOrderDetailById(selectedOrderId);
        return data;
      } catch (err) {
        console.error(`화물 정보 조회 실패 (ID: ${selectedOrderId}):`, err);
        
        // 개발 환경에서는 오류가 발생했을 때 첫 번째 목업 데이터를 반환
        if (process.env.NODE_ENV === 'development') {
          // 첫 번째 유효한 데이터를 반환 (fallback 처리)
          const fallbackId = "BRO-001001";
          console.warn(`개발 환경 - 폴백 데이터를 사용합니다. (ID: ${fallbackId})`);
          return getBrokerOrderDetailById(fallbackId);
        }
        throw err;
      }
    },
    enabled: !!selectedOrderId && isSheetOpen,
    staleTime: 1000 * 60 * 5, // 5분
    retry: 1, // 오류 발생 시 1번만 재시도
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
  
  // 배차완료 여부 확인
  const isAssigned = orderData?.status === "배차완료" || orderData?.status === "운송중" || orderData?.status === "상차완료" || orderData?.status === "하차완료" || orderData?.status === "운송마감";
  
  // 수정 버튼 핸들러
  const handleEdit = (section: string) => {
    if (section === "화물 정보") {
      setIsEditingCargoInfo(true);
    } else {
      toast({
        title: "수정 기능",
        description: `${section} 수정 기능은 아직 구현되지 않았습니다.`,
      });
    }
  };
  
  // 문자 전송 핸들러
  const handleSendMessage = (to: string) => {
    alert(`${to}에게 메시지를 보냅니다.`);
  };
  
  // 배차 알림 전송 핸들러
  const handleSendAlert = () => {
    alert("배차 알림을 보냅니다.");
  };
  
  // 배차 진행 함수
  const handleAssignment = () => {
    alert("배차 진행 페이지로 이동합니다.");
  };
  
  // 화물 정보 수정 저장 핸들러
  const handleSaveCargoInfo = (formData: any) => {
    // 여기서 실제로는 API 호출을 통해 데이터를 저장하겠지만, 
    // 현재는 상태만 변경하고 수정 모드를 종료합니다.
    console.log("저장된 데이터:", formData);
    setIsEditingCargoInfo(false);
    
    toast({
      title: "화물 정보 수정 완료",
      description: "화물 정보가 성공적으로 업데이트되었습니다.",
    });
  };

  // 화물 정보 수정 취소 핸들러
  const handleCancelCargoInfo = () => {
    setIsEditingCargoInfo(false);
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
              {/* <div className="flex flex-col md:flex-row gap-2 md:gap-4 md:items-center mt-1"> */}
              <div className="flex flex-col gap-4 md:flex-row items-center">
                <div className="w-full flex items-center text-sm text-muted-foreground">
                  <CalendarClock className="h-4 w-4 mr-2" />
                  등록일시: {orderData.registeredAt}
                </div>
                <div className="flex"></div>
                <BrokerOrderActionButtons orderNumber={orderData.orderNumber} />
              </div>
            </SheetHeader>
            
            {/* 배차 진행 상태 - 개발시 주석 풀지마세요!*/}
            {/* <div className="px-6 py-3 border-b">
              <BrokerOrderProgress currentStatus={orderData.statusProgress} />
            </div> */}
            
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
                        {isEditingCargoInfo ? (
                          <BrokerOrderInfoEditForm
                            initialData={{
                              cargo: {
                                type: orderData.cargo.type || "",
                                weight: orderData.cargo.weight || "",
                                options: orderData.cargo.options || [],
                                remark: orderData.cargo.remark || "",
                              },
                              departure: {
                                address: orderData.departure.address || "",
                                date: orderData.departure.date || "",
                                time: orderData.departure.time || "",
                                name: orderData.departure.name || "",
                                company: orderData.departure.company || "",
                                contact: orderData.departure.contact || "",
                              },
                              destination: {
                                address: orderData.destination.address || "",
                                date: orderData.destination.date || "",
                                time: orderData.destination.time || "",
                                name: orderData.destination.name || "",
                                company: orderData.destination.company || "",
                                contact: orderData.destination.contact || "",
                              },
                              shipper: {
                                name: orderData.departure.company || "",
                                manager: orderData.departure.name || "",
                                contact: orderData.departure.contact || "",
                                email: "info@" + (orderData.departure.company || "example.com").toLowerCase().replace(/\s+/g, "") + ".com",
                              },
                            }}
                            onSave={handleSaveCargoInfo}
                            onCancel={handleCancelCargoInfo}
                          />
                        ) : (
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
                              email: "info@" + orderData.departure.company.toLowerCase().replace(/\s+/g, "") + ".com"
                            }}
                          />
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
                
                {/* 차량 및 기사 정보 카드 */}
                <Card className="overflow-hidden">
                  <CardHeader className="bg-muted/20 flex flex-row items-center justify-between py-2 px-4">
                    <CardTitle className="text-lg">차량/기사 정보</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit("차량/기사 정보")}
                      disabled={!isAssigned}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[500px]">
                      <div className="p-4">
                        {isAssigned ? (
                          <>
                            <BrokerOrderDriverInfoCard 
                              driver={orderData?.vehicle?.driver || { name: "정보 없음" }}
                              onSendMessage={() => handleSendMessage("기사님")}
                              vehicle={orderData?.vehicle || { type: "정보 없음" }}
                              status={orderData?.status || "배차대기"}
                              amount={orderData?.amount || "0"}
                            />
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                            <AlertCircle className="mb-2 h-10 w-10 opacity-20" />
                            <p>아직 배차되지 않았습니다.</p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-4"
                              onClick={handleSendAlert}
                            >
                              배차 알림 보내기
                            </Button>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
                
                {/* 운임/정산 정보 카드 */}
                <Card className="overflow-hidden">
                  <CardHeader className="bg-muted/20 flex flex-row items-center justify-between py-2 px-4">
                    <CardTitle className="text-lg">운임/정산 정보</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit("운임/정산 정보")}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[500px]">
                      <div className="p-4">
                        <BrokerOrderSettlementInfoCard 
                          fee={{
                            estimated: orderData?.amount,
                            contracted: orderData?.amount,
                          }}
                          settlement={orderData?.settlement}
                          status={orderData?.status || "배차대기"}
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