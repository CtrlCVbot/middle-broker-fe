"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

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
import { SeparatorVertical } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import { MoreHorizontal } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";


const TYPES = ["할인", "추가"]; 



const SettlementAdjustmentsAddForm = () => {

  return (
    <Dialog>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            추가금 추가
          </DialogTitle>
          <DialogDescription>
            추가금 정보를 입력해주세요.
          </DialogDescription>
        </DialogHeader>
        
          <div className="space-y-4 py-4">
            {/* 추가금 타입 선택 - 뱃지 버튼 스타일 */} 
            <div
              className="flex items-center justify-between flex-wrap gap-2"
            >
              <div className="flex flex-wrap gap-2 overflow-hidden max-w-[calc(100%-48px)]">
                {TYPES.map((type) => (
                   <Button
                   key={type}
                   size="sm"
                   variant="ghost"
                   className={cn(
                     "whitespace-nowrap px-2",
                     
                   )}
                   
                 >
                   {type}
                 </Button>
                ))}
              </div>
            </div>

            {/* 청구 / 배차 선택 및 금액 입력 */}
            <div className="flex items-center gap-2">
              <Label className="w-20">
                금액
              </Label>
              <Input
                type="text"
                className="text-right flex-1"
                placeholder="₩ 0"                
              />
            </div>


            {/* 메모 */}
            <div className="space-y-2">
              <Label>메모</Label>
              <Input
                type="text"
                placeholder="메모"                
              />
            </div>
            
          </div>
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
          >
            취소
          </Button>
          <Button 
            type="button" 
            variant="default"
          >
            "추가"
          </Button>
        </DialogFooter>
      </DialogContent>      

    </Dialog>
  );
};

export default SettlementAdjustmentsAddForm; 