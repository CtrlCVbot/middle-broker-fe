"use client";

import React, { useEffect, useState } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle
} from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { useBrokerOrderDetailStore } from "@/store/broker-order-detail-store";
import { getBrokerOrderDetailById } from "@/utils/mockdata/mock-broker-orders-detail";
import { BrokerOrderInfoCard } from "./broker-order-info-card";
import { BrokerOrderSettlementInfoCard } from "./broker-order-settlement-info-card";
import { BrokerOrderStatusLog } from "./broker-order-status-log";
import { BrokerOrderActionButtons } from "./broker-order-action-buttons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  AlertTriangle, 
  Truck, 
  CreditCard, 
  Package, 
  History, 
  X,
  Pencil,
  AlertCircle,
  MailPlus,
  MailX,
  MailCheck,
  Eye,
  DollarSign,
  Check,
  Warehouse
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrokerOrderInfoEditForm } from "./broker-order-info-edit-form";
import { BrokerOrderDriverInfoCard } from "./broker-order-driver-info-card";
import { toast } from "@/components/ui/use-toast";
import { BrokerOrderDriverInfoEditForm } from "./broker-order-driver-info-edit-form";
import { BrokerOrderSettlementInfoEditForm } from "./broker-order-settlement-info-edit-form";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// 전체적인 상태 관리를 위한 타입 정의
type EditMode = "cargo" | "driver" | "settlement" | null;

