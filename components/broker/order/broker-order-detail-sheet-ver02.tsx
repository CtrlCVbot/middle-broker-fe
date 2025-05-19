"use client";

import React, { useEffect, useState } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle
} from "@/components/ui/sheet";
import { useBrokerOrderDetailStore } from "@/store/broker-order-detail-store";

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
  Warehouse,
  Copy
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// 화물 상세 정보 카드
import { BrokerOrderInfoCard } from "./broker-order-info-card";
import { BrokerOrderInfoEditForm } from "./broker-order-info-edit-form";
import { BrokerOrderInfoCard as BrokerOrderInfoCardVer01 } from "./broker-order-info-card-ver01";
import { BrokerOrderInfoCard as BrokerOrderInfoCardVer02 } from "./broker-order-info-card-ver02";
import { CompanyCard } from "./broker-order-info-company-card";
import { BrokerOrderInfoEditForm as BrokerOrderInfoEditFormVer01 } from "./broker-order-info-edit-form-ver01";

// 배차 정보 카드
import { BrokerOrderDriverInfoCard } from "./broker-order-driver-info-card";
import { BrokerOrderDriverInfoCard as BrokerOrderDriverInfoCardVer01 } from "./broker-dispatch-info-card";
import { BrokerOrderDriverInfoEditForm } from "./broker-order-driver-info-edit-form";


// 운임/정산 정보 카드
import { BrokerOrderSettlementInfoCard } from "./broker-order-settlement-info-card";
import { BrokerOrderSettlementInfoEditForm } from "./broker-order-settlement-info-edit-form";
import { FinanceSummaryCard } from "./broker-dispatch-info-cost-card";

import { toast } from "@/components/ui/use-toast";
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
import { VehicleCard } from "./broker-dispatch-info-vehicle-card";

// Dialog import 추가
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { BrokerOrderDriverInfoEditForm as VehicleEditForm } from "./broker-dispatch-info-vehicle-form";

// 전체적인 상태 관리를 위한 타입 정의
type EditMode = "cargo" | "driver" | "settlement" | null;

