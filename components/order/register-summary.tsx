"use client";

import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useOrderRegisterStore } from "@/store/order-register-store";
import { registerOrder } from "@/utils/mockdata/mock-register";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMutation } from "@tanstack/react-query";
import { TRANSPORT_OPTIONS } from "@/types/order";
import { useToast } from "@/components/ui/use-toast";
import { CalendarIcon, CheckCircleIcon, MapPinIcon, PackageIcon, TruckIcon, HandCoins, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderRegisterSummaryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function OrderRegisterSummary({ 
  open, 
  onOpenChange, 
  onConfirm 
}: OrderRegisterSummaryProps) {
  const { registerData, resetForm } = useOrderRegisterStore();
  const { toast } = useToast();
  
  // 주문 등록 mutation
  const registerMutation = useMutation({
    mutationFn: registerOrder,
    onSuccess: () => {
      toast({
        title: "화물 등록 성공",
        description: "화물이 성공적으로 등록되었습니다.",
      });
      resetForm();
      onOpenChange(false);
      onConfirm();
    },
    onError: (error) => {
      toast({
        title: "화물 등록 실패",
        description: "화물 등록 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  });
  
  // 등록 처리
  const handleConfirm = async () => {
    registerMutation.mutate(registerData);
  };
  
  // 선택된 옵션의 레이블 가져오기
  const getSelectedOptionLabels = () => {
    return registerData.selectedOptions.map(optionId => {
      const option = TRANSPORT_OPTIONS.find(opt => opt.id === optionId);
      return option ? option.label : optionId;
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[550px] max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl">화물 등록 확인</DialogTitle>
          <DialogDescription>
            입력하신 화물 정보를 확인하신 후 등록 버튼을 클릭하세요.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* 차량 및 화물 정보 */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium flex items-center">
                <TruckIcon className="w-5 h-5 mr-2" />
                차량 및 화물 정보
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <Label className="text-muted-foreground">차량 종류/중량</Label>
                <div className="font-medium">
                  {registerData.vehicleType}/{registerData.weightType}
                </div>
                {/*
                <Label className="text-muted-foreground">중량</Label>
                <div className="font-medium">{registerData.weightType}</div>
                */}
                
                <Label className="text-muted-foreground">화물 품목</Label>
                <div className="font-medium">{registerData.cargoType}</div>
                
                {registerData.remark && (
                  <>
                    <Label className="text-muted-foreground">비고</Label>
                    <div className="font-medium">{registerData.remark}</div>
                  </>
                )}
              </div>
            </div>
            
            <Separator />
            
            {/* 출발지 정보 */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium flex items-center">
                <MapPinIcon className="w-5 h-5 mr-2" />
                출발지 정보
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <Label className="text-muted-foreground">주소</Label>
                <div className="font-medium">
                  {registerData.departure.address}
                  {registerData.departure.detailedAddress && (
                    <div className="text-xs text-muted-foreground mt-1">{registerData.departure.detailedAddress}</div>
                  )}
                </div>
                {/*
                {registerData.departure.detailedAddress && (
                  <>
                    <Label className="text-muted-foreground">상세 주소</Label>
                    <div className="font-medium">{registerData.departure.detailedAddress}</div>
                  </>
                )}*/}
                
                <Label className="text-muted-foreground">회사명</Label>
                <div className="font-medium">{registerData.departure.company}</div>
                
                <Label className="text-muted-foreground">담당자</Label>
                <div className="flex-1 font-medium flex items-center">
                {registerData.departure.name}
                  <Phone className="h-3 w-3 ml-3 mr-1 text-muted-foreground" />
                  <span className="text-xs">{registerData.departure.contact}</span>
                </div>
                {/*<div className="font-medium">
                  {registerData.departure.name}/{registerData.departure.contact}
                </div>*/}
                
                {/*
                <Label className="text-muted-foreground">연락처</Label>
                <div className="font-medium"></div>
                */}
                
                <Label className="text-muted-foreground">출발 일시</Label>
                <div className="font-medium">
                  {registerData.departure.date} {registerData.departure.time}
                </div>
              </div>
            </div>
            
            <Separator />
            
            {/* 도착지 정보 */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium flex items-center">
                <MapPinIcon className="w-5 h-5 mr-2" />
                도착지 정보
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <Label className="text-muted-foreground">주소</Label>
                {/*<div className="font-medium">{registerData.destination.address}</div>*/}
                <div className="font-medium">
                  {registerData.destination.address}
                  {registerData.destination.detailedAddress && (
                    <div className="text-xs text-muted-foreground mt-1">{registerData.destination.detailedAddress}</div>
                  )}
                </div>

                {/*
                {registerData.destination.detailedAddress && (
                  <>
                    <Label className="text-muted-foreground">상세 주소</Label>
                    <div className="font-medium">{registerData.destination.detailedAddress}</div>
                  </>
                )}*/}
                
                <Label className="text-muted-foreground">회사명</Label>
                <div className="font-medium">{registerData.destination.company}</div>
                
                <Label className="text-muted-foreground">담당자</Label>
                <div className="flex-1 font-medium flex items-center">
                {registerData.destination.name}
                  <Phone className="h-3 w-3 ml-3 mr-1 text-muted-foreground" />
                  <span className="text-xs">{registerData.destination.contact}</span>
                </div>
                
                {/*
                <Label className="text-muted-foreground">연락처</Label>
                <div className="font-medium">{registerData.destination.contact}</div>
                */}
                
                <Label className="text-muted-foreground">도착 일시</Label>
                <div className="font-medium">
                  {registerData.destination.date} {registerData.destination.time}
                </div>
              </div>
            </div>
            
            <Separator />
            
            {/* 운송 옵션 */}
            {registerData.selectedOptions.length > 0 && (
              <>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium flex items-center">
                    <PackageIcon className="w-5 h-5 mr-2" />
                    운송 옵션
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {getSelectedOptionLabels().map((label, idx) => (
                      <div key={idx} className="bg-accent text-accent-foreground text-sm rounded-md px-2 py-1">
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
              </>
            )}
            
            {/* 예상 정보
            {/* <div className="space-y-2">
              <h3 className="text-lg font-medium flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2" />
                예상 정보
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <Label className="text-muted-foreground">예상 거리</Label>
                <div className="font-medium">{registerData.estimatedDistance?.toLocaleString() || 0} km</div>
                
                <Label className="text-muted-foreground">예상 금액</Label>
                <div className="font-bold text-primary text-base">
                  {registerData.estimatedAmount?.toLocaleString() || 0} 원
                </div>
              </div>
            </div>*/}
          </div> 
        </ScrollArea>
        
        <DialogFooter className="gap-2 sm:gap-0 mt-4">
          <div className="flex items-center gap-2">
          <HandCoins className="w-5 h-5 mr-2" />
          <div className="font-medium">            
            {registerData.estimatedDistance?.toLocaleString() || 0} km/
          </div>
          <div className="font-bold text-primary text-base">
            {registerData.estimatedAmount?.toLocaleString() || 0} 원
          </div>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={registerMutation.isPending}
          >
            수정하기
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={registerMutation.isPending}
            className={cn(
              "min-w-24",
              registerMutation.isPending && "opacity-80 cursor-not-allowed"
            )}
          >
            {registerMutation.isPending ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                등록 중...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircleIcon className="h-4 w-4" />
                확인 후 등록
              </span>
            )}
          </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 