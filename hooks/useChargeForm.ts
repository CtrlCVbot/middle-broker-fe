"use client";

import { useState } from 'react';
import { IAdditionalFeeInput } from '@/types/broker-charge';
import { IAdditionalFee } from "@/components/broker/order/broker-charge-info-line-form";
import { toast } from '@/components/ui/use-toast';

interface UseChargeFormOptions {
  // 백엔드 저장 관련 옵션
  saveToBackend?: boolean;
  addCharge?: (fee: IAdditionalFeeInput, orderId: string, dispatchId?: string) => Promise<boolean>;
  orderId?: string;
  dispatchId?: string;
  
  // 콜백 옵션
  onAdditionalFeeAdded?: (fee: IAdditionalFee) => void;
  
  // 초기값 옵션
  initialFeeType?: string;
}

export function useChargeForm(options: UseChargeFormOptions = {}) {
  // 상태 관리
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<IAdditionalFee | null>(null);
  const [selectedFeeType, setSelectedFeeType] = useState<string | null>(options.initialFeeType || null);
  const [newFee, setNewFee] = useState<IAdditionalFee>({
    type: options.initialFeeType || "대기" as any,
    amount: "",
    memo: "",
    target: { charge: true, dispatch: true }
  });

  // 다이얼로그 열기
  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  // 금액 입력 핸들러
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d-]/g, '');
    setNewFee({ ...newFee, amount: value });
  };

  // 타겟 토글 핸들러 (청구/배차)
  const handleToggleTarget = (target: 'charge' | 'dispatch') => {
    setNewFee({
      ...newFee,
      target: {
        ...newFee.target,
        [target]: !newFee.target[target]
      }
    });
  };

  // 추가금 항목 추가
  const handleAddFee = async () => {
    console.log("newFee : ", newFee);
    // 유효성 검사: amount 또는 amounts 필드 확인
    if (//(!newFee.amount || isNaN(Number(newFee.amount))) && 
        (!newFee.amounts || (!newFee.amounts.charge && !newFee.amounts.dispatch))) {
      toast({
        title: "금액을 입력해주세요",
        variant: "destructive"
      });
      return;
    }
    
    const fee: IAdditionalFee = {
      id: Date.now().toString(),
      ...newFee
    };


    console.log("options : ", options);
    // 백엔드 저장 옵션이 활성화되어 있고 필요한 데이터가 있으면 API 호출
    if (options.saveToBackend && options.addCharge && options.orderId) {
      try {
        // 추가 비용을 IAdditionalFeeInput으로 변환
        const feeInput: IAdditionalFeeInput = {
          type: fee.type,
          amount: fee.amount,
          memo: fee.memo,
          target: { ...fee.target },
          amounts: fee.amounts
        };
        
        // addCharge 함수 호출하여 데이터 저장
        const success = await options.addCharge(feeInput, options.orderId, options.dispatchId);
        
        if (success) {
          toast({
            title: "운임 정보 추가 완료",
            description: `${fee.type} 운임이 성공적으로 추가되었습니다.`,
            variant: "default"
          });
          
          // 추가된 추가금 처리 (콜백 함수 호출)
          if (options.onAdditionalFeeAdded) {
            options.onAdditionalFeeAdded(fee);
          }
        } else {
          toast({
            title: "운임 정보 추가 실패",
            description: "운임 정보 추가 중 오류가 발생했습니다.",
            variant: "destructive"
          });
          return; // 실패하면 여기서 중단
        }
      } catch (error) {
        console.error('운임 추가 중 오류 발생:', error);
        toast({
          title: "운임 정보 추가 실패",
          description: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
          variant: "destructive"
        });
        return; // 오류 발생 시 중단
      }
    } else {
      // 백엔드 저장이 비활성화된 경우 (기존 cost-card의 동작)
      if (options.onAdditionalFeeAdded) {
        options.onAdditionalFeeAdded(fee);
      }
    }
    
    // 상태 초기화
    resetNewFee();
    setDialogOpen(false);
  };

  // 추가금 항목 수정
  const handleUpdateFee = () => {
    // 실제 구현 시 필요하면 추가
    handleCancelLineEdit();
  };

  // 수정 취소
  const handleCancelLineEdit = () => {
    setEditingFee(null);
    resetNewFee();
    setDialogOpen(false);
  };

  // 새 추가금 입력 상태 리셋
  const resetNewFee = () => {
    setNewFee({ 
      type: options.initialFeeType || "대기" as any, 
      amount: "", 
      memo: "", 
      target: { charge: true, dispatch: true } 
    });
    setSelectedFeeType(null);
  };

  // 기본 운임으로 설정하는 함수
  const setBasicFee = () => {
    setNewFee({
      type: "기본" as any,
      amount: "",
      memo: "",
      target: { charge: true, dispatch: true }
    });
    setSelectedFeeType("기본");
  };

  return {
    // 상태
    dialogOpen,
    setDialogOpen,
    editingFee,
    setEditingFee,
    selectedFeeType,
    setSelectedFeeType,
    newFee,
    setNewFee,
    
    // 이벤트 핸들러
    handleOpenDialog,
    handleAmountChange,
    handleToggleTarget,
    handleAddFee,
    handleUpdateFee,
    handleCancelLineEdit,
    resetNewFee,
    setBasicFee
  };
} 