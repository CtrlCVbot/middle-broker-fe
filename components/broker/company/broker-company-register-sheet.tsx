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
// 기존 스토어 import 주석 처리
// import { 
//   useBrokerCompanyStore, 
//   useBrokerCompanyById 
// } from '@/store/broker-company-store';
import { 
  useCreateCompany, 
  useUpdateCompany,
  useCompany
} from '@/store/company-store';
import { convertLegacyToApiCompany } from '@/types/company';
import { v4 as uuidv4 } from 'uuid';
import { useQueryClient } from '@tanstack/react-query';
import { updateCompanyAndInvalidateCache } from '@/services/company-service';

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
  // const { updateCompany } = useBrokerCompanyStore(); // 기존 스토어 사용 코드 주석 처리
  
  // 추가: Query Client 가져오기
  const queryClient = useQueryClient();
  
  // API 훅 사용
  const createCompanyMutation = useCreateCompany();
  const updateCompanyMutation = useUpdateCompany();
  
  // 편집 모드에서 최신 데이터 조회 (ID가 있는 경우)
  // const companyQuery = useBrokerCompanyById(mode === 'edit' && company ? company.id : ''); // 기존 스토어 사용 코드 주석 처리
  // 새로운 스토어 훅 사용
  const companyQuery = useCompany(mode === 'edit' && company ? company.id : '');
  
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
        
        // 디버깅용 로그 추가
        console.log('등록 - 원본 폼 데이터:', formData);
        
        // 레거시 타입을 API 요청 포맷으로 변환
        const apiData = convertLegacyToApiCompany(formData);
        
        // 변환된 API 데이터 로깅
        console.log('등록 - 변환된 API 데이터:', apiData);
        
        try {
          // API 호출로 업체 생성
          const result = await createCompanyMutation.mutateAsync(apiData);
          
          // 성공 처리
          toast.success(`${formData.name} 업체가 등록되었습니다.`);
          
          // 콜백 실행
          if (onRegisterSuccess) {
            onRegisterSuccess(formData);
          }
          
          // 작업 완료 후 명시적으로 시트 닫기
          console.log('업체 등록 완료, 시트 닫기 예약');
          // 이벤트 루프의 다음 틱으로 지연시켜 닫기
          setTimeout(() => {
            console.log('업체 등록 완료, 지연 후 시트 닫기 실행');
            handleOpenChange(false);
          }, 100);
        } catch (registerError) {
          console.error('업체 등록 오류:', registerError);
          const errorMessage = registerError instanceof Error ? registerError.message : '알 수 없는 오류';
          toast.error(`업체 등록 중 오류가 발생했습니다: ${errorMessage}`);
          // 오류 발생 시 시트를 닫지 않음
        }
      } else if (mode === 'edit' && formData.id) {
        
        // 디버깅용 로그 추가
        console.log('✏️ 수정 시작 - 원본 폼 데이터:', {
          id: formData.id,
          name: formData.name,
          type: formData.type
        });
        
        // 레거시 타입을 API 요청 포맷으로 변환
        const apiData = convertLegacyToApiCompany(formData);
        
        // 변환된 API 데이터 요약 로깅
        console.log('📝 수정 - 변환된 API 데이터 요약:', {
          id: formData.id,
          name: apiData.name,
          type: apiData.type
        });
        
        try {
          // 직접 서비스 함수 호출 (뮤테이션 대신)
          console.log('🔄 업체 수정 및 캐시 무효화 함수 호출');
          const { company: updatedCompany, cacheInvalidated } = 
            await updateCompanyAndInvalidateCache(formData.id, apiData);
          
          console.log('✅ 업데이트 완료!', {
            id: updatedCompany.id, 
            name: updatedCompany.name,
            cacheInvalidated
          });
          
          // 캐시 무효화 결과에 따른 추가 조치
          if (!cacheInvalidated) {
            console.log('⚠️ 캐시 무효화가 제대로 작동하지 않았습니다. 추가 캐시 무효화 진행...');
            // 1. React Query 캐시 무효화
            await queryClient.invalidateQueries({ queryKey: ['companies'] });
            await queryClient.invalidateQueries({ queryKey: ['company', formData.id] });
            
            // 2. 캐시된 데이터 리셋
            queryClient.setQueryData(['company', formData.id], null);
            
            // 3. 캐시 무효화 후 강제 리로드
            setTimeout(() => {
              companyQuery.refetch();
              queryClient.refetchQueries({ queryKey: ['companies'] });
              console.log('♻️ 데이터 강제 리로드 요청');
            }, 300);
          }
          
          // 성공 처리
          toast.success(`${formData.name} 업체 정보가 수정되었습니다. 캐시가 업데이트되었습니다.`);
          
          // 콜백 실행
          if (onUpdateSuccess) {
            onUpdateSuccess(formData);
          }
          
          // 작업 완료 후 명시적으로 시트 닫기
          console.log('업체 수정 완료, 시트 닫기 예약');
          // 이벤트 루프의 다음 틱으로 지연시켜 닫기
          setTimeout(() => {
            console.log('업체 수정 완료, 지연 후 시트 닫기 실행');
            handleOpenChange(false);
          }, 100);
        } catch (updateError) {
          // 업데이트 특정 오류 처리
          console.error('업체 수정 오류:', updateError);
          
          // AxiosError에서 상세 정보 추출
          if (updateError && typeof updateError === 'object' && 'response' in updateError) {
            const response = (updateError as any).response;
            console.error('API 응답 데이터:', response?.data);
            
            // 오류 메시지에 상세 정보 포함
            const detailsMsg = response?.data?.details ? 
              `상세 오류: ${JSON.stringify(response?.data?.details)}` : '';
            
            toast.error(`업체 수정 중 오류가 발생했습니다: ${response?.data?.message || '알 수 없는 오류'} ${detailsMsg}`);
          } else {
            // 일반 오류
            const errorMessage = updateError instanceof Error ? updateError.message : '알 수 없는 오류';
            toast.error(`업체 수정 중 오류가 발생했습니다: ${errorMessage}`);
          }
          // 오류 발생 시 시트를 닫지 않음
        }
      }
    } catch (error) {
      // 전역 오류 처리 (위에서 각각의 특정 오류가 처리되지 않은 경우만 실행됨)
      console.error('API 요청 중 전역 오류:', error);
      
      if (!(error && typeof error === 'object' && 'response' in error)) {
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
        toast.error(`업체 ${mode === 'register' ? '등록' : '수정'} 중 오류가 발생했습니다: ${errorMessage}`);
      }
      // 전역 오류 발생 시 시트를 닫지 않음
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
  ) : null; // 수정 모드일 때는 기본 트리거 버튼을 표시하지 않음

  return (
    <Sheet open={open !== undefined ? open : internalOpen} onOpenChange={handleOpenChange}>
      {/* trigger가 제공된 경우에만 SheetTrigger를 표시 */}
      {trigger && (
        <SheetTrigger asChild>
          {trigger}
        </SheetTrigger>
      )}
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl overflow-y-auto"
        onPointerDownCapture={(e) => {
          // 시트 내부 클릭 이벤트가 상위로 전파되지 않도록 방지
          e.stopPropagation();
        }}
      >
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
            initialData={companyData as IBrokerCompany}
            mode={mode}
            onSubmit={handleSubmit}
          />
        )}
      </SheetContent>
    </Sheet>
  );
} 