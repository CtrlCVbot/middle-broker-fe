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
  AlertCircle,
  MailPlus,
  MailX,
  MailCheck
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { BrokerOrderInfoEditForm } from "./broker-order-info-edit-form";
import { BrokerOrderDriverInfoCard } from "./broker-order-driver-info-card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "@/components/ui/use-toast";
import { BrokerOrderDriverInfoEditForm } from "./broker-order-driver-info-edit-form";
import { BrokerOrderSettlementInfoEditForm } from "./broker-order-settlement-info-edit-form";

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
  const [isEditingDriverInfo, setIsEditingDriverInfo] = useState(false);
  const [isEditingSettlementInfo, setIsEditingSettlementInfo] = useState(false);
  
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
    } else if (section === "배차 정보") {
      setIsEditingDriverInfo(true);
    } else if (section === "운임/정산 정보") {
      setIsEditingSettlementInfo(true);
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
    console.log("저장된 화물 데이터:", formData);
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
  
  // 배차 정보 수정 저장 핸들러
  const handleSaveDriverInfo = (formData: any) => {
    // 여기서 실제로는 API 호출을 통해 데이터를 저장하겠지만, 
    // 현재는 상태만 변경하고 수정 모드를 종료합니다.
    console.log("저장된 배차 데이터:", formData);
    setIsEditingDriverInfo(false);
    
    toast({
      title: "배차 정보 수정 완료",
      description: "배차 정보가 성공적으로 업데이트되었습니다.",
    });
  };

  // 배차 정보 수정 취소 핸들러
  const handleCancelDriverInfo = () => {
    setIsEditingDriverInfo(false);
  };
  
  // 운임/정산 정보 수정 저장 핸들러
  const handleSaveSettlementInfo = (formData: any) => {
    // 여기서 실제로는 API 호출을 통해 데이터를 저장하겠지만, 
    // 현재는 상태만 변경하고 수정 모드를 종료합니다.
    console.log("저장된 운임/정산 데이터:", formData);
    setIsEditingSettlementInfo(false);
    
    toast({
      title: "운임/정산 정보 수정 완료",
      description: "운임/정산 정보가 성공적으로 업데이트되었습니다.",
    });
  };

  // 운임/정산 정보 수정 취소 핸들러
  const handleCancelSettlementInfo = () => {
    setIsEditingSettlementInfo(false);
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
                  <CardHeader className="bg-muted/20 flex flex-col md:flex-row items-center justify-between py-2 px-4">
                    <CardTitle className="text-lg mb-2 md:mb-0">
                      화물 정보
                    </CardTitle>
                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    {/* 완료 문자 보내기 */}
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleCancelCargoInfo}
                        className="px-2 py-1"
                      >
                        <MailPlus className="h-4 w-4 mr-1" />
                        완료
                    </Button>

                    {/* 취소 문자 보내기 */}
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleCancelCargoInfo}
                        className="px-2 py-1"
                      >
                        <MailX className="h-4 w-4 mr-1" />
                        취소
                    </Button>
                    {isEditingCargoInfo ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleCancelCargoInfo}
                        className="px-2 py-1"
                      >
                        <X className="h-4 w-4 mr-1" />
                        보기 모드로 전환
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEdit("화물 정보")}
                        className="px-2 py-1"
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        편집 모드로 전환
                      </Button>
                    )}
                    </div>
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
                                vehicleType: orderData.vehicle?.type || ""
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
                            cargo={{
                              ...orderData.cargo,
                              vehicleType: orderData.vehicle?.type
                            }}
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
                  <CardHeader className="bg-muted/20 flex flex-col md:flex-row items-center justify-between py-2 px-4">
                    <CardTitle className="text-lg mb-2 md:mb-0">배차 정보</CardTitle>
                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                      {/* 완료 문자 보내기 */}
                      <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleCancelCargoInfo}
                          className="px-2 py-1"
                        >
                          <MailCheck className="h-4 w-4 mr-1" />
                          배차
                      </Button>

                      {isEditingDriverInfo ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleCancelDriverInfo}
                          className="px-2 py-1"
                        >
                          <X className="h-4 w-4 mr-1" />
                          보기 모드로 전환
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEdit("배차 정보")}
                          className="px-2 py-1"
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          편집 모드로 전환
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[500px]">
                      <div className="">
                        {isEditingDriverInfo ? (
                          <BrokerOrderDriverInfoEditForm
                            initialData={{
                              driver: orderData?.vehicle?.driver || { 
                                name: "", 
                                contact: "" 
                              },
                              vehicle: {
                                type: orderData?.vehicle?.type || "",
                                weight: orderData?.vehicle?.weight || "",
                                licensePlate: orderData?.vehicle?.licensePlate || ""
                              },
                              callCenter: "24시",
                              specialNotes: []
                            }}
                            onSave={handleSaveDriverInfo}
                            onCancel={handleCancelDriverInfo}
                          />
                        ) : isAssigned ? (
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
                              onClick={() => handleEdit("배차 정보")}
                            >
                              배차 정보 입력하기
                            </Button>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
                
                {/* 운임/정산 정보 카드 */}
                <Card className="overflow-hidden">
                  <CardHeader className="bg-muted/20 flex flex-col md:flex-row items-center justify-between py-2 px-4">
                    <CardTitle className="text-lg mb-2 md:mb-0">운임/정산 정보</CardTitle>
                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                      {isEditingSettlementInfo ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleCancelSettlementInfo}
                          className="px-2 py-1"
                        >
                          <X className="h-4 w-4 mr-1" />
                          보기 모드로 전환
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit("운임/정산 정보")}
                          className="px-2 py-1"
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          편집 모드로 전환
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[500px]">
                      <div className="p-4">
                        {isEditingSettlementInfo ? (
                          <BrokerOrderSettlementInfoEditForm 
                            initialData={{
                              baseAmount: orderData?.amount || 0,
                              additionalFees: []
                            }}
                            status={orderData?.status || "배차대기"}
                            onSave={handleSaveSettlementInfo}
                            onCancel={handleCancelSettlementInfo}
                          />
                        ) : (
                          <BrokerOrderSettlementInfoCard 
                            fee={{
                              estimated: orderData?.amount,
                              contracted: orderData?.amount,
                            }}
                            settlement={orderData?.settlement}
                            status={orderData?.status || "배차대기"}
                          />
                        )}
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