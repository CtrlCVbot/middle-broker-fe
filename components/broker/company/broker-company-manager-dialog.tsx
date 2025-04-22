"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { UserPlus, Edit, Loader2 } from 'lucide-react';
import { BrokerCompanyManagerForm } from './broker-company-manager-form';
import { IBrokerCompanyManager } from '@/types/broker-company';
import { useBrokerCompanyManagerStore } from '@/store/broker-company-manager-store';

interface BrokerCompanyManagerDialogProps {
  companyId: string;
  manager?: IBrokerCompanyManager; // 수정 모드에서 사용
  trigger?: React.ReactNode;
  mode?: 'add' | 'edit';
  onSuccess?: (manager: IBrokerCompanyManager) => void;
}

export function BrokerCompanyManagerDialog({
  companyId,
  manager,
  trigger,
  mode = 'add',
  onSuccess
}: BrokerCompanyManagerDialogProps) {
  const [open, setOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { addManager, updateManager, loadManagers } = useBrokerCompanyManagerStore();
  
  // 담당자 추가/수정 처리 핸들러
  const handleFormSubmit = async (formData: IBrokerCompanyManager) => {
    console.log(`🔄 담당자 ${mode === 'add' ? '추가' : '수정'} 시작`, {
      name: formData.name,
      email: formData.email,
      timestamp: new Date().toISOString()
    });
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // 다이얼로그는 아직 닫지 않고 API 호출이 완료될 때까지 대기
      if (mode === 'add') {
        // 새 담당자 생성 시 회사 ID 추가
        const newManager = {
          ...formData,
          companyId: companyId
        };
        
        console.log('📤 담당자 추가 요청 데이터:', {
          name: newManager.name,
          email: newManager.email,
          roles: newManager.roles
        });
        
        // 실제 API 요청이 완료될 때까지 기다립니다
        console.log('📡 addManager API 호출 시작...');
        const result = await addManager(newManager);
        console.log('✅ 담당자 추가 API 호출 성공:', result);
        
        if (result) {
          // 성공 시 토스트 메시지 표시
          toast.success(`${formData.name} 담당자가 등록되었습니다.`);
          
          // 다이얼로그 닫기
          console.log('담당자 추가 완료, 다이얼로그 닫기 예약');
          setTimeout(() => {
            console.log('담당자 추가 완료, 지연 후 다이얼로그 닫기 실행');
            setOpen(false);
          }, 100);
          
          // 담당자 목록 데이터 강제 리로드 (성공 후 즉시 실행)
          console.log('🔄 담당자 목록 강제 리로드 (추가 후)');
          loadManagers(companyId);
          
          // 콜백 실행 (데이터 리로드 등)
          if (onSuccess) {
            onSuccess(result);
          }
        } else {
          // 결과가 없는 경우 오류 처리
          throw new Error('담당자 등록 실패: 서버에서 응답이 없습니다.');
        }
      } else {
        // 기존 담당자 정보 업데이트
        const updatedManager = {
          ...manager,
          ...formData,
          companyId: companyId
        };
        
        console.log('📤 담당자 수정 요청 데이터:', {
          id: updatedManager.id,
          name: updatedManager.name,
          changes: Object.keys(formData),
          updateManager: updatedManager
        });
        
        // 실제 API 요청이 완료될 때까지 기다립니다
        console.log('📡 updateManager API 호출 시작...');
        const result = await updateManager(updatedManager);
        console.log('✅ 담당자 수정 API 호출 성공:', result);
        
        if (result) {
          // 성공 시 토스트 메시지 표시
          toast.success(`${formData.name} 담당자 정보가 수정되었습니다.`);
          
          // 다이얼로그 닫기
          console.log('담당자 수정 완료, 다이얼로그 닫기 예약');
          setTimeout(() => {
            console.log('담당자 수정 완료, 지연 후 다이얼로그 닫기 실행');
            setOpen(false);
          }, 100);
          
          // 담당자 목록 데이터 강제 리로드 (성공 후 즉시 실행)
          console.log('🔄 담당자 목록 강제 리로드 (수정 후)');
          loadManagers(companyId);
          
          // 콜백 실행 (데이터 리로드 등)
          if (onSuccess) {
            onSuccess(result);
          }
        } else {
          // 결과가 없는 경우 오류 처리
          throw new Error('담당자 수정 실패: 서버에서 응답이 없습니다.');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      console.error('❌ 담당자 처리 오류:', err);
      setError(errorMessage);
      toast.error(`담당자 ${mode === 'add' ? '등록' : '수정'} 중 오류가 발생했습니다: ${errorMessage}`);
      // 오류 발생 시 다이얼로그를 닫지 않음
    } finally {
      setIsProcessing(false);
    }
  };
  
  // 다이얼로그 제목 및 설명
  const title = mode === 'add' ? '담당자 추가' : '담당자 정보 수정';
  const description = mode === 'add' 
    ? '새로운 담당자 정보를 입력하세요'
    : '담당자 정보를 수정하세요';
  
  // 기본 트리거 버튼
  const defaultTrigger = mode === 'add' ? (
    <Button className="flex items-center gap-1">
      <UserPlus className="h-4 w-4" />
      <span>담당자 추가</span>
    </Button>
  ) : (
    <Button variant="ghost" size="sm">
      <Edit className="h-4 w-4 mr-1" />
      수정
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <BrokerCompanyManagerForm
          companyId={companyId}
          manager={manager}
          onSubmit={handleFormSubmit}
          isSubmitting={isProcessing}
          globalError={error}
        />
        
        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isProcessing}
          >
            취소
          </Button>
          <Button
            type="button"
            disabled={isProcessing}
            onClick={(e) => {
              // 이벤트 버블링 방지
              e.stopPropagation();
              // 폼 수동 제출
              const formElement = document.getElementById('manager-form') as HTMLFormElement;
              if (formElement) {
                // 커스텀 이벤트 발생 (form 컴포넌트 내에서 e.preventDefault()를 처리함)
                const submitEvent = new Event('submit', { cancelable: true, bubbles: true });
                formElement.dispatchEvent(submitEvent);
              }
            }}
          >
            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'add' ? '등록하기' : '수정하기'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 