export function BrokerOrderDetailSheet() {
  const { 
    isSheetOpen, 
    selectedOrderId, 
    closeSheet, 
    orderDetail, 
    isLoading, 
    error,
    fetchOrderDetail 
  } = useBrokerOrderDetailStore();
  
  // 편집 모드 상태 관리 통합
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [isStatusHistoryOpen, setIsStatusHistoryOpen] = useState(false);
  
  // Dialog 상태 추가
  const [isDriverEditDialogOpen, setIsDriverEditDialogOpen] = useState(false);
  
  // 배차 상태 관련 상태와 핸들러 추가
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [statusPopoverOpen, setStatusPopoverOpen] = useState(false);
  
  // 모바일 뷰를 위한 현재 선택된 탭
  const [activeTab, setActiveTab] = useState<string>("cargo");
  
  // 배차 정보 저장 성공 여부 추적을 위한 상태 추가 (통합된 상태)
  const [hasDriverInfo, setHasDriverInfo] = useState(false);
  
  // 가능한 배차 상태 목록
  const availableStatuses = [
    "배차대기", "배차진행중", "배차완료", "상차완료", "하차완료", "운송중", "운송마감"
  ];

  // 주문 데이터 저장
  const orderData = orderDetail;
  
  // 선택된 ID가 변경될 때마다 데이터 가져오기
  useEffect(() => {
    if (selectedOrderId && isSheetOpen) {
      fetchOrderDetail(selectedOrderId);
    }
  }, [selectedOrderId, isSheetOpen, fetchOrderDetail]);
  
  // orderData가 변경될 때마다 selectedStatus 및 hasDriverInfo 업데이트
  useEffect(() => {
    if (orderData) {
      setSelectedStatus(orderData.status);
      
      // 차주 정보가 있는지 확인하여 hasDriverInfo 상태 업데이트
      const driverExists = Boolean(
        orderData.vehicle?.driver?.name && 
        orderData.vehicle.driver.name !== ""
      );
      
      setHasDriverInfo(driverExists);
      console.log("차주 정보 존재 여부:", driverExists, orderData.vehicle?.driver);
    }
  }, [orderData]);


  // 업체 정보 데이터
  const companyInfo = {
    name: orderData?.shipper.name
    
  };

  // 담당자 정보 데이터
  const managerInfo = {
    name: orderData?.shipper.manager.name,
    contact: orderData?.shipper.manager.contact,
    email: orderData?.shipper.manager.email,
    role: "Carrier",
    avatar: "/images/driver-placeholder.png"
  };

  
  
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
    
    // 실제 구현에서는 fetchOrderDetail로 최신 데이터 조회
    setTimeout(() => {
      if (selectedOrderId) {
        fetchOrderDetail(selectedOrderId);
      }
    }, 300);
  };
  
  // 배차 정보 입력 Dialog 열기 핸들러
  const handleOpenDriverEditDialog = () => {
    setIsDriverEditDialogOpen(true);
  };
  
  // 배차 정보 수정 저장 핸들러
  const handleSaveDriverInfo = (formData: any) => {
    console.log("저장된 배차 데이터:", formData);
    
    // 배차 정보 저장 성공으로 상태 업데이트
    setHasDriverInfo(true);
    
    // 편집 모드 종료
    setEditMode(null);
    setIsDriverEditDialogOpen(false);
    
    // 실제 구현에서는 fetchOrderDetail로 최신 데이터 조회
    if (selectedOrderId) {
      fetchOrderDetail(selectedOrderId);
      
      toast({
        title: "배차 정보 업데이트 완료",
        description: "화물 정보가 업데이트되었습니다.",
        variant: "default"
      });
    }
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
    
    // 실제 구현에서는 fetchOrderDetail로 최신 데이터 조회
    setTimeout(() => {
      if (selectedOrderId) {
        fetchOrderDetail(selectedOrderId);
      }
    }, 300);
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
      
      // 실제 구현에서는 fetchOrderDetail로 최신 데이터 조회
      setTimeout(() => {
        if (selectedOrderId) {
          fetchOrderDetail(selectedOrderId);
        }
      }, 300);
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
        ) : orderData ? (
          // 데이터 로드 완료
          <div className="h-full flex flex-col">
            {/* 헤더 - 기본 정보 */}
            <SheetHeader className="py-4 border-b sticky top-0 bg-background bg-muted/100">
              
              <div className="flex items-center gap-3">          
                <div>
                  <p className="text-xs text-gray-900 truncate">화물 번호:</p>
                  <p className="text-sm font-medium truncate">#{orderData.orderNumber}
                  <Button 
                    variant="outline"                     
                    className="h-4 w-8 ml-2" 
                    //onClick={handleCall}
                  >
                    <Copy className="h-1.5 w-1.5" />
                  </Button> </p>    
                                      
                </div>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50">
                {/* 화물 정보 카드 */} 
                <div>
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
                    <BrokerOrderInfoCardVer02
                      orderId={orderData.orderNumber}
                      status={orderData.status}
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
                        name: orderData.shipper.name,
                        contact: orderData.shipper.manager.contact,
                        manager: orderData.shipper.manager.name,
                        email: orderData.shipper.manager.email
                      }}
                    />
                  )}
                </div>
                
                {/* 배차 정보 카드 */}
                <div className={cn(
                  "overflow-hidden", 
                  "md:block", 
                  activeTab !== "driver" && "hidden"
                )}>
                  
                  <CardContent className="p-0">
                    <div className="">
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
                      ) : hasDriverInfo ? (
                        <>                                                    
                          <BrokerOrderDriverInfoCardVer01 
                            driver={orderData?.vehicle?.driver || { name: "정보 없음" }}                            
                            vehicle={orderData?.vehicle || { type: "정보 없음" }}
                            status={orderData?.status || "배차대기"}
                            amount={orderData?.amount || "0"}
                            onSendMessage={() => handleSendMessage("기사님")}
                            onSaveDriverInfo={handleSaveDriverInfo}
                          /> 

                          {/* 금융 요약 카드 추가 */}
                          <div className="mb-4 mt-4">
                            <FinanceSummaryCard />
                          </div>                         
                        </>
                      ) : (
                        <>                        
                        <div className="flex flex-col items-center justify-center py-8 border-4 border-dashed border-gray-500 rounded-md bg-gray-200">
                          <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground mb-4">아직 배차되지 않았습니다.</p>
                          <div className="flex gap-2">                            
                            <Button 
                              type="button" 
                              onClick={handleOpenDriverEditDialog}
                            >
                              <Truck className="h-4 w-4 mr-2" />
                              배차 정보 입력하기
                            </Button>
                          </div>
                        </div>

                        {/* 금융 요약 카드 추가 */}
                        <div className="mb-4 mt-4">
                          <FinanceSummaryCard />
                        </div>     
                      </>
                      )}
                    </div>
                  </CardContent>
                </div>
                
                {/* 아직 준비안된 카드 */}
                
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
      
      {/* 배차 정보 편집 Dialog 추가 */}
      <Dialog open={isDriverEditDialogOpen} onOpenChange={setIsDriverEditDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>배차 정보 입력</DialogTitle>
          </DialogHeader>
          <VehicleEditForm
            initialData={{
              driver: {
                name: orderData?.vehicle?.driver?.name || "",
                contact: orderData?.vehicle?.driver?.contact || ""
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
            onCancel={() => setIsDriverEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Sheet>
  );
} 