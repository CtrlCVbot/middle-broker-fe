"use client";

import React, { useState } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMutation } from "@tanstack/react-query";
import { TRANSPORT_OPTIONS } from "@/types/order";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircleIcon, MapPinIcon, PackageIcon, TruckIcon, HandCoins, Phone, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { registerOrder, convertFormDataToApiRequest } from '@/services/order-service';
import { handleApiError } from '@/utils/order-utils';
import { RegisterSuccessDialog } from '@/components/order/register-success-dialog';

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
  const [successDialogOpen, setSuccessDialogOpen] = useState<boolean>(false);
  const [registeredOrderId, setRegisteredOrderId] = useState<string>('');
  
  // 주문 등록 mutation
  const registerMutation = useMutation({
    mutationFn: async () => {
      // 폼 데이터를 API 요청 형식으로 변환
      const requestData = convertFormDataToApiRequest(registerData);
      // API 호출
      return await registerOrder(requestData);
    },
    onSuccess: (response) => {
      // 등록된 화물 ID 저장
      setRegisteredOrderId(response.id);
      
      // 성공 다이얼로그 표시
      setSuccessDialogOpen(true);
      
      // 스토어 초기화
      resetForm();
      
      // 명세서 다이얼로그 닫기
      onOpenChange(false);
    },
    onError: (error) => {
      // 에러 처리
      handleApiError(error, '화물 등록에 실패했습니다.');
    }
  });
  
  // 등록 처리
  const handleConfirm = async () => {
    registerMutation.mutate();
  };
  
  // 성공 다이얼로그 닫기 함수
  const handleSuccessDialogClose = () => {
    setSuccessDialogOpen(false);
    // 후속 처리 실행
    onConfirm();
  };
  
  // 선택된 옵션의 레이블 가져오기
  const getSelectedOptionLabels = () => {
    return registerData.selectedOptions.map(optionId => {
      const option = TRANSPORT_OPTIONS.find(opt => opt.id === optionId);
      return option ? option.label : optionId;
    });
  };
  
  return (
    <>
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
                  
                  <Label className="text-muted-foreground">화물 품목</Label>
                  <div className="font-medium">{registerData.cargoType || '-'}</div>
                  
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
                  <MapPinIcon className="w-5 h-5 mr-2 text-red-500" />
                  출발지 정보
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <Label className="text-muted-foreground">주소</Label>
                  <div className="font-medium">
                    {registerData.departure.address || '-'}
                    {registerData.departure.detailedAddress && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {registerData.departure.detailedAddress}
                      </div>
                    )}
                  </div>
                  
                  <Label className="text-muted-foreground">회사명</Label>
                  <div className="font-medium">{registerData.departure.company || '-'}</div>
                  
                  <Label className="text-muted-foreground">담당자</Label>
                  <div className="flex items-center">
                    <span className="font-medium">{registerData.departure.name || '-'}</span>
                    {registerData.departure.contact && (
                      <>
                        <Phone className="h-3 w-3 ml-3 mr-1 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{registerData.departure.contact}</span>
                      </>
                    )}
                  </div>
                  
                  <Label className="text-muted-foreground">출발 일시</Label>
                  <div className="font-medium">
                    {registerData.departure.date || '-'} {registerData.departure.time || ''}
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* 도착지 정보 */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium flex items-center">
                  <MapPinIcon className="w-5 h-5 mr-2 text-blue-500" />
                  도착지 정보
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <Label className="text-muted-foreground">주소</Label>
                  <div className="font-medium">
                    {registerData.destination.address || '-'}
                    {registerData.destination.detailedAddress && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {registerData.destination.detailedAddress}
                      </div>
                    )}
                  </div>

                  <Label className="text-muted-foreground">회사명</Label>
                  <div className="font-medium">{registerData.destination.company || '-'}</div>
                  
                  <Label className="text-muted-foreground">담당자</Label>
                  <div className="flex items-center">
                    <span className="font-medium">{registerData.destination.name || '-'}</span>
                    {registerData.destination.contact && (
                      <>
                        <Phone className="h-3 w-3 ml-3 mr-1 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{registerData.destination.contact}</span>
                      </>
                    )}
                  </div>
                  
                  <Label className="text-muted-foreground">도착 일시</Label>
                  <div className="font-medium">
                    {registerData.destination.date || '-'} {registerData.destination.time || ''}
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
            </div> 
          </ScrollArea>
          
          <div className="pt-4 space-y-4">
            <div className="flex justify-between items-center border-t pt-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <HandCoins className="w-5 h-5" />
                <span>예상 거리/금액:</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{registerData.estimatedDistance?.toLocaleString() || 0} km</span>
                <span>/</span>
                <span className="font-bold text-primary">
                  {registerData.estimatedAmount?.toLocaleString() || 0}원
                </span>
              </div>
            </div>
            
            <DialogFooter className="flex justify-between gap-2">
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
                  "min-w-32",
                  registerMutation.isPending && "opacity-80 cursor-not-allowed"
                )}
              >
                {registerMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    등록 중...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CheckCircleIcon className="h-4 w-4" />
                    확인 후 등록
                  </span>
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* 성공 다이얼로그 */}
      <RegisterSuccessDialog
        isOpen={successDialogOpen}
        orderId={registeredOrderId}
        onClose={handleSuccessDialogClose}
      />
    </>
  );
} 