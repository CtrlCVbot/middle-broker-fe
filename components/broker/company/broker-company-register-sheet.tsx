"use client";

import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Plus, Edit, Loader2 } from 'lucide-react';
import { BrokerCompanyForm } from './broker-company-form';
import { IBrokerCompany } from '@/types/broker-company';
import { 
  useBrokerCompanyStore, 
  useBrokerCompanyById 
} from '@/store/broker-company-store';
import { 
  useCreateCompany, 
  useUpdateCompany 
} from '@/store/company-store';
import { convertLegacyToApiCompany } from '@/types/company';

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
  const { updateCompany } = useBrokerCompanyStore();
  
  // API 훅 사용
  const createCompanyMutation = useCreateCompany();
  const updateCompanyMutation = useUpdateCompany();
  
  // 편집 모드에서 최신 데이터 조회 (ID가 있는 경우)
  const companyQuery = useBrokerCompanyById(mode === 'edit' && company ? company.id : '');
  
  // 로딩 상태 관리
  const isLoading = createCompanyMutation.isPending || 
                    updateCompanyMutation.isPending || 
                    (mode === 'edit' && companyQuery.isLoading);
  
  // 회사 데이터 (최신 데이터 사용)
  const companyData = mode === 'edit' && companyQuery.data ? companyQuery.data : company;
  
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

  // 업체 등록/수정 처리 핸들러
  const handleSubmit = async (formData: IBrokerCompany) => {
    try {
      if (mode === 'register') {
        // 임시 사용자 ID (실제로는 인증된 사용자 ID를 사용해야 함)
        const requestUserId = 'system-user-id';
        
        // 레거시 타입을 API 요청 포맷으로 변환
        const apiData = convertLegacyToApiCompany(formData, requestUserId);
        
        // API 호출로 업체 생성
        const result = await createCompanyMutation.mutateAsync(apiData);
        
        // 성공 처리
        toast.success(`${formData.name} 업체가 등록되었습니다.`);
        
        // 콜백 실행
        if (onRegisterSuccess) {
          onRegisterSuccess(formData);
        }
      } else if (mode === 'edit' && formData.id) {
        // 임시 사용자 ID (실제로는 인증된 사용자 ID를 사용해야 함)
        const requestUserId = 'system-user-id';
        
        // 레거시 타입을 API 요청 포맷으로 변환
        const apiData = convertLegacyToApiCompany(formData, requestUserId);
        
        // API 호출로 업체 수정
        await updateCompanyMutation.mutateAsync({ 
          id: formData.id,
          data: apiData
        });
        
        // 스토어 업데이트
        updateCompany(formData);
        
        // 성공 처리
        toast.success(`${formData.name} 업체 정보가 수정되었습니다.`);
        
        // 콜백 실행
        if (onUpdateSuccess) {
          onUpdateSuccess(formData);
        }
      }
      
      // 시트 닫기
      handleOpenChange(false);
    } catch (error) {
      // 오류 처리
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      toast.error(`업체 ${mode === 'register' ? '등록' : '수정'} 중 오류가 발생했습니다: ${errorMessage}`);
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
        
        {/* 로딩 상태 (편집 모드에서 데이터 로딩 중) */}
        {mode === 'edit' && companyQuery.isLoading && (
          <div className="flex justify-center items-center h-[calc(100vh-200px)]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">업체 정보를 불러오는 중입니다...</span>
          </div>
        )}
        
        {/* 에러 상태 (편집 모드에서 데이터 로딩 실패) */}
        {mode === 'edit' && companyQuery.isError && (
          <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)] text-destructive">
            <p className="mb-4">업체 정보를 불러오는 중 오류가 발생했습니다.</p>
            <Button variant="outline" onClick={() => companyQuery.refetch()}>
              다시 시도
            </Button>
          </div>
        )}
        
        {/* 폼 (데이터가 준비되면 표시) */}
        {(mode === 'register' || (mode === 'edit' && companyData && !companyQuery.isLoading)) && (
          <BrokerCompanyForm 
            isSubmitting={isLoading}
            initialData={companyData}
            mode={mode}
            onSubmit={handleSubmit}
          />
        )}
      </SheetContent>
    </Sheet>
  );
} 