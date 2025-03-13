"use client";

import React, { useState } from 'react';
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
import { Plus } from 'lucide-react';
import { BrokerCompanyForm } from './broker-company-form';
import { IBrokerCompany } from '@/types/broker-company';

interface BrokerCompanyRegisterSheetProps {
  onRegisterSuccess?: (company: IBrokerCompany) => void;
  trigger?: React.ReactNode;
}

export function BrokerCompanyRegisterSheet({
  onRegisterSuccess,
  trigger
}: BrokerCompanyRegisterSheetProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 업체 등록 완료 핸들러
  const handleRegisterSuccess = (company: IBrokerCompany) => {
    setIsSubmitting(false);
    setOpen(false);
    toast.success(`${company.name} 업체가 등록되었습니다.`);
    if (onRegisterSuccess) {
      onRegisterSuccess(company);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            <span>신규 등록</span>
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl overflow-y-auto">
        <SheetHeader className="mb-5">
          <SheetTitle>업체 등록</SheetTitle>
          <SheetDescription>
            운송사, 주선사, 화주 등의 업체 정보를 등록합니다.
          </SheetDescription>
        </SheetHeader>
        
        <BrokerCompanyForm 
          isSubmitting={isSubmitting}
          onSubmit={(company) => {
            setIsSubmitting(true);
            // 실제 API 호출 부분 (현재는 목업 데이터로 대체)
            setTimeout(() => {
              handleRegisterSuccess(company);
            }, 1000);
          }}
        />
      </SheetContent>
    </Sheet>
  );
} 