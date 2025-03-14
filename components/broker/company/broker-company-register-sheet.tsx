"use client";

import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Plus, Edit } from 'lucide-react';
import { BrokerCompanyForm } from './broker-company-form';
import { IBrokerCompany } from '@/types/broker-company';
import { useBrokerCompanyStore } from '@/store/broker-company-store';

interface BrokerCompanyRegisterSheetProps {
  onRegisterSuccess?: (company: IBrokerCompany) => void;
  onUpdateSuccess?: (company: IBrokerCompany) => void;
  company?: IBrokerCompany;
  trigger?: React.ReactNode;
  mode?: 'register' | 'edit';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function BrokerCompanyRegisterSheet({
  onRegisterSuccess,
  onUpdateSuccess,
  company,
  trigger,
  mode = 'register',
  open,
  onOpenChange
}: BrokerCompanyRegisterSheetProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateCompany } = useBrokerCompanyStore();
  
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

  // 업체 등록/수정 완료 핸들러
  const handleSuccess = (updatedCompany: IBrokerCompany) => {
    setIsSubmitting(false);
    handleOpenChange(false);
    
    if (mode === 'register') {
      toast.success(`${updatedCompany.name} 업체가 등록되었습니다.`);
      if (onRegisterSuccess) {
        onRegisterSuccess(updatedCompany);
      }
    } else {
      toast.success(`${updatedCompany.name} 업체 정보가 수정되었습니다.`);
      // 스토어 업데이트
      updateCompany(updatedCompany);
      if (onUpdateSuccess) {
        onUpdateSuccess(updatedCompany);
      }
    }
  };

  // 제목과 설명 설정
  const title = mode === 'register' ? '업체 등록' : '업체 수정';
  const description = mode === 'register' 
    ? '운송사, 주선사, 화주 등의 업체 정보를 등록합니다.'
    : '선택한 업체의 정보를 수정합니다.';

  // 트리거 버튼 설정
  const defaultTrigger = mode === 'register' ? (
    <Button className="flex items-center gap-1">
      <Plus className="h-4 w-4" />
      <span>신규 등록</span>
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
      <SheetContent side="right" className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl overflow-y-auto">
        <SheetHeader className="mb-5">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            {description}
          </SheetDescription>
        </SheetHeader>
        
        <BrokerCompanyForm 
          isSubmitting={isSubmitting}
          initialData={company}
          mode={mode}
          onSubmit={(updatedCompany) => {
            setIsSubmitting(true);
            // 실제 API 호출 부분 (현재는 목업 데이터로 대체)
            setTimeout(() => {
              handleSuccess(updatedCompany);
            }, 1000);
          }}
        />
      </SheetContent>
    </Sheet>
  );
} 