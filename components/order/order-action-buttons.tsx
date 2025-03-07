"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Edit, 
  X, 
  FileText, 
  Copy,
  AlertTriangle
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useOrderDetailStore } from "@/store/order-detail-store";
import { toast } from "@/components/ui/use-toast";

interface OrderActionButtonsProps {
  orderNumber: string;
  className?: string;
}

export function OrderActionButtons({ orderNumber, className }: OrderActionButtonsProps) {
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);
  const { isActionAvailable, closeSheet } = useOrderDetailStore();
  
  // 화물 정보 수정 핸들러 (실제로는 추후 구현)
  const handleEdit = () => {
    toast({
      title: "수정 기능",
      description: `화물 ${orderNumber}에 대한 수정 기능은 아직 구현되지 않았습니다.`,
    });
  };
  
  // 배차 취소 핸들러 (실제로는 추후 구현)
  const handleCancel = () => {
    toast({
      title: "배차 취소 완료",
      description: `화물 ${orderNumber}의 배차가 취소되었습니다.`,
      variant: "destructive",
    });
    setCancelDialogOpen(false);
    closeSheet();
  };
  
  // 인수증 발급 핸들러 (실제로는 추후 구현)
  const handleReceipt = () => {
    toast({
      title: "인수증 발급",
      description: `화물 ${orderNumber}의 인수증이 발급되었습니다.`,
    });
  };
  
  // 화물 정보 복사 핸들러
  const handleCopy = () => {
    // 실제로는 포맷팅된 정보를 클립보드에 복사
    navigator.clipboard.writeText(`화물번호: ${orderNumber}`);
    toast({
      title: "화물 정보 복사 완료",
      description: "화물 정보가 클립보드에 복사되었습니다.",
    });
  };
  
  return (
    <>
      <div className={cn("flex flex-wrap gap-2", className)}>
        {/* 수정 버튼 */}
        <Button
          variant="outline"
          className="flex-1 sm:flex-none"
          onClick={handleEdit}
          disabled={!isActionAvailable('edit')}
        >
          <Edit className="h-4 w-4 mr-2" />
          화물 수정
        </Button>
        
        {/* 배차 취소 버튼 */}
        <Button
          variant="destructive"
          className="flex-1 sm:flex-none"
          onClick={() => setCancelDialogOpen(true)}
          disabled={!isActionAvailable('cancel')}
        >
          <X className="h-4 w-4 mr-2" />
          배차 취소
        </Button>
        
        {/* 인수증 발급 버튼 */}
        <Button
          variant="outline"
          className="flex-1 sm:flex-none"
          onClick={handleReceipt}
          disabled={!isActionAvailable('receipt')}
        >
          <FileText className="h-4 w-4 mr-2" />
          인수증 발급
        </Button>
        
        {/* 복사하기 버튼 */}
        <Button
          variant="secondary"
          className="flex-1 sm:flex-none"
          onClick={handleCopy}
        >
          <Copy className="h-4 w-4 mr-2" />
          복사하기
        </Button>
      </div>
      
      {/* 배차 취소 확인 다이얼로그 */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-destructive mr-2" />
              배차 취소 확인
            </AlertDialogTitle>
            <AlertDialogDescription>
              화물 번호 <span className="font-semibold">{orderNumber}</span>의 배차를 정말 취소하시겠습니까?
              <br />이 작업은 취소할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel}>배차 취소</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 