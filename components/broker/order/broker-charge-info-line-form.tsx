"use client";

//react
import React, { useEffect, useMemo, useRef, useState } from "react";

//ui
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

import { MoreHorizontal } from "lucide-react";


//utils
import { cn } from "@/lib/utils";


import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import type { AmountType } from "@/types/settlement";
import { AMOUNT_TYPES } from "@/types/settlement";

// 기존 인터페이스에 추가
export interface IAdditionalFee {
  id?: string;
  type: AmountType;
  memo: string;
  target: {
    charge: boolean;
    dispatch: boolean;
  };
  amount: string; // 총액이거나 deprecated 예정
  amounts?: {
    charge?: string;
    dispatch?: string;
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

  const [selectedType, setSelectedType] = useState<AmountType>("기본");
  const [maxCount, setMaxCount] = useState(4); // 기본값

  const FAVORITE_TYPES = AMOUNT_TYPES;

  // const visibleTypes = [...FAVORITE_TYPES];
  // const hiddenTypes = ADDITIONAL_FEE_TYPES.filter((type) => !visibleTypes.includes(type));

  //const MAX_VISIBLE_COUNT = 4;

  const allTypes = [...AMOUNT_TYPES];
  //const visibleTypes = allTypes.slice(0, MAX_VISIBLE_COUNT);
  //const hiddenTypes = allTypes.slice(MAX_VISIBLE_COUNT);
  //const visibleTypes = ADDITIONAL_FEE_TYPES.slice(0, maxCount);
  //const hiddenTypes = ADDITIONAL_FEE_TYPES.slice(maxCount);

  const { visibleTypes, hiddenTypes } = useMemo(() => {
    const baseTypes = [...AMOUNT_TYPES];
  
    // 선택된 타입이 없으면 앞에 표시
    const ordered = [selectedType, ...baseTypes.filter(t => t !== selectedType)];
  
    const visible = ordered.slice(0, maxCount);
    const hidden = ordered.slice(maxCount);
  
    return { visibleTypes: visible, hiddenTypes: hidden };
  }, [selectedType, maxCount]);

  

  const badgeContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!badgeContainerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      const itemWidth = 80; // 버튼 평균 폭 (px), 여유 고려
      const calculatedCount = Math.floor(width / itemWidth);
      setMaxCount(calculatedCount);
    });

    observer.observe(badgeContainerRef.current);

    return () => observer.disconnect();
  }, []);

  

  // handleTypeSelect 함수
  // const handleTypeSelect = (type: AdditionalFeeType) => {
  //   const autoTarget = type === "수작업"
  //     ? { charge: true, dispatch: true }
  //     : { ...newFee.target };
  
  //   setNewFee({
  //     ...newFee,
  //     type,
  //     target: autoTarget,
  //   });
  // };
  const handleTypeSelect = (type: AmountType) => {
    setSelectedType(type);
  
    const autoTarget = type === "수작업"
      ? { charge: true, dispatch: true }
      : { ...newFee.target };
  
    setNewFee({
      ...newFee,
      type,
      target: autoTarget,
    });
  };
  

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingFee ? `${newFee.type} 운임 수정` : `${newFee.type} 운임 추가`}
          </DialogTitle>
          <DialogDescription>
            {selectedFeeType ? `${selectedFeeType} 운임 정보를 ${editingFee ? '수정' : '입력'}해주세요.` : '운임 정보를 입력해주세요.'}
          </DialogDescription>
        </DialogHeader>
        
          <div className="space-y-4 py-4">
            {/* 추가금 타입 선택 - 뱃지 버튼 스타일 */} 
            <div
              className="flex items-center justify-between flex-wrap gap-2"
              ref={badgeContainerRef}
            >
              <div className="flex flex-wrap gap-2 overflow-hidden max-w-[calc(100%-48px)]">
                {visibleTypes.map((type) => (
                   <Button
                   key={type}
                   size="sm"
                   variant="ghost"
                   className={cn(
                     "whitespace-nowrap px-2",
                     newFee.type === type && "bg-black text-white"
                   )}
                   onClick={() => {
                     handleTypeSelect(type);
                   }}
                 >
                   {type}
                 </Button>
                ))}
              </div>

              {/* ...버튼 */}
              {hiddenTypes.length > 0 && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="icon" className="w-8 h-8 min-w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-fit">
                    <div className="grid grid-cols-2 gap-2">
                      {hiddenTypes.map((type) => (
                        <Button
                        key={type}
                        size="sm"
                        variant="ghost"
                        className={cn(
                          "whitespace-nowrap px-2",
                          newFee.type === type && "bg-black text-white"
                        )}
                        onClick={() => {
                          handleTypeSelect(type);
                        }}
                      >
                        {type}
                      </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
              
            </div>

            {/* <div
              className="flex items-center justify-between flex-wrap gap-2"
              ref={badgeContainerRef}
            >
              <div className="flex flex-wrap gap-2 overflow-hidden max-w-[calc(100%-48px)]">
                {visibleTypes.map((type) => (
                  <Button
                    key={type}
                    className={cn(
                      "px-3 py-1 rounded-full text-sm border transition whitespace-nowrap",
                      selectedType === type ? "bg-black text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    )}
                    onClick={() => handleTypeSelect(type)}
                  >
                    {type}
                  </Button>
                ))}
              </div>

              {hiddenTypes.length > 0 && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="icon" className="w-8 h-8 min-w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-fit">
                    <div className="grid grid-cols-2 gap-2">
                      {hiddenTypes.map((type) => (
                        <Button
                          key={type}
                          size="sm"
                          variant="ghost"
                          className={cn(
                            "whitespace-nowrap px-2",
                            selectedType === type && "bg-black text-white"
                          )}
                          onClick={() => handleTypeSelect(type)}
                        >
                          {type}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div> */}


            {/* 추가금 타입 및 청구, 배차 선택 - 기본 드롭다운 유지 */}
            <div className="flex justify-between items-center w-full mt-4">
              {/* 왼쪽: 추가금 타입 Select (기본 드롭다운 유지) */}
              {/* <div className="w-[48%]">
                <Select
                  value={newFee.type}
                  onValueChange={(val) => setNewFee({ ...newFee, type: val as AdditionalFeeType })}
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
              </div> */}

              {/* 오른쪽: 대상 선택 */}
              <div className="flex gap-2 justify-end">
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


            {/* 청구 / 배차 선택 및 금액 입력 */}
            {["charge", "dispatch"].map((targetKey) =>
              newFee.target[targetKey as "charge" | "dispatch"] ? (
                <div key={targetKey} className="flex items-center gap-2">
                  <Label className="w-20">
                    {targetKey === "charge" ? "청구 금액" : "배차 금액"}
                  </Label>
                  <Input
                    type="text"
                    className="text-right flex-1"
                    placeholder="₩ 0"
                    value={newFee.amounts?.[targetKey as "charge" | "dispatch"] || ""}
                    onChange={(e) =>
                      setNewFee({
                        ...newFee,
                        amounts: {
                          ...newFee.amounts,
                          [targetKey]: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              ) : null
            )}


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