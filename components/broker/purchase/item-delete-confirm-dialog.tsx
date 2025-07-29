"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

// 스토어
import { useBrokerChargeStore } from "@/store/broker-charge-purchase-store";

interface IItemDeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId?: string;
  adjustmentId?: string;
}

export function ItemDeleteConfirmDialog({
  open,
  onOpenChange,
  itemId,
  adjustmentId
}: IItemDeleteConfirmDialogProps) {

  const { removeItemAdjustment } = useBrokerChargeStore();

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleConfirm = async () => {
    if (!itemId || !adjustmentId) {
      toast.error('삭제할 항목 정보가 없습니다.');
      return;
    }

    try {
      const success = await removeItemAdjustment(itemId, adjustmentId);
      if (success) {
        toast.success("추가금이 삭제되었습니다.");
        handleClose();
      } else {
        toast.error("추가금 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error('추가금 삭제 중 오류:', error);
      toast.error("삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>추가금 삭제 확인</DialogTitle>
          <DialogDescription>
            정말로 이 추가금을 삭제하시겠습니까?
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-end gap-2 mt-6">
          <Button 
            variant="outline" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('추가금 삭제 다이얼로그 취소 버튼 클릭');
              handleClose();
            }}
          >
            취소
          </Button>
          <Button 
            variant="destructive"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('추가금 삭제 다이얼로그 확인 버튼 클릭');
              handleConfirm();
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            삭제
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 