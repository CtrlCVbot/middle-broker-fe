"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save } from "lucide-react";
import { toast } from "sonner";

// 타입
import { 
  ISalesItemAdjustment,
  ICreateItemAdjustmentInput,
  IUpdateItemAdjustmentInput,
  BundleAdjType
} from "@/types/broker-charge";

// 스토어
import { useBrokerChargeStore } from "@/store/broker-charge-store";

interface IItemAdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId?: string;
  adjustmentId?: string;
  adjustment?: ISalesItemAdjustment;
}

interface IAdjustmentFormData {
  type: BundleAdjType;
  description: string;
  amount: string;
  taxAmount: string;
}

const initialFormData: IAdjustmentFormData = {
  type: 'surcharge',
  description: '',
  amount: '',
  taxAmount: ''
};

export function ItemAdjustmentDialog({
  open,
  onOpenChange,
  itemId,
  adjustmentId,
  adjustment
}: IItemAdjustmentDialogProps) {
  const [formData, setFormData] = useState<IAdjustmentFormData>(initialFormData);
  
  const {
    addItemAdjustment,
    editItemAdjustment,
    adjustmentsLoading
  } = useBrokerChargeStore();

  const isEditMode = Boolean(adjustmentId && adjustment);

  // 수정 모드일 때 기존 데이터로 폼 초기화
  useEffect(() => {
    if (isEditMode && adjustment) {
      setFormData({
        type: adjustment.type,
        description: adjustment.description || '',
        amount: adjustment.amount.toString(),
        taxAmount: adjustment.taxAmount.toString()
      });
    } else {
      setFormData(initialFormData);
    }
  }, [isEditMode, adjustment, open]);

  const handleClose = () => {
    setFormData(initialFormData);
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    if (!itemId) {
      toast.error('화물 항목 ID가 필요합니다.');
      return;
    }

    const amount = parseFloat(formData.amount);
    const taxAmount = parseFloat(formData.taxAmount) || 0;

    if (isNaN(amount) || amount <= 0) {
      toast.error('유효한 금액을 입력해주세요.');
      return;
    }

    try {
      if (isEditMode && adjustmentId) {
        // 수정
        const updateData: IUpdateItemAdjustmentInput = {
          type: formData.type,
          description: formData.description || undefined,
          amount,
          taxAmount
        };
        
        const success = await editItemAdjustment(itemId, adjustmentId, updateData);
        if (success) {
          toast.success('개별 추가금이 수정되었습니다.');
          handleClose();
        } else {
          toast.error('개별 추가금 수정에 실패했습니다.');
        }
      } else {
        // 생성
        const createData: ICreateItemAdjustmentInput = {
          type: formData.type,
          description: formData.description || undefined,
          amount,
          taxAmount
        };
        
        const success = await addItemAdjustment(itemId, createData);
        if (success) {
          toast.success('개별 추가금이 추가되었습니다.');
          handleClose();
        } else {
          toast.error('개별 추가금 추가에 실패했습니다.');
        }
      }
    } catch (error) {
      console.error('개별 추가금 처리 중 오류:', error);
      toast.error('처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? '개별 추가금 수정' : '개별 추가금 추가'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">구분</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value: BundleAdjType) => 
                setFormData(prev => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="구분 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="surcharge">추가 요금</SelectItem>
                <SelectItem value="discount">할인</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Input
              id="description"
              placeholder="추가금 설명 (선택사항)"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">금액</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="taxAmount">세금</Label>
            <Input
              id="taxAmount"
              type="number"
              placeholder="0"
              value={formData.taxAmount}
              onChange={(e) => setFormData(prev => ({ ...prev, taxAmount: e.target.value }))}
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={handleClose}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={adjustmentsLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isEditMode ? '수정' : '추가'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 