export function BrokerOrderDetailSheet() {
  const { 
    isSheetOpen, 
    selectedOrderId, 
    closeSheet, 
    setOrderDetail, 
    setLoading, 
    setError 
  } = useBrokerOrderDetailStore();
  
  // 편집 모드 상태 관리 통합
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [isStatusHistoryOpen, setIsStatusHistoryOpen] = useState(false);
  
  // 배차 상태 관련 상태와 핸들러 추가
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [statusPopoverOpen, setStatusPopoverOpen] = useState(false);
  
  // 모바일 뷰를 위한 현재 선택된 탭
  const [activeTab, setActiveTab] = useState<string>("cargo");
  
  // 가능한 배차 상태 목록
  const availableStatuses = [
    "배차대기", "배차진행중", "배차완료", "상차완료", "하차완료", "운송중", "운송완료"
  ];
  
  // TanStack Query를 사용하여 화물 상세 정보 조회
  const { 
    data: orderData, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useQuery({
    queryKey: ["brokerOrderDetail", selectedOrderId],
    queryFn: async () => {
      if (!selectedOrderId) {
        throw new Error("화물 ID가 없습니다.");
      }
      console.log("selectedOrderId1 => ", selectedOrderId);
      try {
        // ID가 실제 존재하는지 확인
        console.log("selectedOrderId2 => ", selectedOrderId);
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
      console.log("orderData => ", orderData.orderNumber);
      console.log("orderData => ", orderData.vehicle.driver?.name);
      setOrderDetail(orderData);
    }
  }, [orderData, isLoading, isError, error, setLoading, setError, setOrderDetail]);
  
  // 배차 상태 확인 (배차 전/후 상태 구분)
  const isAfterAssignment = orderData?.statusProgress !== '배차대기' && orderData?.vehicle?.driver;
  
  // 배차완료 여부 확인
  const isAssigned = orderData?.status === "배차완료" || orderData?.status === "운송중" || orderData?.status === "상차완료" || orderData?.status === "하차완료" || orderData?.status === "운송마감";
  
  // 편집 모드 설정 핸들러
  const handleSetEditMode = (mode: EditMode) => {
    setEditMode(mode);
  };
  
  // 편집 취소 핸들러
  const handleCancelEdit = () => {
    setEditMode(null);
  };
  
  // 문자 전송 핸들러
  const handleSendMessage = (to: string) => {
    toast({
      title: "문자 전송",
      description: `${to}에게 메시지를 보냅니다.`,
    });
  };
  
  // 배차 문자 전송 핸들러
  const handleSendAssignMessage = () => {
    toast({
      title: "배차 안내 문자 전송",
      description: "차주에게 배차 안내 문자를 발송했습니다.",
    });
  };
  
  // 완료 문자 전송 핸들러
  const handleSendCompleteMessage = () => {
    toast({
      title: "배차 완료 문자 전송",
      description: "화주에게 배차 완료 문자를 발송했습니다.",
    });
  };
  
  // 취소 문자 전송 핸들러
  const handleSendCancelMessage = () => {
    toast({
      title: "배차 취소 문자 전송",
      description: "화주에게 배차 취소 문자를 발송했습니다.",
    });
  };
  
  // 화물 정보 수정 저장 핸들러
  const handleSaveCargoInfo = (formData: any) => {
    console.log("저장된 화물 데이터:", formData);
    
    toast({
      title: "화물 정보 수정 완료",
      description: "화물 정보가 성공적으로 업데이트되었습니다.",
      variant: "default"
    });
    
    // 편집 모드 종료
    setEditMode(null);
    
    // 실제 구현에서는 refetch로 최신 데이터 조회
    setTimeout(() => refetch(), 300);
  };
  
  // 배차 정보 수정 저장 핸들러
  const handleSaveDriverInfo = (formData: any) => {
    console.log("저장된 배차 데이터:", formData);
    
    toast({
      title: "배차 정보 수정 완료",
      description: "배차 정보가 성공적으로 업데이트되었습니다.",
      variant: "default"
    });
    
    // 편집 모드 종료
    setEditMode(null);
    
    // 실제 구현에서는 refetch로 최신 데이터 조회
    setTimeout(() => refetch(), 300);
  };
  
  // 운임/정산 정보 수정 저장 핸들러
  const handleSaveSettlementInfo = (formData: any) => {
    console.log("저장된 운임/정산 데이터:", formData);
    
    toast({
      title: "운임/정산 정보 수정 완료",
      description: "운임/정산 정보가 성공적으로 업데이트되었습니다.",
      variant: "default"
    });
    
    // 편집 모드 종료
    setEditMode(null);
    
    // 실제 구현에서는 refetch로 최신 데이터 조회
    setTimeout(() => refetch(), 300);
  };
  
  // 배차 상태 변경 핸들러
  const handleChangeStatus = () => {
    if (orderData && selectedStatus && selectedStatus !== orderData.status) {
      // 실제 구현에서는 여기서 API 호출을 통해 상태를 변경할 것입니다.
      console.log(`상태 변경: ${orderData.status} -> ${selectedStatus}`);
      
      // 상태 변경 성공 알림
      toast({
        title: "상태 변경 완료",
        description: `배차 상태가 ${selectedStatus}(으)로 변경되었습니다.`,
        variant: "default"
      });
      
      setStatusPopoverOpen(false);
      
      // 실제 구현에서는 refetch로 최신 데이터 조회
      setTimeout(() => refetch(), 300);
    }
  };
  
  // 배차 상태 변경 시작
  const startStatusChange = () => {
    if (orderData) {
      setSelectedStatus(orderData.status);
      setIsChangingStatus(true);
    }
  };
  
  // 배차 상태 변경 취소
  const cancelStatusChange = () => {
    setIsChangingStatus(false);
    setStatusPopoverOpen(false);
  };
  
  // orderData가 변경될 때마다 selectedStatus 업데이트
  useEffect(() => {
    if (orderData) {
      setSelectedStatus(orderData.status);
    }
  }, [orderData]);
  
  return (
    <Sheet 
      open={isSheetOpen} 
      modal={true}
      onOpenChange={(open) => open ? undefined : closeSheet()}
    >
      <SheetContent 
        side="top" 
        className="sm:max-w-full md:max-w-full overflow-auto p-0 h-[90vh]"
        onInteractOutside={(e) => e.preventDefault()} // 외부 클릭으로 닫히는 것 방지
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
            <SheetHeader className="py-4 border-b sticky top-0 bg-background bg-muted/100">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-xl font-bold">
                  화물 번호: {orderData.orderNumber}
                </SheetTitle>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={closeSheet}
                  className="h-8 w-8"
                >
                  
                </Button>
              </div>
              {/* 배차 상태 및 액션 버튼 */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center">
                  <Popover open={statusPopoverOpen} onOpenChange={setStatusPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center gap-2 border-dashed"
                      >
                        <Badge 
                          variant={orderData.status === "운송완료" ? "default" : "secondary"}
                          className="font-semibold"
                        >
                          {orderData.status}
                        </Badge>
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-4">
                      <div className="space-y-4">
                        <h4 className="font-medium">배차 상태 변경</h4>
                        <div className="flex flex-col gap-3">
                          <Select
                            value={selectedStatus}
                            onValueChange={setSelectedStatus}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="상태 선택" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableStatuses.map(status => (
                                <SelectItem key={status} value={status}>
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="flex items-center justify-end gap-2 mt-2">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={cancelStatusChange}
                            >
                              취소
                            </Button>
                            <Button 
                              size="sm" 
                              variant="default" 
                              onClick={handleChangeStatus}
                              className="gap-1"
                            >
                              <Check className="h-3.5 w-3.5" />
                              변경 확인
                            </Button>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  
                </div>
                <BrokerOrderActionButtons orderNumber={orderData.orderNumber} />
              </div>
            </SheetHeader>
            
            {/* 모바일 전용 탭 메뉴 */}
            <div className="md:hidden border-b">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="cargo" className="text-xs">
                    <Package className="h-4 w-4 mr-1" />
                    화물 정보
                  </TabsTrigger>
                  <TabsTrigger value="driver" className="text-xs">
                    <Truck className="h-4 w-4 mr-1" />
                    배차 정보
                  </TabsTrigger>
                  <TabsTrigger value="settlement" className="text-xs">
                    <CreditCard className="h-4 w-4 mr-1" />
                    운임/정산
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            {/* 메인 컨텐츠 - 그리드 레이아웃 */}
            <div className="flex-grow overflow-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                {/* 화물 정보 카드 */}
                {/* <Card className={cn(
                  "overflow-hidden", 
                  "md:block", 
                  "border-none",
                  activeTab !== "cargo" && "hidden"
                )}> */}
                <div className="h-full bg-white shadow-md rounded-md hover:ring-2 hover:ring-primary/20 transition-all duration-150">
                  <div className={cn("bg-orange-100 text-orange-700" + " text-sm p-2 rounded-t-md flex items-center","flex flex-row items-center justify-between py-3 px-4 border-b")}>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-primary" />
                      <CardTitle className="text-base font-medium">
                        화물 정보
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* 화주 문자 발송 */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={handleSendCompleteMessage}
                              className="h-7 w-7"
                            >
                              <MailCheck className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>완료 문자 발송</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={handleSendCancelMessage}
                              className="h-7 w-7"
                            >
                              <MailX className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>취소 문자 발송</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      {/* 편집 모드 전환 버튼 */}
                      {editMode === "cargo" ? (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={handleCancelEdit}
                          className="h-7 px-2"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          보기
                        </Button>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleSetEditMode("cargo")}
                          className="h-7 px-2"
                        >
                          <Pencil className="h-3.5 w-3.5 mr-1" />
                          편집
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <CardContent className="p-0">
                    <div className="p-4">
                      {editMode === "cargo" ? (
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
                          onCancel={handleCancelEdit}
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
                  </CardContent>
                  
                {/* </Card> */}
                </div>
                
                {/* 차량 및 기사 정보 카드 */}
                <Card className={cn(
                  "overflow-hidden", 
                  "md:block", 
                  activeTab !== "driver" && "hidden"
                )}>
                  <CardHeader className="bg-muted/20 flex flex-row items-center justify-between py-3 px-4 border-b">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-primary" />
                      <CardTitle className="text-base font-medium">배차 정보</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* 배차 문자 발송 */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={handleSendAssignMessage}
                              className="h-7 w-7"
                            >
                              <MailPlus className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>배차 안내 문자 발송</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {/* 편집 모드 전환 버튼 */}
                      {editMode === "driver" ? (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={handleCancelEdit}
                          className="h-7 px-2"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          보기
                        </Button>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleSetEditMode("driver")}
                          className="h-7 px-2"
                        >
                          <Pencil className="h-3.5 w-3.5 mr-1" />
                          편집
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="p-4">
                      {editMode === "driver" ? (
                        <BrokerOrderDriverInfoEditForm
                          initialData={{
                            status: orderData?.status || "배차대기",
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
                            specialNotes: [],
                            dispatchId: orderData?.dispatchId || ""
                          }}
                          onSave={handleSaveDriverInfo}
                          onCancel={handleCancelEdit}
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
                            onClick={() => handleSetEditMode("driver")}
                          >
                            배차 정보 입력하기
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                {/* 운임/정산 정보 카드 */}
                <Card className={cn(
                  "overflow-hidden", 
                  "md:block", 
                  activeTab !== "settlement" && "hidden"
                )}>
                  <CardHeader className="bg-muted/20 flex flex-row items-center justify-between py-3 px-4 border-b">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <CardTitle className="text-base font-medium">운임/정산 정보</CardTitle>
                    </div>
                    <div className="flex gap-2">
                      {/* 편집 모드 전환 버튼 */}
                      {editMode === "settlement" ? (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={handleCancelEdit}
                          className="h-7 px-2"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          보기
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSetEditMode("settlement")}
                          className="h-7 px-2"
                        >
                          <Pencil className="h-3.5 w-3.5 mr-1" />
                          편집
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="p-4">
                      {editMode === "settlement" ? (
                        <BrokerOrderSettlementInfoEditForm 
                          initialData={{
                            baseAmount: orderData?.amount || 0,
                            additionalFees: []
                          }}
                          status={orderData?.status || "배차대기"}
                          onSave={handleSaveSettlementInfo}
                          onCancel={handleCancelEdit}
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
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* 상태 변경 이력 - 확장/축소 가능한 패널로 변경 */}
            <div className="border-t mt-auto">
              <details className="px-6 py-3">
                <summary className="flex items-center gap-2 cursor-pointer">
                  <History className="h-5 w-5 text-primary" />
                  <h3 className="text-base font-medium">상태 변경 이력</h3>
                  <span className="text-sm text-muted-foreground ml-3">
                    등록일시: {orderData.registeredAt}
                  </span>
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