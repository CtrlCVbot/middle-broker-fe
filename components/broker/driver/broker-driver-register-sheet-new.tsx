"use client";

import React, { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger
} from "@/components/ui/sheet";
import { Plus, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IBrokerDriver } from "@/types/broker-driver";
import { BrokerDriverRegisterForm } from "./broker-driver-register-form";

interface IBrokerDriverRegisterSheetNewProps {
  onRegisterSuccess?: (driver: IBrokerDriver) => void;
  onUpdateSuccess?: (driver: IBrokerDriver) => void;
  driver?: IBrokerDriver;
  trigger?: React.ReactNode;
  mode?: 'register' | 'edit';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function BrokerDriverRegisterSheetNew({ 
  onRegisterSuccess,
  onUpdateSuccess,
  driver,
  trigger,
  mode = 'register',
  open,
  onOpenChange
}: IBrokerDriverRegisterSheetNewProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  // 외부에서 제어되는 경우 내부 상태 동기화
  useEffect(() => {
    if (open !== undefined) {
      setInternalOpen(open);
    }
  }, [open]);
  
  // 내부 상태 변경 시 외부 핸들러 호출
  const handleOpenChange = (newOpen: boolean) => {
    setInternalOpen(newOpen);
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };

  // 제목과 설명 설정
  const title = mode === 'register' ? '차주 등록' : '차주 정보 수정';
  const description = mode === 'register' 
    ? '운송 업무를 수행할 차주의 정보를 등록합니다.'
    : '차주의 정보를 수정합니다.';

  // 트리거 버튼 설정
  const defaultTrigger = mode === 'register' ? (
    <Button className="flex items-center gap-1">
      <Plus className="h-4 w-4" />
      <span>차주 등록</span>
    </Button>
  ) : (
    <Button variant="outline" className="flex items-center gap-1">
      <Edit className="h-4 w-4" />
      <span>수정</span>
    </Button>
  );

  return (
    <Sheet open={open !== undefined ? open : internalOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        {trigger || defaultTrigger}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl overflow-y-auto p-4">
        {/* <SheetHeader className="mb-6">
          <SheetTitle className="text-xl">{title}</SheetTitle>
          <SheetDescription>
            {description}
          </SheetDescription>
        </SheetHeader> */}

        <div className="px-2">
          <BrokerDriverRegisterForm
            onRegisterSuccess={(driver) => {
              if (onRegisterSuccess) {
                onRegisterSuccess(driver);
              }
              handleOpenChange(false);
            }}
            onUpdateSuccess={(driver) => {
              if (onUpdateSuccess) {
                onUpdateSuccess(driver);
              }
              handleOpenChange(false);
            }}
            driver={driver}
            mode={mode}
            onOpenChange={handleOpenChange}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
} 