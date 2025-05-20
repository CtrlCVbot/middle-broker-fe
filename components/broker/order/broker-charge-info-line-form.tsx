"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


type AdditionalFeeType = "기본" | "대기" | "수작업" | "왕복" | "톨비" | "수수료" | "현장착불";

export const ADDITIONAL_FEE_TYPES = [
  "기본",
  "대기료",
  "수작업",
  "왕복",
  "톨비",
  "수수료",
  "현장착불"
] as const;

export interface IAdditionalFee {
  id?: string;
  type: AdditionalFeeType;
  amount: string;
  memo: string;
  target: {
    charge: boolean;
    dispatch: boolean;
  };
}

interface IBrokerChargeInfoLineFormProps {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  newFee: IAdditionalFee;
  setNewFee: (fee: IAdditionalFee) => void;
  editingFee: IAdditionalFee | null;
  selectedFeeType: string | null;
  isCompleted: boolean;
  handleAmountChange: (e: React.ChangeEvent<HTMLInputElement>, isDialog?: boolean) => void;
  handleToggleTarget: (type: 'charge' | 'dispatch') => void;
  handleAddFee: () => void;
  handleUpdateFee: () => void;
  handleCancelEdit: () => void;
}

const BrokerChargeInfoLineForm: React.FC<IBrokerChargeInfoLineFormProps> = ({
  dialogOpen,
  setDialogOpen,
  newFee,
  setNewFee,
  editingFee,
  selectedFeeType,
  isCompleted,
  handleAmountChange,
  handleToggleTarget,
  handleAddFee,
  handleUpdateFee,
  handleCancelEdit,
}) => {
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingFee ? "운임 수정" : "운임 추가"}
          </DialogTitle>
          <DialogDescription>
            {selectedFeeType ? `${selectedFeeType} 운임 정보를 ${editingFee ? '수정' : '입력'}해주세요.` : '운임 정보를 입력해주세요.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* 추가금 타입 */}
          <div className="space-y-2">
            <Label>추가금 타입</Label>
            <Select
              value={newFee.type}
              onValueChange={(val) => setNewFee({...newFee, type: val as AdditionalFeeType})}
              disabled={isCompleted}
            >
              <SelectTrigger>
                <SelectValue placeholder="타입 선택" />
              </SelectTrigger>
              <SelectContent>
                {ADDITIONAL_FEE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* 금액 */}
          <div className="space-y-2">
            <Label>금액</Label>
            <Input
              type="text"
              placeholder="금액"
              value={newFee.amount}
              onChange={(e) => handleAmountChange(e, true)}
              disabled={isCompleted}
              className="text-right"
            />
          </div>
          
          {/* 메모 */}
          <div className="space-y-2">
            <Label>메모</Label>
            <Input
              type="text"
              placeholder="메모"
              value={newFee.memo}
              onChange={(e) => setNewFee({...newFee, memo: e.target.value})}
              disabled={isCompleted}
            />
          </div>
          
          {/* 대상 선택 (청구/배차) */}
          <div className="space-y-2">
            <Label>대상</Label>
            <div className="flex gap-3 mt-2">
              <Button
                type="button"
                size="sm"
                variant={newFee.target.charge ? "default" : "outline"}
                onClick={() => handleToggleTarget('charge')}
                disabled={isCompleted}
              >
                청구 {newFee.target.charge ? "✓" : ""}
              </Button>
              <Button
                type="button"
                size="sm"
                variant={newFee.target.dispatch ? "default" : "outline"}
                onClick={() => handleToggleTarget('dispatch')}
                disabled={isCompleted}
              >
                배차 {newFee.target.dispatch ? "✓" : ""}
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleCancelEdit}
            disabled={isCompleted}
          >
            취소
          </Button>
          <Button 
            type="button" 
            onClick={editingFee ? handleUpdateFee : handleAddFee}
            disabled={isCompleted}
          >
            {editingFee ? "수정" : "추가"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BrokerChargeInfoLineForm; 